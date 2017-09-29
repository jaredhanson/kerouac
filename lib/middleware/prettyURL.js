/**
 * Module dependencies.
 */
var path = require('path')


/**
 * Pretty URL middleware.
 *
 * This middleware transforms page paths into pretty URLs.  A pretty URL is one
 * which does not indicate a file extension, instead allowing for content
 * negotiation via MIME types.
 *
 * While content negotiation is not applicable to static sites, pretty URLs
 * still have benefits to user experience and search engine optimization.
 *
 * Any path that ends in _name.html_ will be rewritten to _name/index.html_.
 * With the web server configured correctly, the index file will be served by
 * default, and URLs can take the form:
 *
 *     http://www.example.com/name
 *
 * Instead of:
 *
 *     http://www.example.com/name.html
 *
 * Examples:
 *
 *     site.use(kerouac.prettyURLs());
 *
 * @param {String} ext
 * @param {String} index
 * @return {Function}
 * @api public
 */
module.exports = function(ext, index) {
  ext = ext || '.html';
  index = index || 'index'
  
  return function prettyURL(page, next) {
    var dirname = path.dirname(page.originalPath || page.path)
      , basename = path.basename(page.originalPath || page.path, ext);
    if (index !== basename) {
      var pp = path.join(dirname, basename, index + ext);
      page.outputPath = pp;
    }
    next();
  }
}
