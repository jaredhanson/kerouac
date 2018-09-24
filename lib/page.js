/**
 * Module dependencies.
 */
var events = require('events')
  , path = require('path')
  , fs = require('fs')
  , mkdirp = require('mkdirp')
  , util = require('util')


/**
 * Initialize a new `Page`.
 *
 * `Page` represents a page in a site.  In the process of generating a page,
 * it will pass through a chain of middleware functions.  It is expected that
 * one of these middleware will write a page, either directly by calling
 * `write()` and `end()`, or indirectly by `render()`ing a layout.
 *
 * @param {String} path
 * @api private
 */
function Page(path, ctx) {
  events.EventEmitter.call(this);
  this.path = path;
  this.context = ctx;
  this._isOpen = false;
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
  if (!layout || 'function' == typeof layout) {
    fn = layout; options = {}; layout = this.layout || 'default';
  }
  // support callback function as second arg
  if ('function' == typeof options) {
    fn = options, options = {};
  }
  options = options || {};
  
  var self = this
    , site = this.site;
  
  // merge locals
  options._locals = this.locals;
  
  // default callback to write
  fn = fn || function(err, str) {
    console.log(err)
    
    if (err) return self.next(err);
    self.write(str);
    self.end();
  };
  
  // render
  site.render(layout, options, fn);
}

/**
 * Copy file `path` as page.
 *
 * @param {String} path
 * @api public
 */
Page.prototype.copy = function(path, fn) {
  var self = this;
  
  // default callback to write
  fn = fn || function(err, str) {
    if (err) return self.next(err);
    self.write(str);
    self.end();
  };
  
  fs.readFile(path, fn);
}

/**
 * Write data to page.
 *
 * @param {String} data
 * @api public
 */
Page.prototype.write = function(data) {
  // Lazily open the file.  This is done upon first write, as middleware may
  // modify the path (as is the case with `prettyURL` middleware).
  if (!this._isOpen) {
    this.open();
  }
  this._stream.write(data);
}

/**
 * Signal the end of data being written to page.
 *
 * @param {String} data
 * @api public
 */
Page.prototype.end = function(data) {
  if (data) { this.write(data); }
  this._stream.end();
}

Page.prototype.skip = function() {
  this.emit('close');
}

/**
 * Open page for writing.
 *
 * @param {String} path
 * @api protected
 */
Page.prototype.open = function() {
  var odir = this.site.get('output')
    , ofile = path.join(odir, this.outputPath || this.originalPath || this.path);
  
  mkdirp.sync(path.dirname(ofile));
  this._stream = fs.createWriteStream(ofile);
  this._isOpen = true;

  var self = this;
  this._stream.on('close', function() {
    self.emit('close');
  });
  this._stream.on('error', function(err) {
    self.emit('error', err);
  });
}


/**
 * Expose `Page`.
 */
module.exports = Page;
