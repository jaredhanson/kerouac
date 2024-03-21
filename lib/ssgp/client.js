var cpath = require('canonical-path')
  , Request = require('./request');


/**
 * Returns a request function to be mixed into a `Client` instance.
 *
 * This function creates a request function that will be invoked when a client
 * requests a page.
 *
 * The function is bound to a mount path, of which the client is unaware.  This
 * allows clients to be written which generate sub-sites of a main site.  The
 * main site can mount these sub-sites at a path of its choosing, while the
 * clients request paths as if they were relative to the root path.  In this way
 * sites can be composed of any number of (potentially reusable) sub-sites.
 *
 * @private
 * @param {string} mountpath - Path at which pages requested by the client will
 *          be written.
 * @returns {Function}
 */
exports.createRequestFn = function(mountpath) {
  
  /**
   * Request a page.
   *
   * Requests a page at the given `path`.
   *
   * The optional callback will be added as a one-time listener for the
   * 'response' event.
   *
   * @public
   * @param {string} path
   * @param {Function} [callback]
   * @returns {Request}
   *
   * @example
   * client.request('/index.html');
   *
   * @example
   * var sitemaps = [];
   *
   * client.request('/robots.txt', function(page) {
   *   page.locals = page.locals || Object.create(null);
   *   page.locals.sitemaps = sitemaps;
   * });
   */
  return function request(path, callback) {
    var p = cpath.join(mountpath || '', path);
    
    var req = new Request(p);
    if (callback) { req.once('response', callback); }
    this.emit('request', req);
    return req;
  }
};

/**
 * Returns an end function to be mixed into a `Client` instance.
 *
 * This function creates an end function that will be invoked when a client
 * closes.
 *
 * @private
 * @returns {Function}
 */
exports.createEndFn = function() {
  
  /**
   * Closes the client.
   *
   * @public
   *
   * @example
   * client.end();
   */
  return function end() {
    this.emit('end');
  }
};
