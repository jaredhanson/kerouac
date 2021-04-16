/**
 * Module dependencies.
 */
var kerouac = require('../index')
  , middleware = require('../middleware')
  , DirectoryDriver = require('./content/driver');


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
    middleware.loadContent(dir),
    middleware.render());
  
  return site;
}
