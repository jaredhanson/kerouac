/**
 * Module dependencies.
 */
var path = require('path')
  , diveSync = require('diveSync')
  , middleware = require('../middleware');


exports = module.exports = function(dir) {
  dir = dir || 'content';
  
  return function assets(site, pages) {
    var adir = path.resolve(process.cwd(), dir)
      , rfile
      , rdir
      , comps
      , url;
  
    diveSync(adir, function(err, file) {
      if (err) { throw err; }
    
      rfile = path.relative(adir, file)
    
      // TODO: Automatically determine output type based on extension (and allow override option).
      // TODO: Implement pretty URLs as middleware.
    
      rdir = path.dirname(rfile);
      comps = path.basename(rfile).split('.');
      url = path.join(rdir, comps[0]) + '.html';
    
      // TODO: Make prettyURLs optional (possible passing it as an argument).
      site.page(url, middleware.prettyURL()
                   , middleware.url()
                   , middleware.loadContent(file)
                   , middleware.render());
    });
  }
}
