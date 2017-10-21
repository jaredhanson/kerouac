module.exports = function(layout) {
  
  return function(page, next) {
    if (layout) { page.layout = layout; }
    next();
  }
}
