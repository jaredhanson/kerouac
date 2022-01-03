var events = require('events')
  , Client = require('./client')
  , util = require('util');


function Server() {
}

util.inherits(Server, events.EventEmitter);

Server.prototype.accept = function(client, mountpath) {
  var self = this;
  
  client.request = Client.createRequestFn(mountpath);
  
  client.on('request', function(page) {
    self.emit('request', page);
  });
  client.go();
}


module.exports = Server;
