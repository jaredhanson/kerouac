// Module dependencies.
var events = require('events')
  , Client = require('./client')
  , Page = require('../page')
  , fnpool = require('functionpool')
  , util = require('util');


/**
 * This class is used to create a static site server.
 *
 * @classdesc This `Server` receives requests to generate a file at a particular
 * path on the file system.  The set of all these files constitutes a site.
 *
 * The use of the term "server" here is a bit of a misnomer, as it is not
 * actually serving any files to a network client.  It is expected that the
 * generated site will be made available over the network by another server,
 * typically via HTTP.
 *
 * @private
 * @class
 */
function Server() {
  this._clients = [];
  
  var self = this;
  // Create a function pool which will be used to used to dispatch requests to
  // generate pages.  The size of this pool is used to control how many pages
  // will be generated concurrently.
  this._pool = new fnpool.Pool({ size: 1 }, function generate(req, done) {
    // Construct a new page which will be written to the requested path.
    var page = new Page(req.path);
    page.once('close', done);
    
    process.nextTick(function() {
      // Emit a 'response' event containing the page from the request.  Clients
      // listen for this event in order to initialize properties on the page
      // prior to it being generated.  This functionality is primarily used by
      // the Sitemap protocol and the Robots Exclusion Protocol which create
      // pages containing content derived from properties of other pages on the
      // site.
      req.emit('response', page);
      // Emit a 'request' event from the server.  It is expected that a listener
      // is listening for this event, which will generate the page.
      self.emit('request', page);
    });
  });
  
  // TODO: Ensure that this is the correct event emitted from pool when no
  //       more work is available.  Pay particular attention when more than 1
  //       worker is performing tasks in parallel.
  this._pool.on('idle', function() {
    // Emit a 'close' event from the server, indicating that all clients are
    // ended and the server has closed.
    self.emit('close');
  });
}

// Inherit from `events.EventEmitter`.
util.inherits(Server, events.EventEmitter);

/**
 * Accept a client.
 *
 * This function accepts a client.  Accepting a client will register a listener
 * for `'request'` events, triggering generation of the requested page.
 * `Client#map` will be called on the client, causing the client to begin
 * "mapping" the site and requesting its constituent pages.
 *
 * @private
 * @param {Client} client
 * @param {string} mountpath - Path at which the requested pages will be written.
 */
Server.prototype.accept = function(client, mountpath) {
  var self = this;
  
  // Augment the client with `request()` and `end()` functions.
  client.request = Client.createRequestFn(mountpath);
  client.end = Client.createEndFn();
  
  // Listen for request events and add them to pool for workers to process.
  // When processed, the request will be dispatched to the server, which will
  // generate the page.
  client.on('request', function(req) {
    self._pool.task(req);
  });
  
  client.on('finish', function() {
    var i = self._clients.indexOf(this);
    if (i != -1) {
      self._clients.splice(i, 1);
    }
    
    // TODO: document what this is doing
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
