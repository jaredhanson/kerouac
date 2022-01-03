var cpath = require('canonical-path')
  , Request = require('./request');


exports.createRequestFn = function(mountpath) {
  
  return function request(path, callback) {
    var loc = cpath.join(mountpath || '', path);
    
    var req = new Request(loc);
    if (callback) { req.once('response', callback); }
    this.emit('request', req);
    return req;
  }
};
