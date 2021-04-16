module.exports = function() {
  
  return function manifest(page, next) {
    var site = page.app
    while (site) {
      if (site.manifest) {
        page.locals.manifest = site.manifest;
        break;
      }
      site = site.parent;
    }
    next();
  }
}
