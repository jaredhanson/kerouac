/**
 * Module dependencies.
 */
var Router = require('./router')
  , Queue = require('./queue')
  , Page = require('./page')
  , Layout = require('./layout')
  , upath = require('canonical-path')
  , marked = require('marked-engine')
  , highlight = require('highlight.js')
  , yaml = require('js-yaml')
  , middleware = require('./middleware')
  //, plugins = require('./plugins')
  , fnpool = require('functionpool')
  , utils = require('./utils')
  , debug = require('debug')('kerouac');


/**
 * `Kerouac` constructor.
 *
 * A `Kerouac` instance is the interface for generating a static site, including
 * setting options and declaring pages.
 *
 * @api public
 */
function Kerouac() {
  this.settings = {};
  this.locals = {};
  this._engines = {};
  this._parsers = [];
  this._highlight;
  this._stack = [];
  this._cache = {};
  this._blocks = [];
  this._router = new Router();
  this.__defineGetter__('router', function() {
    this._usedRouter = true;
    return this._router.middleware;
  });
  this.defaultConfiguration();
}

/**
 * Initialize default configuration.
 *
 * @api private
 */
Kerouac.prototype.defaultConfiguration = function() {
  var self = this;
  
  this.engine('html', require('./engines/identity'));
  // register Markdown engine
  this.engine('md', marked, {
    gfm: true,
    pedantic: false,
    sanitize: false,
    highlight: function(code, lang) {
      return self.highlight(code, lang);
    }
  });
  
  // parse YAML and JSON front matter
  this.fm(function(data) {
    return yaml.safeLoad(data);
  });
  this.fm(function(data) {
    return JSON.parse(data);
  });
  
  // syntax highlighter
  highlight.configure({ classPrefix: '' });
  
  this.highlight(function(code, lang) {
    if (lang) return highlight.highlight(lang, code).value;
    return highlight.highlightAuto(code).value;
  });
  
  // default settings
  this.set('layouts', process.cwd() + '/layouts');
  this.set('output', process.cwd() + '/dist');
  this.set('layout engine', 'ejs');
  
  // default locals
  this.locals.settings = this.settings;
  
  // implicit middleware
  this.use(require('./middleware/init')());
}

/**
 * Utilize the given middleware `fn` to the given `path`, defaulting to _/_.
 *
 * Examples:
 *
 *     site.use(kerouac.prettyURLs());
 *
 * @param {String|Function} path
 * @param {Function} fn
 * @return {Kerouac} for chaining
 * @api public
 */
Kerouac.prototype.use = function(path, fn) {
  // default route to '/'
  if ('string' != typeof path) {
    fn = path;
    path = '/';
  }
  
  // strip trailing slash
  if ('/' == path[path.length - 1]) {
    path = path.slice(0, -1);
  }
  
  // wrap sub-apps
  if ('function' == typeof fn.handle) {
    var server = fn;
    // TODO: Set originalPath before dispatch
    server.parent = this;
    server.path = path;
    fn = function(page, next) {
      server.handle(page, next);
    };
    // also wrap sub-app bind
    this.bind(server);
  }
  
  // add the middleware
  debug('use %s %s', path || '/', fn.name || 'anonymous');
  this._stack.push({ path: path, handle: fn });
  
  return this;
}

/**
 * Plug `plugin` into site.
 *
 * Plugins common pieces of a site, such as sitemaps and RSS feeds to be reused
 * across projects.
 *
 * Examples:
 *
 *     site.plug(require('kerouac-sitemap')());
 *
 * @param {PlugIn} plugin
 * @return {Kerouac} for chaining
 * @api public
 */
Kerouac.prototype.plug = function(plugin) {
  debug('plugin %s', plugin.name || 'anonymous');
  // TODO: Remove this
  //plugin.call(undefined, this, this.site);
  return this;
}

Kerouac.prototype.content = function(path) {
  //this.plug(plugins.content(path));
  this.use(require('./plugins/content')(path));
}

Kerouac.prototype.assets = 
Kerouac.prototype.static = function(path) {
  //this.plug(plugins.assets(path));
  this.plug(require('./plugins/assets')(path));
}

