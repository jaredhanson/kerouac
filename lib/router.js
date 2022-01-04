/**
 * Module dependencies.
 */
var Route = require('./route')
  , Layer = require('./layer')
  , mixin = require('utils-merge')
  , flatten = require('array-flatten')
  , setPrototypeOf = require('setprototypeof')
  , debug = require('debug')('kerouac:router');

var objectRegExp = /^\[object (\S+)\]$/;
var slice = Array.prototype.slice;
var toString = Object.prototype.toString;


/**
 * Initialize a new `Router`.
 *
 * @api private
 */
var proto = module.exports = function(options) {
  var opts = options || {};
  
  function router(page, next) {
    router.handle(page, next);
  }
  
  // mixin Router class functions
  setPrototypeOf(router, proto)
  
  router.params = {};
  router._params = [];
  router.caseSensitive = opts.caseSensitive;
  router.mergeParams = opts.mergeParams;
  router.strict = opts.strict;
  router.stack = [];
  
  return router;
}

proto.handle = function handle(page, out) {
  var self = this;

  debug('dispatching %s', page.path);

  var idx = 0;
  var removed = '';
  var slashAdded = false;
  var paramcalled = {};

  // middleware and routes
  var stack = self.stack;

  // manage inter-router variables
  var parentParams = page.params;
  var parentPath = page.basePath || '';
  var done = restore(out, page, 'basePath', 'next', 'params');

  // setup next layer
  page.next = next;
  
  // setup basic page values
  page.basePath = parentPath;
  page.originalPath = page.originalPath || page.path;
  
  next();

  function next(err) {
    var layerError = err === 'route'
      ? null
      : err;

    // remove added slash
    if (slashAdded) {
      page.path = req.path.substr(1);
      slashAdded = false;
    }

    // restore altered req.path
    if (removed.length !== 0) {
      page.basePath = parentPath;
      page.path = removed;
      removed = '';
    }

    // signal to exit router
    if (layerError === 'router') {
      setImmediate(done, null);
      return;
    }

    // no more matching layers
    if (idx >= stack.length) {
      setImmediate(done, layerError);
      return;
    }

    // get pathname of request
    var path = page.path;

    if (path == null) {
      return done(layerError);
    }

    // find next matching layer
    var layer;
    var match;
    var route;

    while (match !== true && idx < stack.length) {
      layer = stack[idx++];
      match = matchLayer(layer, path);
      route = layer.route;
      
      if (typeof match !== 'boolean') {
        // hold on to layerError
        layerError = layerError || match;
      }

      if (match !== true) {
        continue;
      }

      if (!route) {
        // process non-route handlers normally
        continue;
      }

      if (layerError) {
        // routes do not match with a pending error
        match = false;
        continue;
      }
    }

    // no match
    if (match !== true) {
      return done(layerError);
    }
    
    // store route for dispatch on change
    if (route) {
      page.route = route;
    }

    // Capture one-time layer values
    page.params = self.mergeParams
      ? mergeParams(layer.params, parentParams)
      : layer.params;
    var layerPath = layer.path;
    
    // this should be done for the layer
    self.process_params(layer, paramcalled, page, function(err) {
      if (err) {
        return next(layerError || err);
      }

      if (route) {
        return layer.handle_request(page, next);
      }
      
      trim_prefix(layer, layerError, layerPath, path);
    });
  }

  function trim_prefix(layer, layerError, layerPath, path) {
    if (layerPath.length !== 0) {
      // Validate path is a prefix match
      if (layerPath !== path.substr(0, layerPath.length)) {
        next(layerError)
        return
      }
      
      // Validate path breaks on a path separator
      var c = path[layerPath.length]
      if (c && c !== '/' && c !== '.') return next(layerError)

      // Trim off the part of the path that matches the route
      // middleware (.use stuff) needs to have the path stripped
      debug('trim prefix (%s) from path %s', layerPath, page.path);
      removed = layerPath;
      page.path = page.path.substr(removed.length);

      // Ensure leading slash
      if (page.path[0] !== '/') {
        page.path = '/' + page.path;
        slashAdded = true;
      }

      // Setup base path (no trailing slash)
      page.basePath = parentPath + (removed[removed.length - 1] === '/'
        ? removed.substring(0, removed.length - 1)
        : removed);
    }

    debug('%s %s : %s', layer.name, layerPath, page.originalPath);

    if (layerError) {
      layer.handle_error(layerError, page, next);
    } else {
      layer.handle_request(page, next);
    }
  }
}

