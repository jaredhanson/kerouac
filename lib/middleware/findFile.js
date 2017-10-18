var fs = require('fs')
  , path = require('path');


module.exports = function(dir) {
  var exts = [ '.md' ];
  
  return function findFile(page, next) {
    var file, ext, exists
      , i, len;
    
    for (i = 0, len = exts.length; i < len; ++i) {
      ext = exts[i];
      file = path.resolve(dir, page.params[0] + ext);
      if (fs.existsSync(file)) {
        page.inputPath = file;
        return next();
      }
    }
    
    return next('route');
  }
}
