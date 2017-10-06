var fs = require('fs')
  , path = require('path')
  , utils = require('../utils');


module.exports = function(dir) {
  var exts = [ '.md' ];
  
  return function loadContent(page, next) {
    var site = page.site
      , file, ext, exists
      , i, len;
    
    for (i = 0, len = exts.length; i < len; ++i) {
      ext = exts[i];
      file = path.resolve(dir, page.params[0] + ext);
      exists = fs.existsSync(file);
      if (exists) { break; }
    }
    
    if (!exists) {
      // TODO: Error ?
      //console.log('NO EXIST???');
      
      return next('FIXME: passed through, no content');
    }
    
    fs.readFile(file, 'utf8', function(err, str) {
      if (err) { return next(err); }
      
      var data = str
        , fm = ''
        , obj;
    
      // check for front matter
      if ('---' === str.slice(0, 3)) {
        var eol = '\n';
        if ('---\r\n' === str.slice(0, 5)) {
          eol = '\r\n'; // Windows
          str = str.substr(5);
        } else {
          eol = '\n'; // UNIX
          str = str.substr(4);
        }
        
        var i = str.indexOf(eol)
          , line;
        while (-1 != i) {
          line = str.slice(0, i + eol.length);
          str = str.substr(i + eol.length);
      
          if ('---' === line.slice(0, 3)) {
            break;
          } else {
            fm += line;
          }
      
          i = str.indexOf(eol);
        }
        data = str;
        
        try {
          obj = site.fm(fm.trim());
        } catch (ex) {
          throw new Error('Failed to parse front matter from file: ' + file);
        }
        
        if (obj) utils.merge(page.locals, obj);
        if (obj && obj.layout) { page.layout = obj.layout; }
      }
      
      page.markup = ext;
      page.content = data;
      next();
    });
  }
}
