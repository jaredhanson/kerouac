/**
 * Module dependencies.
 */
var kerouac = require('../index')
  , copy = require('../middleware/copy')
  , Mapper = require('./assets/mapper');


exports = module.exports = function(dir) {
  dir = dir || 'assets';
  
  var site = kerouac();
  site.page('/*', copy(dir));
  return site;
};

exports.createMapper = function(dir) {
  return new Mapper(dir);
};
