var events = require('events')
  , util = require('util');


function Request() {
}

util.inherits(Request, events.EventEmitter);


module.exports = Request;
