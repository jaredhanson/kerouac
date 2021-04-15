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
  
  
  // TODO: Put this stuff back
  /*
  site.page('/*.html',
    middleware.manifest(),
    middleware.canonicalURL(),
    require('../middleware/findFile')(dir),
    middleware.timestamps(),
    middleware.layout(options.layout),
    middleware.loadContent(dir),
    middleware.render());
  */
  
  site.page('/*.html', function(page, next) {
    console.log('CONTENT GENERATE PAGE!');
    console.log(page.path);
  });
  
  return site;
}
