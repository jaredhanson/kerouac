/**
 * Module dependencies.
 */
var kerouac = require('../index')
  , copy = require('../middleware/copy')
  , Mapper = require('./assets/mapper');


exports = module.exports = function(dir) {
  dir = dir || 'assets';
  
  var site = kerouac();
  
  site.driver = new Mapper(dir);
  
  site.page('/*', copy(dir));
  
  return site;
}
