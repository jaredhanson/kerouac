var Page = require('./page');


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
page.render = function(layout, options, fn) {
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
    , site = this.app;
  
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
};
