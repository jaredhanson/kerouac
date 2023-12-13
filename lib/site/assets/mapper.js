var events = require('events')
  , path = require('path')
  , dive = require('dive')
  , util = require('util');


function Mapper(dir) {
  events.EventEmitter.call(this);
  this._root = dir || 'assets';
}

util.inherits(Mapper, events.EventEmitter);

Mapper.prototype.map = function() {
  var self = this
    , root = path.resolve(this._root);
  
  dive(root, function(err, file, stat) {
    if (err) { return; }
    
    var p = path.relative(self._root, file);
    self.request('/' + p);
  }, function() {
    self.end();
  });
};


module.exports = Mapper;
