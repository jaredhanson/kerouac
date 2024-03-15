var Page = require('./page');
var fs = require('fs');


var page = Object.create(Page.prototype);

module.exports = page;

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
page.render = function(layout, options, callback) {
  var app = this.app;
  var done = callback;
  var opts = options || {};
  var self = this;
  
  // support callback function as second arg
  if (typeof options === 'function') {
    done = options;
    opts = {};
  }
  
  // merge locals
  opts._locals = self.locals;
  
  // default callback to write
  done = done || function(err, str) {
    if (err) return self.next(err);
    self.write(str);
    self.end();
  };
  
  // render
  app.render(layout, opts, done);
};

page.compile = function(text, type, layout, options, callback) {
  var app = this.app;
  var done = callback;
  var opts = options || {};
  var self = this;
  
  // support callback function as second arg
  if (typeof options === 'function') {
    done = options;
    opts = {};
  }
  
  opts.content = app.convert(text, type, opts);
  self.render(layout, opts, done);
};

page.convert = function(text, type, otype, options, callback) {
  var app = this.app;
  var done = callback;
  var output = otype;
  var opts = options || {};
  var self = this;

  // support options as third arg
  if (typeof otype === 'object') {
    done = options;
    opts = otype;
    output = null;
  }
  // support callback function as third or fourth arg
  else if (typeof otype === 'function') {
    done = otype;
    opts = {};
    output = null;
  } else if (typeof options === 'function') {
    done = options;
    opts = {};
  }

  // default callback to write
  done = done || function(err, str) {
    if (err) return self.next(err);
    self.write(str);
    self.end();
  };

  var out = app.convert(text, type, output || 'html', opts);
  done(null, out);
};

// TODO: add a compileFile function, which takes an input path as lw markup
// TODO: also add a convertFile function

/**
 * Copy file `path` as page.
 *
 * @param {String} path
 * @api public
 */
page.copy = function(path) {
  var file = fs.createReadStream(path);
  file.pipe(this);
};

page.skip = function() {
  this.destroy();
};
