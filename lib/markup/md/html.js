/**
 * Module dependencies.
 */
var fs = require('fs')
  , marked = require('marked')
  , markedHighlight = require('marked-highlight').markedHighlight
  , gfmHeadingId = require('marked-gfm-heading-id').gfmHeadingId
  , markedAlert = require('marked-alert')
  , highlight = require('highlight.js')
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
  options = options || {};

  var opts = {};
  merge(opts, marked.defaults);
  merge(opts, options);
  
  var markedhi = new marked.Marked(
    opts,
    markedHighlight({
      langPrefix: options.langPrefix,
      highlight: options.highlight
    }),
    gfmHeadingId(),
    markedAlert()
  );

  try {
    return markedhi.parse(str);
  } catch (err) {
    throw err;
  }
};
