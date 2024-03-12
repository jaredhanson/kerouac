/**
 * Module dependencies.
 */
var fs = require('fs')
  , marked = require('marked')
  , merge = require('utils-merge');


/**
 * Render the given `str` of Markdown and invoke the callback `fn(err, str)`.
 *
 * Options:
 *
 *   - `cache`    enable template caching
 *   - `filename` filename required for caching
 *
 * @param {String} str
 * @param {Object|Function} options or fn
 * @param {Function} fn
 * @api public
 */
module.exports = function md2html(str, options) {
  if ('function' == typeof options) {
    fn = options, options = {};
  }

  var opts = {};
  merge(opts, marked.defaults);
  merge(opts, options);

  try {
    var path = options.filename;
    var tokens = marked.lexer(str, opts);
    return marked.parser(tokens, opts);
  } catch (err) {
    throw err;
  }
};