/**
 * Register the given template engine callback `fn` as `ext`.
 *
 * Template engines in Kerouac are used to render:
 *
 *   - content: Text written in leightweight markup, which optionally has front
 *              matter.  Front matter will be removed from the text prior to
 *              rendering.  `data` is passed to the engine's `render()`
 *              function.
 *
 *   - layouts: Layouts used when generating web pages.  The path of the layout
 *              file will be passed to the engine's `renderFile()` function.
 *
 *
 * By default Kerouac will `require()` the engine based on the file extension.
 * For example if you try to render a "foo.jade" file Kerouac will invoke the
 * following internally:
 *
 *     site.engine('jade', require('jade'));
 *
 * The module is expected to export a `.renderFile` function, or, for
 * compatibility with Express, an `__express` function.
 *
 * For engines that do not provide `.renderFile` out of the box, or if you wish
 * to "map" a different extension to the template engine you may use this
 * method. For example mapping the EJS template engine to ".html" files:
 *
 *     site.engine('html', require('ejs').renderFile);
 *
 * Additionally, template engines are used to render lightweight markup found in
 * content files.  For example using Textile:
 *
 *     site.engine('textile', require('textile-engine'));
 *
 * In this case, it is expected that the module export a `render` function which
 * will be passed content data (after removing any front matter).
 *
 * @param {String} ext
 * @param {Function|Module} fn
 * @param {Object} options
 * @return {site} for chaining
 * @api public
 */
Kerouac.prototype.engine = function(ext, fn, options) {
  var mod = {};
  if (typeof fn == 'function') {
    mod.renderFile = fn;
  } else if (typeof fn == 'object') {
    mod.renderFile = fn.renderFile || fn.__express;
    mod.render = fn.render;
    mod.options = options;
  }
  if ('function' != typeof mod.renderFile) throw new Error('renderFile function required');
  
  if ('.' != ext[0]) ext = '.' + ext;
  this._engines[ext] = mod;
  return this;
}

/**
 * Registers a function used to parse front matter.
 *
 * By default, Kerouac will parse front matter in YAML or JSON format.  It is
 * not necessary to register additional parsing functions unless use of another
 * format is required.
 *
 * Examples:
 *
 *     site.fm(function(data) {
 *       return JSON.parse(data);
 *     });
 *
 * @param {Function} fn
 * @return {site} for chaining
 * @api public
 */
Kerouac.prototype.fm = function(fn) {
  if (typeof fn === 'function') {
    this._parsers.push(fn);
    return this;
  }
  
  // private implementation that traverses the chain of parsers, attempting
  // to parse front matter
  var parsers = this._parsers
    , data = fn
    , ex;
    
  if (data.length == 0) { return; } // no front matter
    
  for (var i = 0, len = parsers.length; i < len; i++) {
    var parse = parsers[i];
    try {
      var o = parse(data);
      if (o && typeof o == 'object') { return o; }
    } catch (e) {
      debug('fm parse exception: ' + e);
      ex = ex || e; // preserve first exception
    }
  }
  if (ex) { throw ex; }
}

/**
 * Registers a function used for syntax highlighting.
 *
 * By default, Kerouac will highlight syntax using highlight.js.  It is not
 * necessary to register a function unless you want to override this behavior.
 *
 * Examples:
 *
 *     site.highlight(function(code, lang) {
 *       if (lang) return hljs.highlight(lang, code).value;
 *       return hljs.highlightAuto(code).value;
 *     });
 *
 * @param {Function} fn
 * @api public
 */
Kerouac.prototype.highlight = function(code, lang) {
  if (typeof code === 'function') {
    this._highlight = code;
    return this;
  }
  
  if (this._highlight) return this._highlight(code, lang);
  return code;
}

/**
 * Assign `setting` to `val`, or return `setting`'s value.
 *
 *    site.set('foo', 'bar');
 *    site.get('foo');
 *    // => "bar"
 *
 * @param {String} setting
 * @param {String} val
 * @return {Kerouac} for chaining
 * @api public
 */
