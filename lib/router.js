/**
 * Module dependencies.
 */
var Route = require('./route')
  , utils = require('./utils')
  , Layer = require('./layer')
  , setPrototypeOf = require('setprototypeof')
  , flatten = require('array-flatten')
  , debug = require('debug')('kerouac');

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
    //router.handle(req, res, next);
  }
  
  setPrototypeOf(router, proto)
  
  router.caseSensitive = opts.caseSensitive;
  router.mergeParams = opts.mergeParams;
  router.strict = opts.strict;
  router.stack = [];
  
  router._routes = [];
  router.middleware = function(page, next) {
    router._dispatch(page, next);
  };
  
  return router;
}

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
proto.route = function(path, fns) {
  var fns = utils.flatten([].slice.call(arguments, 1));
  
  debug('defined %s', path);
  var route = new Route(path, fns);
  this._routes.push(route);
  return route;
}

/**
 * Route dispatcher, aka the router "middleware".
 *
 * @param {Page} page
 * @param {Function} next
 * @api private
 */
proto._dispatch = function(page, next) {
  var self = this;
  
  debug('dispatching %s %s', page.path);
  
  // route dispatch
  (function pass(i, err) {
    
    function nextRoute(err) {
      pass(page._route_index + 1, err);
    }
    
    // match route
    var route = self._match(page, i);
    
    // no route
    if (!route) { return next(err); }
    debug('matched %s', route.path);
    
    page.params = route.params;
    
    // invoke route callbacks
    var i = 0;
    function callbacks(err) {
      var fn = route.fns[i++];
      try {
        if ('route' == err) {
          nextRoute();
        } else if (err && fn) {
          if (fn.length < 3) { return callbacks(err); }
          debug('applying %s %s', page.path, fn.name || 'anonymous');
          fn(err, page, callbacks);
        } else if (fn) {
          if (fn.length < 3) {
            debug('applying %s %s', page.path, fn.name || 'anonymous');
            return fn(page, callbacks);
          }
          callbacks();
        } else {
          nextRoute(err);
        }
      } catch (err) {
        callbacks(err);
      }
    }
    callbacks();
  })(0);
}

/**
 * Attempt to match a route for `page`
 * with optional starting index of `i`
 * defaulting to 0.
 *
 * @param {Page} page
 * @param {Number} i
 * @return {Route}
 * @api private
 */
proto._match = function(page, i) {
  var path = page.path
    , routes = this._routes
    , i = i || 0
    , route;
  
  // matching routes
  for (var len = routes.length; i < len; ++i) {
    route = routes[i];
    if (route.match(path)) {
      page._route_index = i;
      return route;
    }
  }
}


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


/**
 * Expose `Router`.
 */
//module.exports = Router;
