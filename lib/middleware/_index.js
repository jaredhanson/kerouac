module.exports = function() {
  
  return function index(page, next) {
    page.app.pages = page.app.pages || [];
    page.app.pages.push(page);
    next();
  };
};
