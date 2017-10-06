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
    middleware.loadContent(dir),
    middleware.render());
  
  site.bind(function() {
    var self = this
      , adir = path.resolve(dir)
      , rfile
      , rdir
      , comps
      , url;
    
    diveSync(adir, function(err, file) {
      if (err) { throw err; }
      
      rfile = path.relative(adir, file)
    
      // TODO: Automatically determine output type based on extension (and allow override option).
    
      rdir = path.dirname(rfile);
      comps = path.basename(rfile).split('.');
      url = path.join(rdir, comps[0]) + '.html';
      
      self.add('/' + url);
    });
  });
  
  return site;
}
