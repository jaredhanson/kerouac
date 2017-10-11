var fs = require('fs')
  , path = require('path');


/**
 * File copying middleware.
 *
 * This middleware copies an existing file to generate the page.  Typically, this
 * is used as the final middleware in a stack that operates on existing files
 * that are already in the desired form.
 *
 * Examples:
 *
 *     site.page('/hello.mp4', copy('hello.mp4'));
 *
 * @param {String} path
 * @return {Function}
 * @api public
 */
module.exports = function(dir) {
  
  return function copy(page, next) {
    var file = path.resolve(dir, page.params[0]);
    if (fs.existsSync(file)) {
      page.copy(file);
      return next();
    }
    
    // TODO: error not found?
    next();
  }
}
