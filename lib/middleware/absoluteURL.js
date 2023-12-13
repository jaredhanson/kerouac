// Module dependencies.
var uri = require('url')
  , path = require('canonical-path');


/**
 * Absolute URL middleware.
 *
 * This middleware sets `page.url` to the {@link https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Web_mechanics/What_is_a_URL#absolute_urls_vs._relative_urls absolute URL}
 * that should be used when requesting the page via the World Wide Web.  The
 * path is computed from the 'base url' setting of the site.  The value of this
 * property contains only the path, the protocol and hostname are implicit.
 * Templates can use this property when linking to pages.
 *
 * Additionally, if the 'base url' setting includes a hostname, `page.fullURL`
 * will be set to a a fully qualified URL containing the protocol and hostname.
 * Templates can use this property when linking to pages from resources that
 * require full URLs, such as sitemaps.
 *
 * Note that if pretty URLs are also being used, `prettyURL()` middleware must
 * be used prior to this middleware, otherwise the rewriting of the path to a
 * pretty URL will be lost.
 *
 * @example
 * site.use(kerouac.absoluteURL());
 * 
 * @example
 * site.use(kerouac.prettyURLs());
 * site.use(kerouac.absoluteURL());
 *
 * @public
 * @return {Function}
 */
module.exports = function() {
  
  return function absoluteURL(page, next) {
    var baseURL = page.app.get('base url') || '/'
      , url = uri.parse(baseURL);
    
    url.pathname = path.join(url.pathname, page.url || page.path);
    page.url = url.pathname;
    if (url.host) {
      page.fullURL = uri.format(url);
    }
    next();
  };
};
