var uri = require('url');

module.exports = function() {
  
  return function url(page, next) {
    var site = page.site
      , base = site.get('base url');
    
    if (base) {
      var u = uri.parse(base);
      u.pathname = page.path;
      page.url = uri.format(u);
    }
    next();
  }
}
