var setPrototypeOf = require('setprototypeof');

/**
 * Initialization middleware.
 *
 * Exposes various properties on `page`, including `next`.
 *
 * @return {Function}
 * @api private
 */
module.exports = function(app) {
  
  return function init(page, next) {
    page.url = page.path;
    page.locals = {};
    page.next = next;
    
    setPrototypeOf(page, app.pageext)
    
    next();
  }
}
