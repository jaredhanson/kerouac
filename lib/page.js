/**
 * Module dependencies.
 */
var stream = require('stream')
  , events = require('events')
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
function Page(path, options) {
  stream.Writable.call(this, options);
  this.path = path;
}

/**
 * Inherit from `events.EventEmitter`.
 */
util.inherits(Page, stream.Writable);

Page.prototype._write = function(chunk, encoding, callback) {
  if (this.fd) {
    fs.write(this.fd, chunk, callback);
  } else {
    var dirname = this.app.get('output')
      , filename = path.join(dirname, this.outputPath || this.originalPath || this.path);
  
    var self = this;
    fs.open(filename, 'w', function(err, fd) {
      if (err) { return callback(err); }
      self.fd = fd;
      fs.write(self.fd, chunk, callback);
    });
  }
}

Page.prototype._destroy = function(err, callback) {
  if (this.fd) {
    fs.close(this.fd, function(er) {
      callback(er || err);
    });
  }
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
/*
Page.prototype.write = function(data) {
  // Lazily open the file.  This is done upon first write, as middleware may
  // modify the path (as is the case with `prettyURL` middleware).
  if (!this._isOpen) {
    this.open();
  }
  this._stream.write(data);
}
*/

/**
 * Signal the end of data being written to page.
 *
 * @param {String} data
 * @api public
 */
/*
Page.prototype.end = function(data) {
  if (data) { this.write(data); }
  this._stream.end();
}
*/

Page.prototype.skip = function() {
  this.emit('close');
}

/**
 * Open page for writing.
 *
 * @param {String} path
 * @api protected
 */
/*
Page.prototype.open = function() {
  var odir = this.app.get('output')
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
*/


/**
 * Expose `Page`.
 */
module.exports = Page;
