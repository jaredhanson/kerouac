var cpath = require('canonical-path')
  , Request = require('./request');


/**
 * Returns a request function to be mixed into a `Client` instance.
 *
 * This function creates a request function that will be invoked when a client
 * requests a page.
 *
 * The function is bound to a mount path, of which the client is unaware.  This
 * allows clients to be written which generate sub-sites of a larger site.  The
 * larger site can mount these sub-sites at a path of its choosing, while the
 * sub-site requests paths as if they were relative to the root path.  In this
 * way sites can be composed of any number of (potentially reusable) sub-sites.
 */
exports.createRequestFn = function(mountpath) {
  
  return function request(path, callback) {
    var loc = cpath.join(mountpath || '', path);
    
    var req = new Request(loc);
    if (callback) { req.once('response', callback); }
    this.emit('request', req);
    return req;
  }
};
