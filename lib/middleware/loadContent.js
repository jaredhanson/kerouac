var fs = require('fs')
  , path = require('path')
  , fm = require('headmatter')
  , utils = require('../utils');


module.exports = function() {
  
  return function loadContent(page, next) {
    var site = page.app
      , i, len;
    
    fs.readFile(page.inputPath, 'utf8', function(err, str) {
      if (err) { return next(err); }
      
      var data;
      try {
        data = fm.parse(str, site.fm.bind(site));
      } catch (ex) {
        throw new Error('Failed to parse front matter from file: ' + file);
      }
      
      if (data.head) utils.merge(page.locals, data.head);
      if (data.head && data.head.layout) { page.layout = data.head.layout; }
      
      page.markup = path.extname(page.inputPath).substr(1);
      page.content = data.content;
      
      next();
    });
  }
}