Kerouac.prototype.get =
Kerouac.prototype.set = function(setting, val) {
  // translate for Express compatibility
  if (setting === 'view engine') { setting = 'layout engine' }
  
  if (1 == arguments.length) {
    return this.settings[setting];
  } else {
    this.settings[setting] = val;
    return this;
  }
}

/**
 * Check if `setting` is enabled (truthy).
 *
 *    site.enabled('foo')
 *    // => false
 *
 *    site.enable('foo')
 *    site.enabled('foo')
 *    // => true
 *
 * @param {String} setting
 * @return {Boolean}
 * @api public
 */
Kerouac.prototype.enabled = function(setting) {
  return !!this.set(setting);
}

/**
 * Check if `setting` is disabled.
 *
 *    site.disabled('foo')
 *    // => true
 *
 *    site.enable('foo')
 *    site.disabled('foo')
 *    // => false
 *
 * @param {String} setting
 * @return {Boolean}
 * @api public
 */
Kerouac.prototype.disabled = function(setting) {
  return !this.set(setting);
}

/**
 * Enable `setting`.
 *
 * @param {String} setting
 * @return {Kerouac} for chaining
 * @api public
 */
Kerouac.prototype.enable = function(setting) {
  return this.set(setting, true);
};

/**
 * Disable `setting`.
 *
 * @param {String} setting
 * @return {Kerouac} for chaining
 * @api public
 */
Kerouac.prototype.disable = function(setting) {
  return this.set(setting, false);
}

Kerouac.prototype.page = function(path, fns) {
  // add leading slash
  if ('/' != path[0]) {
    path = '/' + path;
  }
  
  var args = [].concat([].slice.call(arguments));
  if (!this._usedRouter) this.use(this.router);
  var type = this._router.route.apply(this._router, args);
  if (type.isWholePath()) {
    debug('declared %s', path);
    //this.site.add(path);
  }
  return this;
}

Kerouac.prototype.render = function(name, options, fn, file) {
  file = file !== undefined ? file : true;
  
  // support callback function as second arg
  if ('function' == typeof options) {
    fn = options, options = {};
  }
  
  if (file) {
    var opts = {}
      , cache = this._cache
      , engines = this._engines
      , layout;
    
    // merge app.locals
    utils.merge(opts, this.locals);

    // merge options._locals
    if (options._locals) utils.merge(opts, options._locals);
    
    // merge options
    utils.merge(opts, options);
    
    // set .cache unless explicitly provided
    opts.cache = null == opts.cache
      ? this.enabled('layout cache')
      : opts.cache;
      
    // primed cache
    if (opts.cache) layout = cache[name];
    
    // layout
    if (!layout) {
      layout = new Layout(name, {
        defaultEngine: this.get('layout engine'),
        root: this.get('layouts'),
        engines: engines
      });

      if (!layout.path) {
        var err = new Error('Failed to lookup layout "' + name + '"');
        err.layout = layout;
        return fn(err);
      }

      // prime the cache
      if (opts.cache) cache[name] = layout;
    }
    
    // render
    try {
      layout.render(opts, fn);
    } catch (err) {
      fn(err);
    }
  } else {
    var opts = {};
    
    // TODO: Respect default layout engine setting.
    var ext = options.engine || 'md';
    if ('.' != ext[0]) ext = '.' + ext;
    
    var engine = this._engines[ext];
    if (!engine) {
      this.engine(ext, require(ext.slice(1)));
      engine = this._engines[ext];
    }
    
    if (engine.options) utils.merge(opts, engine.options);
    utils.merge(opts, options);
    
    if ('function' != typeof engine.render) throw new Error('string rendering not supported by "' + ext + '" engine');
    engine.render(name, opts, fn);
  }
}

/**
 * Handle page generation, by running it through the middleware stack.
 *
 * @api private
 */
