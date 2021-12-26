/**
 * Module dependencies.
 */
var EventEmitter = require('events').EventEmitter
  , mixin = require('merge-descriptors')
  , proto = require('./application')
  , Router = require('./router')
  , pagex = require('./page-ex')
  , middleware = require('./middleware');


/**
 * Expose `createApplication()`.
 */
exports = module.exports = createApplication;

/**
 * Create a Kerouac application.
 *
 * @return {Function}
 * @api public
 */
function createApplication() {
  function app(page, next) {
    app.handle(page, next);
  };
  
  mixin(app, EventEmitter.prototype, false);
  mixin(app, proto, false);
  
  // expose the prototype that will get set on pages
  app.pageext = Object.create(pagex, {
    app: { configurable: true, enumerable: true, writable: true, value: app }
  })
  
  app.init();
  return app;
}

/**
 * Expose constructors.
 */
exports.Router = Router;

exports.content = require('./plugins/content');

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
