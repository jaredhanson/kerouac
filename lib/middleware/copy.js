var fs = require('fs')
  , path = require('path');

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
