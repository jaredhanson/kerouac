var debug = require('debug')('kerouac:router:route');
var flatten = require('array-flatten');
var Layer = require('./layer');

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
function Route(path) {
  this.path = path;
  this.stack = [];
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

Route.prototype.put = function put() {
  var handles = flatten(slice.call(arguments));

  for (var i = 0; i < handles.length; i++) {
    var handle = handles[i];

    if (typeof handle !== 'function') {
      var type = toString.call(handle);
      var msg = 'Route.put() requires a callback function but got a ' + type
      throw new Error(msg);
    }

    debug('%o', this.path)

    var layer = Layer('/', {}, handle);
    this.stack.push(layer);
  }

  return this;
};


/**
 * Expose `Route`.
 */
module.exports = Route;
