/**
 * Module dependencies.
 */
var kerouac = require('../index')
  , middleware = require('../middleware')
  , DirectoryDriver = require('./content/driver')
  , fs = require('fs')
  , path = require('path')
  , fm = require('headmatter')
  , utils = require('../utils');


exports = module.exports = function(dir, options) {
  dir = dir || 'content';
  options = options || {};
  
  var site = new kerouac.Router();
  
  site.driver = new DirectoryDriver(dir);
  
  /*
  site.on('mount', function onmount(parent) {
    // inherit settings
    this.set('layout engine', parent.get('layout engine'));
    
    this.locals.pretty = parent.locals.pretty;
  });
  */
  
  site.page('/*.html',
    middleware.manifest(),
    middleware.canonicalURL(),
    require('../middleware/findFile')(dir),
    middleware.timestamps(),
    middleware.layout(options.layout),
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
    middleware.render());
  
  return site;
}
