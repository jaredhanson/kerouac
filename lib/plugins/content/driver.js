var diveSync = require('diveSync')
  , path = require('path')
  , events = require('events')
  , util = require('util');


function DirectoryDriver(dir) {
  events.EventEmitter.call(this);
  this._root = dir;
}

util.inherits(DirectoryDriver, events.EventEmitter);

DirectoryDriver.prototype.go = function() {
  var self = this
    , root = path.resolve(this._root);
  
  diveSync(root, function(err, file) {
    // TODO: Emit error ???
    if (err) { throw err; }
    
    var rfile = path.relative(root, file);
    
    // TODO: Automatically determine output type based on extension (and allow override option).
    
    var rdir = path.dirname(rfile);
    var comps = path.basename(rfile).split('.');
    var url = path.join(rdir, comps[0]) + '.html';
    
    self.emit('request', '/' + url);
  });
};


module.exports = DirectoryDriver;
