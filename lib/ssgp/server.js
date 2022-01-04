var events = require('events')
  , Client = require('./client')
  , Page = require('../page')
  , util = require('util');


function Server() {
  this._clients = [];
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
  
  client.on('finish', function() {
    const i = self._clients.indexOf(this);
    if (i != -1) {
      self._clients.splice(i, 1);
    }
    
    self.emit('disconnection');
  });
  
  this._clients.push(client);
  process.nextTick(function() {
    client.start();
  });
}

Server.prototype.getConnections = function() {
  return this._clients.length;
}


module.exports = Server;
