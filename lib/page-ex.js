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
  
  // default callback to render
  done = done || function(err, str) {
    if (err) return self.next(err);
    self.render(layout, { content: str });
  };
  
  //app.convert(text, type, done);
  // TODO: rename the .compile function???
  var out = app.convert(text, type, function(){});
  done(null, out);
};

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