Kerouac.prototype.handle = function(page, cb) {
  cb = cb || function() {};
  
  //console.log('# ' + page.path);
  //console.log(this);
  
  page.once('close', function() {
    // page closed.  clear `cb` in case any middleware calls `next` after `page.end`
    var done = cb;
    cb = function() {};
    done();
  });
  
  var self = this
    , stack = this._stack
    , idx = 0
    , removed = ''
  
  // store the original path
  page.originalPath = page.originalPath || page.path;
  
  function next(err) {
    if (removed.length !== 0) {
      page.path = removed + page.path;
      removed = '';
    }
    
    var layer = stack[idx++]
      , path, route
      , c;

    // all done
    if (!layer) { return cb(err); }

    try {
      path = page.path;
      route = layer.path;
      
      // skip this layer if the route doesn't match
      if (0 != path.toLowerCase().indexOf(route.toLowerCase())) { return next(err); }

      // skip if route match does not border "/", ".", or end
      c = path[route.length];
      if (c && '/' != c && '.' != c) { return next(err); }

      // trim off the part of the url that matches the route
      if (route.length !== 0 && route !== '/') {
        removed = route;
        page.path = page.path.substr(removed.length);
      }

      debug('%s', layer.handle.name || 'anonymous');
      var arity = layer.handle.length;
      if (err) {
        if (arity == 3) {
          layer.handle(err, page, next);
        } else {
          next(err);
        }
      } else if (arity < 3) {
        layer.handle(page, next);
      } else {
        next();
      }
    } catch (e) {
      next(e);
    }
  }
  next();
}

Kerouac.prototype.bind = function(fn) {
  if ('function' == typeof fn.generate) {
    var server = fn;
    fn = function(cb) {
      server._bind(this._q, cb);
    };
  }
  
  this._blocks.push(fn);
}

Kerouac.prototype._bind = function(q, cb) {
  cb = cb || function() {};
  
  var self = this
    , blocks = this._blocks;
    
  (function iter(i, err) {
    if (err) { return cb(err); }

    var block = blocks[i];
    if (!block) { return cb(); } // done

    debug('generating %s', block.name || 'undefined');
    block.call(new Queue(self, q));
    iter(i + 1);
  })(0);
}


/**
 * Generate site.
 *
 * This function will generate a static site, writing pages to the directory
 * specified in the 'output' setting (defaulting to 'output').
 *
 * Examples:
 *
 *     site.generate(function(err) {
 *       if (err) {
 *         console.error(err.message);
 *         console.error(err.stack);
 *         return;
 *       }
 *    });
 *
 * @api public
 */
Kerouac.prototype.generate = function(cb) {
  cb = cb || function() {};
  
  var self = this
    , queue = []
    , pages = [];
  
  // Iterate over all blocks which bind content which needs to be generated for
  // the site to the routes which will generate that content.
  this._bind(queue, function(err) {
    if (err) { return cb(err); }
  
    // Binding is complete, producing a complete list of all pages that need
    // to be generated.  Dispatch those pages into the application, so that
    // the content can be written to files which constitute the static site.
    
    function dispatch(req, done) {
      var site = req.site
        , path = upath.join(site.path || '', req.path)
        , parent = site.parent;
      while (parent) {
        path = upath.join(parent.path || '', path);
        parent = parent.parent;
      }
      
      console.log('# ' + path);
      
      var page = new Page(path, site);
      pages.push(page);
      
      page.once('close', done);
      page.site = self;
      page.pages = pages;
      self.handle(page);
    }
    
    var pool = new fnpool.Pool({ size: 1 }, dispatch)
      , req, i, len;
    
    pool.once('idle', function() {
      return cb();
    })
    
    for (i = 0, len = queue.length; i < len; ++i) {
      req = queue[i];
      pool.task(req);
    }
  });
}


/**
 * Create a Kerouac site.
 *
 * @return {Function}
 * @api public
 */
function createSite() {
  return new Kerouac();
}

/**
 * Expose `createSite`.
 *
 * @api public
 */
exports = module.exports = createSite;

/**
 * Expose middleware.
 */
for (var key in middleware) {
  Object.defineProperty(
      exports
    , key
    , Object.getOwnPropertyDescriptor(middleware, key));
}

/**
 * Expose CLI.
 *
 * @api private
 */
exports.cli = require('./cli');
