/**
 * Module dependencies.
 */
var EventEmitter = require('events').EventEmitter
  , mixin = require('merge-descriptors')
  , proto = require('./application')
  , Router = require('./router')
  , middleware = require('./middleware');


/**
 * Expose `createSite()`.
 */
exports = module.exports = createSite;

/**
 * Create a Kerouac site.
 *
 * @return {Function}
 * @api public
 */
function createSite() {
  function app(page, next) {
    app.handle(page, next);
  };
  
  mixin(app, EventEmitter.prototype, false);
  mixin(app, proto, false);
  
  app.init();
  return app;
}

/**
 * Expose constructors.
 */
exports.Router = Router;

/**
 * Expose middleware.
 */
for (var key in middleware) {
  Object.defineProperty(
      exports
    , key
    , Object.getOwnPropertyDescriptor(middleware, key));
}

/**
 * Expose CLI.
 *
 * @api private
 */
exports.cli = require('./cli');
