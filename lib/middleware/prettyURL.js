// Module dependencies.
var path = require('canonical-path');


/**
 * Pretty URL middleware.
 *
 * This middleware transforms page paths into {@link https://en.wikipedia.org/wiki/Clean_URL pretty URLs}.
 * A pretty URL is one which does not indicate a file extension, instead
 * allowing resource representation to be negotiated using MIME types.  While
 * content negotiation is not applicable to static sites, pretty URLs still have
 * benefits to user experience and search engine optimization.
 *
 * Any path that ends in _slug.html_ will be written to _slug/index.html_.  With
 * the web server configured correctly, the index file will be served by default.
 * Pages are then requested with URLs of the form _/slug/_, rather than
 * _/slug.html_.
 *
 * This middleware also sets `page.url` to the pretty URL that should be used
 * when requesting the page via the World Wide Web (as opposed to page.path,
 * which was used to request the page on the local file system and includes a
 * file extension).  Templates can use this property when linking to pages with
 * pretty URLs.
 *
 * @example
 * site.use(kerouac.prettyURLs());
 *
 * @public
 * @param {String} [ext='.html']
 * @param {String} [index='index']
 * @return {Function}
 */
module.exports = function(ext, index) {
  ext = ext || '.html';
  index = index || 'index'
  
  return function prettyURL(page, next) {
    var dirname = path.dirname(page.path)
      , basename = path.basename(page.path, ext)
      , extname = path.extname(page.path);
    
    if (ext === extname) {
      basename = index !== basename ? basename : '';
      
      page.outputPath = path.join(page.basePath || '', dirname, basename, index + ext);
      page.url = path.join(page.basePath || '', dirname, basename) + '/';
    }
    next();
  };
};
