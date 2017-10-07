/**
 * Module dependencies.
 */
var uri = require('url')
  , path = require('canonical-path');


module.exports = function() {
  
  return function fullURL(page, next) {
    var baseURL = page.baseURL || '/'
      , url = uri.parse(baseURL)
    
    page.absoluteURL = path.join(url.pathname, page.basePath || '', page.url);
    if (url.host) {
      url.pathname = page.absoluteURL;
      page.fullURL = uri.format(url);
    }
    next();
  }
}
