var fs = require('fs')
  , path = require('path');

module.exports = function(dir) {
  dir = dir || 'assets';
  
  return function copy(page, next) {
    console.log('COPY: ' + page.params[0]);
    
    var file = path.resolve(dir, page.params[0]);
    if (fs.existsSync(file)) {
      page.copy(file);
      return next();
    }
    
    // TODO: error not found?
    next();
  };
};
