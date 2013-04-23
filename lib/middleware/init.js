/**
 * Initialization middleware.
 *
 * Exposes various properties on `page`, including `site` and `pages`.
 *
 * @param {Kerouac} site
 * @param {Site} pages
 * @return {Function}
 * @api private
 */
module.exports = function(site, pages) {
  
  return function init(page, next) {
    page.site = site;
    page.pages = pages;
    page.locals = {};
    page.next = next;
    next();
  }
}
