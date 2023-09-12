// Module dependencies.
var uri = require('url')
  , path = require('canonical-path');


/**
 * Absolute URL middleware.
 *
 * This middleware determines the absolute URL of a page, as accessed via the
 * World Wide Web.  The absolute URL is computed from the 'base url' setting of
 * the site, and set at `page.absoluteURL`.  The value of this property contains
 * only the path, the protocol and hostname are implicit.
 *
 * Additionally, if the 'base url' setting includes a hostname, a `page.fullURL`
 * property will be set, containing the absolute URL fully qualified with the
 * protocol and hostname.
 *
 * Examples:
 *
 *     site.use(kerouac.absoluteURL());
 *
 * @return {Function}
 * @api public
 */
module.exports = function() {
  
  return function absoluteURL(page, next) {
    var baseURL = page.app.get('base url') || '/'
      , url = uri.parse(baseURL)
    
    if (url.host) {
      url.pathname = path.join(url.pathname, page.url || page.path);
      page.fullURL = uri.format(url);
    }
    next();
  };
};
