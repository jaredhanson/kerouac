/**
 * Module dependencies.
 */
var EventEmitter = require('events').EventEmitter
  , mixin = require('merge-descriptors')
  , proto = require('./application')
  , middleware = require('./middleware');


/**
 * Create a Kerouac site.
 *
 * @return {Function}
 * @api public
 */
function createSite() {
  function app(page) { app.handle(page); }
  mixin(app, EventEmitter.prototype, false);
  mixin(app, proto, false);
  app.init();
  return app;
}

/**
 * Expose `createSite`.
 *
 * @api public
 */
exports = module.exports = createSite;

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
