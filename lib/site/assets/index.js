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
  site.page('/*', kerouc.copy(dir));
  return site;
};

exports.createMapper = function(dir) {
  return new Mapper(dir);
};
