module.exports = function() {
  
  return function canonicalURL(page, next) {
    page.locals.canonicalURL = page.fullURL;
    page.locals.canonicalPath = page.absoluteURL;
    next();
  }
}
