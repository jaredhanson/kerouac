var events = require('events')
  , Client = require('./client')
  , Page = require('../page')
  , fnpool = require('functionpool')
  , util = require('util');


/**
 * This class is used to create a SSGP server.
 */
function Server() {
  this._clients = [];
  
  var self = this;
  // Create a function pool which will be used to used to dispatch requests to
  // generate pages.  The size of this pool is used to control how many pages
  // will be generated concurrently.
  this._pool = new fnpool.Pool({ size: 1 }, function generate(req, done) {
    var page = new Page(req.path);
    page.once('close', done);
    
    process.nextTick(function() {
      // Emit the request `'response'` event before the server `'request'`
      // event.  This allows the client an opportunity to initialize properties
      // on the page prior to it being generated.  This functionality is
      // primarily used by the Sitemap protocol and the Robots Exclusion
      // Protocol which create pages containing content derived from properties
      // of other pages on the site.
      req.emit('response', page);
      // Emit a request event.  It is expected that a listener is listening for
      // this event, which will generate the page.
      self.emit('request', page);
    });
  });
}

util.inherits(Server, events.EventEmitter);

/**
 * Accept a client
 *
 * This function accepts a client.  Accepting a client will register a listener
 * for `'request'` events, which will trigger generation of the requested page.
 * It will also invoke `Client#map()` on the client, which will cause the client
 * to begin requesting pages.
 */
Server.prototype.accept = function(client, mountpath) {
  var self = this;
  
  client.request = Client.createRequestFn(mountpath);
  client.end = Client.createEndFn();
  
  client.on('request', function(req) {
    self._pool.task(req);
  });
  
  client.on('finish', function() {
    var i = self._clients.indexOf(this);
    if (i != -1) {
      self._clients.splice(i, 1);
    }
    
    if (self._clients.length > 0) {
      var waiting = self._clients.every(function(c) { return c.wait === true; })
      if (waiting) {
        self.emit('finish');
      }
    } else {
      // TODO: close after pool drain
    }
  });
  
  this._clients.push(client);
  client.map(self);
}


module.exports = Server;
