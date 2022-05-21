var diveSync = require('diveSync')
  , path = require('path')
  , events = require('events')
  , util = require('util');


function FSDriver(dir) {
  events.EventEmitter.call(this);
  this._root = dir;
}

util.inherits(FSDriver, events.EventEmitter);

FSDriver.prototype.go = function() {
  var self = this
    , root = path.resolve(this._root);
  
  diveSync(root, function(err, file) {
    if (err) { throw err; }

    var rfile = path.relative(root, file);
    self.emit('request', '/' + rfile);
  });
};


module.exports = FSDriver;
