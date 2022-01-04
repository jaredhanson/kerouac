var diveSync = require('diveSync')
  , path = require('path')
  , events = require('events')
  , util = require('util');


function DirectoryDriver(dir) {
  events.EventEmitter.call(this);
  this._root = dir || 'content';
}

util.inherits(DirectoryDriver, events.EventEmitter);

DirectoryDriver.prototype.start = function() {
  var self = this
    , root = path.resolve(this._root);
  
  diveSync(root, function(err, file) {
    // TODO: Emit error ???
    if (err) { throw err; }
    
    
    console.log(file);
    
    var rfile = path.relative(root, file);
    
    // TODO: Automatically determine output type based on extension (and allow override option).
    
    var rdir = path.dirname(rfile);
    var comps = path.basename(rfile).split('.');
    var url = path.join(rdir, comps[0]) + '.html';
    
    //self.emit('request', '/' + url);
    self.request('/' + url);
  });
  
  console.log('ENDED!');
  this.emit('finish');
  
  // TOOD: Factor this out.
  //this.emit('request', '/sitemap.xml');
  //this.emit('request', '/sitemap-index.xml');
  //this.emit('request', '/robots.txt');
};


module.exports = DirectoryDriver;
