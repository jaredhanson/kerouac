/**
 * Module dependencies.
 */
var path = require('path')
  , diveSync = require('diveSync')
  , copy = require('../middleware/copy');


exports = module.exports = function(dir) {
  dir = dir || 'assets';
  
  return function assets(site, pages) {
    var adir = path.resolve(process.cwd(), dir)
      , rfile;
  
    diveSync(adir, function(err, file) {
      if (err) { throw err; }
    
      rfile = path.relative(adir, file);    
      site.page(rfile, copy(file));
    });
  }
}
