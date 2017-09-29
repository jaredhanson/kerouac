/**
 * Module dependencies.
 */
var kerouac = require('../index')
  , path = require('path')
  , diveSync = require('diveSync')
  , middleware = require('../middleware');


exports = module.exports = function(dir) {
  dir = dir || 'content';
  
  var site = kerouac();
  
  site.page('/*.html',
    middleware.prettyURL(),
    middleware.loadContent(dir),
    middleware.render());
  
  site.bind(function boundcontent(site) {
    var self = this
      , adir = path.resolve(process.cwd(), dir)
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
      
      site.add(url);
    });
  });
  
  return site;
}
