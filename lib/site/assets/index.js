/**
 * Module dependencies.
 */
var kerouac = require('../../index')
  , fs = require('fs')
  , path = require('path')
  , Mapper = require('./mapper');


exports = module.exports = function(dir) {
  dir = dir || 'assets';
  
  var site = kerouac();
  site.page('/*', function copy(page, next) {
    var file = path.resolve(dir, page.params[0]);
    if (fs.existsSync(file)) {
      page.copy(file);
      return next();
    }
    
    // TODO: error not found?
    next();
  });
  return site;
};

exports.createMapper = function(dir) {
  return new Mapper(dir);
};
