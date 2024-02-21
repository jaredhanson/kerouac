var path = require('path')
  , fs = require('fs')
  , utils = require('./utils')
  , dirname = path.dirname
  , basename = path.basename
  , extname = path.extname
  , join = path.join
  , exists = fs.existsSync || path.existsSync;

function Layout(name, options) {
  var engines = options.engines
    , defaultEngine = options.defaultEngine;
  
  this.name = name;
  this.root = options.root;
  var ext = this.ext = extname(name);
  if (!ext) name += (ext = this.ext = '.' + defaultEngine);
  this.engine = engines[ext] || (engines[ext] = require(ext.slice(1)).__express);
  this.path = this.lookup(name);
}

Layout.prototype.lookup = function(path) {
  var ext = this.ext;

  // <path>.<engine>
  if (!utils.isAbsolute(path)) path = join(this.root, path);
  if (exists(path)) return path;

  // <path>/index.<engine>
  path = join(dirname(path), basename(path, ext), 'index' + ext);
  if (exists(path)) return path;
};

Layout.prototype.render = function(options, fn) {
  var engine = this.engine;
  // ejs-locals compat
  if (this.ext === '.ejs') {
    options._layout = options.layout;
    delete options.layout;
  }
  
  //if ('function' != typeof engine.renderFile) throw new Error('file rendering not supported by "' + this.ext + '" engine');
  this.engine(this.path, options, fn);
};


module.exports = Layout;
