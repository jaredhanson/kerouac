// Module dependencies.
var setPrototypeOf = require('setprototypeof');

/**
 * Initialization middleware.
 *
 * @private
 * @param {Function} app
 * @returns {Function}
 */
module.exports = function(app) {
  
  return function init(page, next) {
    page.next = next;
    
    setPrototypeOf(page, app.pageext)
    
    // TODO: Remove the use of `.url` property
    page.url = page.path;
    page.locals = page.locals || Object.create(null);;
    
    next();
  };
};

