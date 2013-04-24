var url = require('url')
  , path = require('path')

module.exports = function(ext, index) {
  ext = ext || '.html';
  index = index || 'index'
  
  return function prettyURL(page, next) {
    var dirname = path.dirname(page.path)
      , basename = path.basename(page.path, ext);
    if (index !== basename) {
      var pp = path.join(dirname, basename, index + ext);
      page.path = pp;
    }
    next();
  }
}
