module.exports = function(app, site) {
  
  return function init(page, next) {
    page.app = app;
    page.site = site;
    page.locals = {};
    page.next = next;
    next();
  }
}
