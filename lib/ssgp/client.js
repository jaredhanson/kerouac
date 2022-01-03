var cpath = require('canonical-path')
, Page = require('../page');


exports.createRequestFn = function(mountpath) {
  
  return function request(path, callback) {
    if (callback) { this.once('response', callback); }
    
    var loc = cpath.join(mountpath || '', path);
    var page = new Page(loc);
    this.emit('request', page);
    this.emit('response', page);
  }
};
