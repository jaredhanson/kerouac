var uri = require('url');

module.exports = function() {
  
  return function url(page, next) {
    var app = page.app
      , base = app.get('base url');
    
    if (base) {
      var u = uri.parse(base);
      u.pathname = page.path;
      page.url = uri.format(u);
    }
    next();
  }
}
