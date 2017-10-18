/**
 * Module dependencies.
 */
var Router = require('./router')
  , Queue = require('./queue')
  , Page = require('./page')
  , Layout = require('./layout')
  , upath = require('canonical-path')
  , marked = require('marked-engine')
  , highlight = require('highlight.js')
  , yaml = require('js-yaml')
  , middleware = require('./middleware')
  //, plugins = require('./plugins')
  , fnpool = require('functionpool')
  , utils = require('./utils')
  , debug = require('debug')('kerouac');

var EventEmitter = require('events').EventEmitter;
var mixin = require('merge-descriptors');
var setPrototypeOf = require('setprototypeof');
var proto = require('./application');

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
