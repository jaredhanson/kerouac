/**
 * Module dependencies.
 */
var kerouac = require('../index')
  , copy = require('../middleware/copy')
  , FSDriver = require('./assets/driver');


exports = module.exports = function(dir) {
  dir = dir || 'assets';
  
  var site = kerouac();
  
  site.driver = new FSDriver(dir);
  
  site.page('/*', copy(dir));
  
  return site;
}
