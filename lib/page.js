/**
 * Module dependencies.
 */
var events = require('events')
  , util = require('util')


/**
 * Initialize a new `Page`.
 *
 * `Page` represents a page in a site.  In the process of generating a page,
 * it will pass through a chain of middleware functions.  It is expected that
 * one of these middleware will write a page, either directly by calling
 * `write()` or indirectly by `render()`ing a layout.
 *
 * @param {String} path
 * @api private
 */
function Page(path) {
  events.EventEmitter.call(this);
  this.path = path;
}

/**
 * Inherit from `events.EventEmitter`.
 */
util.inherits(Page, events.EventEmitter);

/**
 * Render `layout` with the given `options` and optional callback `fn`.
 * When a callback function is given the page will _not_ be written
 * automatically.
 *
 * Options:
 *
 *  - `cache`     boolean hinting to the engine it should cache
 *  - `filename`  filename of the view being rendered
 *
 * @param  {String} layout
 * @param  {Object|Function} options or callback function
 * @param  {Function} fn
 * @api public
 */
Page.prototype.render = function(layout, options, fn) {
  // support callback function as first arg
  if ('function' == typeof layout || !layout) {
    fn = layout; options = {}; layout = this.layout || 'default';
  }
  // support callback function as second arg
  if ('function' == typeof options) {
    fn = options, options = {};
  }
  options = options || {};
  
  var self = this
    , app = this.app;
  
  // merge locals
  options._locals = this.locals;
  
  // default callback to write
  fn = fn || function(err, str) {
    if (err) return self.next(err);
    self.write(str);
  };
  
  // render
  app.render(layout, options, fn);
}

/**
 * Write body of page.
 *
 * @param {String} body
 * @api public
 */
Page.prototype.write = function(body) {
  this.output = body;
  this.emit('write', this.output);
}


/**
 * Expose `Page`.
 */
module.exports = Page;