proto.process_params = function process_params(layer, called, page, done) {
  var params = this.params;

  // captured parameters from the layer, keys and values
  var keys = layer.keys;

  // fast track
  if (!keys || keys.length === 0) {
    return done();
  }

  var i = 0;
  var name;
  var paramIndex = 0;
  var key;
  var paramVal;
  var paramCallbacks;
  var paramCalled;
  
  // process params in order
  // param callbacks can be async
  function param(err) {
    if (err) {
      return done(err);
    }

    if (i >= keys.length ) {
      return done();
    }
    
    paramIndex = 0;
    key = keys[i++];
    name = key.name;
    paramVal = page.params[name];
    paramCallbacks = params[name];
    paramCalled = called[name];

    if (paramVal === undefined || !paramCallbacks) {
      return param();
    }

    // param previously called with same value or error occurred
    if (paramCalled && (paramCalled.match === paramVal
      || (paramCalled.error && paramCalled.error !== 'route'))) {
      // restore value
      page.params[name] = paramCalled.value;

      // next param
      return param(paramCalled.error);
    }

    called[name] = paramCalled = {
      error: null,
      match: paramVal,
      value: paramVal
    };

    paramCallback();
  }

  // single param callbacks
  function paramCallback(err) {
    var fn = paramCallbacks[paramIndex++];

    // store updated value
    paramCalled.value = page.params[key.name];

    if (err) {
      // store error
      paramCalled.error = err;
      param(err);
      return;
    }

    if (!fn) return param();

    try {
      fn(page, paramCallback, paramVal, key.name);
    } catch (e) {
      paramCallback(e);
    }
  }

  param();
};

proto.use = function use(fn) {
  var offset = 0
    , path = '/';
  
  // default path to '/'
  // disambiguate router.use([fn])
  if (typeof fn !== 'function') {
    var arg = fn;
    while (Array.isArray(arg) && arg.length !== 0) {
      arg = arg[0];
    }
    // first arg is the path
    if (typeof arg !== 'function') {
      offset = 1;
      path = fn;
    }
  }
  
  var callbacks = flatten(slice.call(arguments, offset));
  if (callbacks.length === 0) {
    throw new TypeError('Router.use() requires a middleware function')
  }
  
  for (var i = 0; i < callbacks.length; i++) {
    var fn = callbacks[i];
    if (typeof fn !== 'function') {
      throw new TypeError('Router.use() requires a middleware function but got a ' + gettype(fn))
    }

    // add the middleware
    debug('use %o %s', path, fn.name || '<anonymous>')

    var layer = new Layer(path, {
      sensitive: this.caseSensitive,
      strict: false,
      end: false
    }, fn);
    layer.route = undefined;
    
    this.stack.push(layer);
  }

  return this;
};


/**
 * Route `path` to one or more callbacks.
 *
 * @param {String} path
 * @param {Function|Array} fns
 * @return {Route}
 * @api protected
 */
proto.route = function route(path) {
  var route = new Route(path);

  var layer = new Layer(path, {
    sensitive: this.caseSensitive,
    strict: this.strict,
    end: true
  }, route.dispatch.bind(route));

  layer.route = route;

  this.stack.push(layer);
  return route;
};

proto.page = function(path){
  var route = this.route(path)
  route.put.apply(route, slice.call(arguments, 1));
  return this;
};


// get type for error message
function gettype(obj) {
  var type = typeof obj;
  if (type !== 'object') {
    return type;
  }

  // inspect [[Class]] for objects
  return toString.call(obj)
    .replace(objectRegExp, '$1');
}

function matchLayer(layer, path) {
  try {
    return layer.match(path);
  } catch (err) {
    return err;
  }
}

// merge params with parent params
function mergeParams(params, parent) {
  if (typeof parent !== 'object' || !parent) {
    return params;
  }

  // make copy of parent for base
  var obj = mixin({}, parent);

  // simple non-numeric merging
  if (!(0 in params) || !(0 in parent)) {
    return mixin(obj, params);
  }

  var i = 0;
  var o = 0;

  // determine numeric gaps
  while (i in params) {
    i++;
  }

  while (o in parent) {
    o++;
  }

  // offset numeric indices in params before merge
  for (i--; i >= 0; i--) {
    params[i + o] = params[i];

    // create holes for the merge when necessary
    if (i < o) {
      delete params[i];
    }
  }

  return mixin(obj, params);
}

// restore obj props after function
function restore(fn, obj) {
  var props = new Array(arguments.length - 2);
  var vals = new Array(arguments.length - 2);

  for (var i = 0; i < props.length; i++) {
    props[i] = arguments[i + 2];
    vals[i] = obj[props[i]];
  }

  return function () {
    // restore vals
    for (var i = 0; i < props.length; i++) {
      obj[props[i]] = vals[i];
    }

    return fn.apply(this, arguments);
  };
}
