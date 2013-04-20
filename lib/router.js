/**
 * Module dependencies.
 */
var Route = require('./route')
  , utils = require('./utils')
  , debug = require('debug')('kerouac');


/**
 * Initialize a new `Router`.
 *
 * @api private
 */
function Router() {
  var self = this;
  this._routes = [];
  this.middleware = function(page, next) {
    self._dispatch(page, next);
  };
}

/**
 * Route `path` to one or more callbacks.
 *
 * @param {String} path
 * @param {Function|Array} fns
 * @return {Route}
 * @api protected
 */
Router.prototype.route = function(path, fns) {
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
Router.prototype._dispatch = function(page, next) {
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
Router.prototype._match = function(page, i) {
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


/**
 * Expose `Router`.
 */
module.exports = Router;
