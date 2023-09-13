module.exports = function() {
  
  return function canonicalURL(page, next) {
    page.locals.canonicalURL = page.fullURL || page.url;
    next();
  };
};
