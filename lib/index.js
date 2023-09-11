/**
 * Kerouac is....
 *
 * @module kerouac
 */


// Module dependencies.
var EventEmitter = require('events').EventEmitter
  , mixin = require('merge-descriptors')
  , proto = require('./application')
  , Router = require('./router')
  , pagex = require('./page-ex');


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

exports.content = require('./site/content');
exports.assets = require('./site/assets');

/**
 * Expose middleware.
 */
exports.canonicalURL = require('./middleware/canonicalURL');
exports.copy = require('./middleware/copy');
exports.index = require('./middleware/_index');
exports.manifest = require('./middleware/manifest');
exports.prettyURLs =
exports.prettyURL = require('./middleware/prettyURL');

/**
 * Expose CLI.
 *
 * @api private
 */
exports.cli = require('./cli');
