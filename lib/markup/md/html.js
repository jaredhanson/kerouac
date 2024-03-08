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
exports.render = function(str, options, fn) {
  if ('function' == typeof options) {
    fn = options, options = {};
  }

  // cache requires .filename
  if (options.cache && !options.filename) {
    return fn(new Error('the "filename" option is required for caching'));
  }

  var opts = {};
  merge(opts, marked.defaults);
  merge(opts, options);

  try {
    var path = options.filename;
    var tokens = options.cache
      ? exports.cache[path] || (exports.cache[path] = marked.lexer(str, opts))
      : marked.lexer(str, opts);
    fn(null, marked.parser(tokens, opts));
  } catch (err) {
    fn(err);
  }
}

/**
 * Lexer tokens cache.
 */
exports.cache = {};

/**
 * Express support.
 */
exports.__express = exports.renderFile;
