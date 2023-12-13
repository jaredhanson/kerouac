// Module dependencies.
var fs = require('fs')
  , path = require('path');


/**
 * Copy middleware.
 *
 * This middleware copies the requested file from a directory to the page.
 *
 * For example, if the requested file is 'logo.png' then the file at
 * 'assets/logo.png' will be copied to the site's output.
 *
 * @example
 * site.page('/*', kerouac.copy('assets'));
 *
 * @public
 * @param {String} [dir='assets']
 * @return {Function}
 */
module.exports = function(dir) {
  dir = dir || 'assets';
  
  return function copy(page, next) {
    var file = path.resolve(dir, page.params[0]);
    if (!fs.existsSync(file)) {
      var err = new Error("no such file '" + path.join(dir, page.params[0]) + "'");
      err.code = 'ENOENT';
      return next(err);
    }
    page.copy(file);
  };
};
