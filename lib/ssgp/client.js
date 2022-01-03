var cpath = require('canonical-path')
  , Request = require('./request')
  , Page = require('../page');


exports.createRequestFn = function(mountpath) {
  
  return function request(path, callback) {
    var req = new Request();
    if (callback) { req.once('response', callback); }
    
    var loc = cpath.join(mountpath || '', path);
    var page = new Page(loc);
    this.emit('request', page);
    process.nextTick(function() {
      req.emit('response', page);
    });
    return req;
  }
};
