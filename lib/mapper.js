var events = require('events')
  , util = require('util');

function Mapper() {
  events.EventEmitter.call(this);
  this._paths = [];
}

util.inherits(Mapper, events.EventEmitter);

Mapper.prototype.add = function(path) {
  this._paths.push(path);
};

Mapper.prototype.map = function() {
  var paths = this._paths
    , i, len;
  for (i = 0, len = paths.length; i < len; ++i) {
    this.request(paths[i]);
  }
  this.end();
};

module.exports = Mapper;
