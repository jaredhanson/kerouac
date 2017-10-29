/**
 * Module dependencies.
 */
var kerouac = require('../index')
  , path = require('path')
  , diveSync = require('diveSync')
  , middleware = require('../middleware');


exports = module.exports = function(dir, options) {
  dir = dir || 'content';
  options = options || {};
  
  var site = kerouac();
  
  site.on('mount', function onmount(parent) {
    // inherit settings
    this.set('layout engine', parent.get('layout engine'));
    
    this.locals.pretty = parent.locals.pretty;
  });
  
  
  site.page('/*.html',
    middleware.manifest(),
    middleware.canonicalURL(),
    require('../middleware/findFile')(dir),
    middleware.timestamps(),
    middleware.layout(options.layout),
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
