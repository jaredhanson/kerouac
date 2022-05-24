var events = require('events')
  , util = require('util');


function Request(path) {
  events.EventEmitter.call(this);
  this.path = path;
}

util.inherits(Request, events.EventEmitter);


module.exports = Request;
