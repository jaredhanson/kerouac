module.exports = function(path) {
  
  return function copy(page, next) {
    page.copy(path);
  }
}
