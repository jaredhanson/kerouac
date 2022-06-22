/**
 * Module dependencies.
 */
var stream = require('stream')
  , fs = require('fs')
  , path = require('path')
  , mkdirp = require('mkdirp')
  , util = require('util');


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
 * Inherit from `stream.Writable`.
 */
util.inherits(Page, stream.Writable);

Page.prototype._write = function(chunk, encoding, callback) {
  if (this.fd) {
    fs.write(this.fd, chunk, callback);
  } else {
    // Lazily open the file.  This is done upon first write, as middleware may
    // modify the path (as is the case with `prettyURL` middleware).
    var dirname = this.app.get('output')
      , filename = path.join(dirname, this.outputPath || this.originalPath || this.path);
  
    //mkdirp.sync(path.dirname(filename));
  
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
  } else {
    callback();
  }
}


/**
 * Expose `Page`.
 */
module.exports = Page;
