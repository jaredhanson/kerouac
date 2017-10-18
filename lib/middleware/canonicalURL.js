module.exports = function() {
  
  return function canonicalURL(page, next) {
    page.locals.canonicalURL = page.fullURL;
    next();
  }
}
