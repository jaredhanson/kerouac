var fs = require('fs');


module.exports = function() {
  
  return function timestamps(page, next) {
    fs.stat(page.inputPath, function(err, stat) {
      if (err) { return next(err); }
      page.createdAt = stat.birthtime;
      page.modifiedAt = stat.mtime;
      next();
    });
  }
}
