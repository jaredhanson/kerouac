var pathRegexp = require('path-to-regexp');

var debug = require('debug')('kerouac:router:route');
var Layer = require('./layer');
var flatten = require('array-flatten');
var slice = Array.prototype.slice;
var toString = Object.prototype.toString;


/**
 * Initialize a new `Route` with the given `path`, an array of callback `fns`,
 * and `options`.
 *
 * Options:
 *
 *   - `sensitive`  enable case-sensitive routes
 *   - `strict`     enable strict matching for trailing slashes
 *
 * @param {String} path
 * @param {Array} fns
 * @param {Object} options
 * @api private
 */
function Route(path, fns, options) {
  this.path = path;
  this.stack = [];
  
  /*
  options = options || {};
  this.path = path;
  this.fns = fns;
  this.regexp = pathRegexp(path, this.keys = [], options);
  */
}

Route.prototype.dispatch = function dispatch(page, done) {
  var idx = 0;
  var stack = this.stack;
  if (stack.length === 0) {
    return done();
  }

  page.route = this;

  next();

  function next(err) {
    // signal to exit route
    if (err && err === 'route') {
      return done();
    }

    // signal to exit router
    if (err && err === 'router') {
      return done(err)
    }

    var layer = stack[idx++];
    if (!layer) {
      return done(err);
    }

    if (err) {
      layer.handle_error(err, page, next);
    } else {
      layer.handle_request(page, next);
    }
  }
};

Route.prototype.get = function get() {
  var handles = flatten(slice.call(arguments));

  for (var i = 0; i < handles.length; i++) {
    var handle = handles[i];

    if (typeof handle !== 'function') {
      var type = toString.call(handle);
      var msg = 'Route.get() requires a callback function but got a ' + type
      throw new Error(msg);
    }

    debug('%o', this.path)

    var layer = Layer('/', {}, handle);
    
    this.stack.push(layer);
  }

  return this;
}



/**
 * Test if path is whole.
 *
 * A whole path is one which is not parameterized and, as such, declares the
 * full and complete path of a page to be generated for inclusion in the site.
 *
 * In contrast, a non-whole path is parameterized.  These parameters are
 * typically used by middleware to pre-process a set of similar pages in some
 * way.
 *
 * @return {Boolean}
 * @api protected
 */
Route.prototype.isBound = function() {
  return this.keys.length == 0;
}

/**
 * Check if this type matches `path`, if so populate `.params`.
 *
 * @param {String} path
 * @return {Boolean}
 * @api protected
 */
Route.prototype.match = function(path) {
  var keys = this.keys
    , params = this.params = []
    , m = this.regexp.exec(path);

  if (!m) return false;

  for (var i = 1, len = m.length; i < len; ++i) {
    var key = keys[i - 1];
    var val = m[i];

    if (key) {
      params[key.name] = val;
    } else {
      params.push(val);
    }
  }

  return true;
}


/**
 * Expose `Route`.
 */
module.exports = Route;
