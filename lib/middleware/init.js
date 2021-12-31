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
    page.next = next;
    
    setPrototypeOf(page, app.pageext)
    
    page.url = page.path;
    page.locals = page.locals || Object.create(null);;
    
    next();
  };
};

