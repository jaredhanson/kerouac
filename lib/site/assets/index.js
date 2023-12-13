/**
 * Module dependencies.
 */
var Router = require('../../router')
  , copy = require('../../middleware/copy')
  , Mapper = require('./mapper');


exports = module.exports = function(dir) {
  dir = dir || 'assets';
  
  var router = new Router();
  router.page('/*', copy(dir));
  return router;
};

exports.createMapper = function(dir) {
  return new Mapper(dir);
};
