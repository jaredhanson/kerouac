/**
 * Module dependencies.
 */
var kerouac = require('../index')
  , fs = require('fs')
  , path = require('path')
  , fm = require('headmatter')
  , utils = require('../utils')
  , Mapper = require('./content/mapper');


exports = module.exports = function(dir, options) {
  dir = dir || 'content';
  options = options || {};
  
  var site = new kerouac.Router();
  
  var exts = [ '.md' ];
  
  /*
  site.on('mount', function onmount(parent) {
    // inherit settings
    this.set('layout engine', parent.get('layout engine'));
    
    this.locals.pretty = parent.locals.pretty;
  });
  */
  
  site.page('/*.html',
    function findFile(page, next) {
      var file, ext, exists
        , i, len;
    
      for (i = 0, len = exts.length; i < len; ++i) {
        ext = exts[i];
        file = path.resolve(dir, page.params[0] + ext);
        if (fs.existsSync(file)) {
          page.inputPath = file;
          return next();
        }
      }
    
      return next('route');
    },
    function timestamps(page, next) {
        fs.stat(page.inputPath, function(err, stat) {
          if (err) { return next(err); }
          page.createdAt = stat.birthtime;
          page.modifiedAt = stat.mtime;
          next();
        });
      }
    ,
    function(page, next) {
      if (options.layout) { page.layout = options.layout; }
      next();
    },
    function loadContent(page, next) {
      var site = page.app
        , i, len;
    
      fs.readFile(page.inputPath, 'utf8', function(err, str) {
        if (err) { return next(err); }
      
        var data;
        try {
          data = fm.parse(str, site.fm.bind(site));
        } catch (ex) {
          throw new Error('Failed to parse front matter from file: ' + file);
        }
      
        if (data.head) utils.merge(page.locals, data.head);
        if (data.head && data.head.layout) { page.layout = data.head.layout; }
      
        page.markup = path.extname(page.inputPath).substr(1);
        page.content = data.content;
      
        next();
      });
    },
    function render(page, next) {
        var site = page.app;
    
        site.convert(page.content, page.markup, function(err, out) {
          page.locals.content = out;
          page.render();
        });
      }
    );
  
  return site;
};

exports.createMapper = function(dir) {
  return new Mapper(dir);
};
