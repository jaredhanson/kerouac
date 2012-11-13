var url = require('url')
  , path = require('path')

module.exports = function() {
  var index = 'index'
    , ext = '.html';
  
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
