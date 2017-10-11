/**
 * Module dependencies.
 */
var kerouac = require('../index')
  , path = require('path')
  , diveSync = require('diveSync')
  , copy = require('../middleware/copy');


exports = module.exports = function(dir) {
  dir = dir || 'assets';
  
  var site = kerouac();
  
  site.page('/*', copy(dir));
  
  site.bind(function() {
    var self = this
      , adir = path.resolve(dir)
      , rfile;
      
    diveSync(adir, function(err, file) {
      if (err) { throw err; }
  
      rfile = path.relative(adir, file);
      console.log(rfile);
      
      self.add('/' + rfile);
    });
  });
  
  return site;
}
