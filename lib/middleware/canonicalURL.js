/**
 * Canonical URL middleware.
 *
 * This middleware sets `canonicalURL` on `page.locals` to the absolute URL that
 * should be used when requesting the page via the World Wide Web.  Templates
 * can use this property when adding a {@link https://en.wikipedia.org/wiki/Canonical_link_element canonical link relation}
 * ({@link https://www.rfc-editor.org/rfc/rfc6596 RFC 6596}) to a page.
 *
 * @public
 * @return {Function}
 */
module.exports = function() {
  
  return function canonicalURL(page, next) {
    page.locals.canonicalURL = page.fullURL || page.url;
    next();
  };
};
