/**
 * Initialization middleware.
 *
 * Exposes various properties on `page`, including `next`.
 *
 * @return {Function}
 * @api private
 */
module.exports = function() {
  
  return function init(page, next) {
    page.url = page.path;
    page.locals = {};
    page.next = next;
    next();
  }
}
