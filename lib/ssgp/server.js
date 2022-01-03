var events = require('events')
  , Client = require('./client')
  , Page = require('../page')
  , util = require('util');


function Server() {
}

util.inherits(Server, events.EventEmitter);

Server.prototype.accept = function(client, mountpath) {
  var self = this;
  
  client.request = Client.createRequestFn(mountpath);
  
  client.on('request', function(req) {
    var page = new Page(req.path);
    self.emit('request', page);
    
    process.nextTick(function() {
      req.emit('response', page);
    });
  });
  client.go();
}


module.exports = Server;
