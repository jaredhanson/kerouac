/**
 * Module dependencies.
 */
var uri = require('url')
  , path = require('canonical-path');


module.exports = function() {
  
  return function absoluteURL(page, next) {
    var baseURL = page.site.get('base url') || '/'
      , url = uri.parse(baseURL)
    
    page.absoluteURL = path.join(url.pathname, page.basePath || '', page.url);
    if (url.host) {
      url.pathname = page.absoluteURL;
      page.fullURL = uri.format(url);
    }
    next();
  }
}
