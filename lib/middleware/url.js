/**
 * Module dependencies.
 */
var uri = require('url');


/**
 * URL middleware.
 *
 * This middleware sets a `url` property on `page` containing the full URL
 * of the page, including scheme and host.  The 'base url' setting is used,
 * and must be set for this middleware to work.
 *
 * Note: If both are used, this middleware must be used *after* `prettyURL`
 * middleware, due to the fact that `prettyURL` will modify the `path` of the
 * page.
 *
 * Examples:
 *
 *     site.use(kerouac.url());
 *
 *     site.use(kerouac.prettyURLs());
 *     site.use(kerouac.url());
 *
 * @param {String} ext
 * @param {String} index
 * @return {Function}
 * @api public
 */
module.exports = function() {
  
  return function url(page, next) {
    var site = page.site
      , base = site.get('base url');
    
    if (base) {
      var u = uri.parse(base);
      u.pathname = page.path;
      page.url = uri.format(u);
    }
    next();
  }
}
