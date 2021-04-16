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
  , fnpool = require('functionpool')
  , utils = require('./utils')
  , setPrototypeOf = require('setprototypeof')
  , flatten = require('array-flatten')
  , slice = Array.prototype.slice
  , debug = require('debug')('kerouac');


/**
 * Application prototype.
 */
var app = exports = module.exports = {};

/**
 * Initialize the site.
 *
 * @private
 */
app.init = function() {
  this.pages = [];
  this.settings = {};
  this.locals = {};
  this._engines = {};
  this._parsers = [];
  this._highlight;
  this._stack = [];
  this._cache = {};
  this._spaths = [];
  this._drivers = [];
  
  this.defaultConfiguration();
}

/**
 * Initialize site configuration.
 *
 * @private
 */
app.defaultConfiguration = function() {
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
  
  this.on('mount', function onmount(parent) {
    // inherit protos
    setPrototypeOf(this.Page, parent.Page);
    
    setPrototypeOf(this._engines, parent._engines);
    setPrototypeOf(this.settings, parent.settings);
  });
  
  // default settings
  this.set('layouts', process.cwd() + '/layouts');
  this.set('output', process.cwd() + '/www');
  this.set('layout engine', 'ejs');
  
  // default locals
  this.locals.settings = this.settings;
  
  // implicit middleware
  // TODO: Put this stuff back?
  //this.use(require('./middleware/init')());
  //this.use(middleware.prettyURL());
  //this.use(require('./middleware/absoluteURL')());
  //this.use(require('./middleware/manifest')());
  //this.use(require('./middleware/canonicalURL')());
}

app.lazyrouter = function lazyrouter() {
  if (!this._router) {
    this._router = new Router({
      caseSensitive: this.enabled('case sensitive routing'),
      strict: this.enabled('strict routing')
    });
    
    // TODO: Remove this and use middleware in router below
    //this.use(this._router.middleware);
    
    this.use(require('./middleware/init')(this));
    this.use(middleware.prettyURL());
    this.use(require('./middleware/absoluteURL')());
    this.use(require('./middleware/manifest')());
    this.use(require('./middleware/canonicalURL')());
    //this._router.use(query(this.get('query parser fn')));
    //this._router.use(middleware.init(this));
  }
};

/**
 * Utilize the given middleware `fn` to the given `path`, defaulting to _/_.
 *
 * Examples:
 *
 *     site.use(kerouac.prettyURLs());
 *
 * @param {String|Function} path
 * @param {Function} fn
 * @return {site} for chaining
 * @api public
 */
app.use = function(fn) {
  var offset = 0
    , path = '/';
  
  // default path to '/'
  // disambiguate app.use([fn])
  if (typeof fn !== 'function') {
    var arg = fn;
    while (Array.isArray(arg) && arg.length !== 0) {
      arg = arg[0];
    }
    // first arg is the path
    if (typeof arg !== 'function') {
      offset = 1;
      path = fn;
    }
  }
  
  var fns = flatten(slice.call(arguments, offset));
  if (fns.length === 0) {
    throw new TypeError('app.use() requires a middleware function')
  }
  
  // setup router
  this.lazyrouter();
  var router = this._router;
  
  fns.forEach(function(fn) {
    // non-kerouac app
    if (!fn || !fn.handle || !fn.set) {
      // TODO: Better driver reg
      if (fn.driver) {
        this._drivers.push({ driver: fn.driver , site: fn });
      }
      
      return router.use(path, fn);
    }

    debug('.use app under %s', path);
    fn.mountpath = path;
    fn.parent = this;

    // restore .app property on req and res
    router.use(path, function mounted_app(page, next) {
      var orig = page.app;
      fn.handle(page, function(err) {
        
        
        setPrototypeOf(page, orig.Page)
        //setPrototypeOf(res, orig.response)
        next(err);
      });
    });
    
    // TODO: Factor this into router?
    if (fn.driver) {
      this._drivers.push({ driver: fn.driver , site: fn });
    }

    // mounted an app
    fn.emit('mount', this);
  }, this);

  return this;
  
  // TODO: Remove below this line.
  
  // default route to '/'
  if ('string' != typeof path) {
    fn = path;
    path = '/';
  }
  
  // strip trailing slash
  if ('/' == path[path.length - 1]) {
    path = path.slice(0, -1);
  }
  
  var hasDriver = fn.driver;
  
  // wrap sub-apps
  if ('function' == typeof fn.handle) {
    var server = fn;
    // TODO: Set originalPath before dispatch
    server.parent = this;
    server.path = path;
    fn = function(page, next) {
      function restore(err) { page.site = page.site.parent; next(err); }
      server.handle(page, restore);
    };
    // also wrap sub-app bind
    this.bind(server);
    
    if (hasDriver) {
      this._drivers.push({ driver: hasDriver, site: server });
      // FIXME: Track the parent better, so this doesn't have to be cleared to avoid
      // if condition below
      hasDriver = false;
    }
    
    // mounted an app
    server.emit('mount', this);
  }
  
  if (hasDriver) {
    this._drivers.push({ driver: hasDriver, site: fn });
  }
  
  // add the middleware
  debug('use %s %s', path || '/', fn.name || 'anonymous');
  this._stack.push({ path: path, handle: fn });
  
  return this;
}

app.content = function(path, options) {
  //this.plug(plugins.content(path));
  this.use(require('./plugins/content')(path, options));
}

app.assets = 
app.static = function(path) {
  //this.plug(plugins.assets(path));
  this.use(require('./plugins/assets')(path));
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
app.engine = function(ext, fn, options) {
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
app.fm = function(fn) {
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
app.highlight = function(code, lang) {
  if (typeof code === 'function') {
    this._highlight = code;
    return this;
  }
  
  if (this._highlight) return this._highlight(code, lang);
  return code;
}

/*
Kerouac.prototype.path = function() {
  return this.parent
    ? this.parent.path() + this.mountpath
    : '';
}
*/

/**
 * Assign `setting` to `val`, or return `setting`'s value.
 *
 *    site.set('foo', 'bar');
 *    site.get('foo');
 *    // => "bar"
 *
 * @param {String} setting
 * @param {String} val
 * @return {site} for chaining
 * @api public
 */
app.get =
app.set = function(setting, val) {
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
app.enabled = function(setting) {
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
app.disabled = function(setting) {
  return !this.set(setting);
}

/**
 * Enable `setting`.
 *
 * @param {String} setting
 * @return {Kerouac} for chaining
 * @api public
 */
app.enable = function(setting) {
  return this.set(setting, true);
};

/**
 * Disable `setting`.
 *
 * @param {String} setting
 * @return {Kerouac} for chaining
 * @api public
 */
app.disable = function(setting) {
  return this.set(setting, false);
}

app.page = function(path, fns) {
  this.lazyrouter();

  var route = this._router.route(path);
  route.get.apply(route, slice.call(arguments, 1));
  return this;
  
  // TODO: Remove below here
  return;
  
  // add leading slash
  if ('/' != path[0]) {
    path = '/' + path;
  }
  
  var args = [].concat([].slice.call(arguments));
  this.lazyrouter();
  var type = this._router.route.apply(this._router, args);
  if (type.isBound()) {
    debug('declared %s', path);
    this._spaths.push(path);
  }
  return this;
}

app.render = function(name, options, fn, file) {
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
      try {
        this.engine(ext, require(ext.slice(1)));
        engine = this._engines[ext];
      } catch (ex) {
        // TODO: Throw ex
        console.log(ex)
      }
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
app.handle = function(page, callback) {
  var router = this._router;

  // TODO: Factor out to finalhandler
  // final handler
  var done = callback || function(page) {
    console.log('TODO: Page final handler');
  };

  // no routes
  if (!router) {
    debug('no routes defined on app');
    done();
    return;
  }
  
  router.handle(page, done);
  
  // TODO: Remove below here
  return;
  out = out || function() {};
  
  //console.log('# ' + page.path);
  //console.log(this);
  
  /*
  page.once('close', function() {
    // page closed.  clear `cb` in case any middleware calls `next` after `page.end`
    var done = cb;
    cb = function() {};
    done();
  });
  */
  
  var self = this
    , stack = this._stack
    , idx = 0
    , removed = ''
    , parentPath = page.basePath || '';
  
  page.site = this;
  this.pages.push(page);
  
  // store the original path
  page.basePath = parentPath;
  page.originalPath = page.originalPath || page.path;
  
  function next(err) {
    // restore altered req.path
    if (removed.length !== 0) {
      page.basePath = parentPath;
      page.path = removed + page.path;
      removed = '';
    }
    
    var layer = stack[idx++]
      , path, route
      , c;

    // all done
    if (!layer) { return out(err); }

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
        
        // Setup base path (no trailing slash)
        page.basePath = parentPath + (removed[removed.length - 1] === '/'
          ? removed.substring(0, removed.length - 1)
          : removed);
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

app._bind = function(q, cb) {
  cb = cb || function() {};
  
  var self = this
    , blocks = [];
    
  blocks.push(function() {
    var paths = self._spaths
      , i, len;
    for (i = 0, len = paths.length; i < len; ++i) {
      this.add(paths[i]);
    }
  });
    
  (function iter(i, err) {
    if (err) { return cb(err); }

    var block = blocks[i];
    if (!block) { return cb(); } // done

    debug('generating %s', block.name || 'undefined');
    var arity = block.length;
    if (arity == 1) {
      block.call(new Queue(self, q), function(err) {
        iter(i + 1, err);
      })
    } else { // arity == 0
      block.call(new Queue(self, q));
      iter(i + 1);
    }
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
app.generate = function(cb) {
  cb = cb || function() {};
  
  console.log('GENERATE!');
  
  
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
      
      var page = new Page(path, req.context);
      pages.push(page);
      
      page.once('close', done);
      //page.site = self;
      //page.pages = pages;
      self.handle(page);
    }
    
    var pool = new fnpool.Pool({ size: 1 }, dispatch)
      , req, i, len;
    
    pool.once('idle', function() {
      // TODO: Need to handle the case where if all pages were not generated, then
      // we still complete with a log.  Handle a page 'not found' event or somesuch
      
      //console.log(pages)
      return cb();
    })
    
    for (i = 0, len = queue.length; i < len; ++i) {
      req = queue[i];
      pool.task(req);
    }
    
    
    var pool2 = new fnpool.Pool({ size: 1 }, dispatch2)
    
    function dispatch2(req, done) {
      var page = new Page(req, {});
      
      page.once('close', done);
      self.handle(page);
    };
    
    
    var drivers = self._drivers;
    for (i = 0, len = drivers.length; i < len; ++i) {
      // TODO: Determine when driver is done, and has no more requests
      
      console.log('GO DRIVER');
      
      drivers[i].driver.on('request', bindSite(drivers[i].site, pool2));
      drivers[i].driver.go();
    }
  });
}

function bindSite(site, pool) {
  
  return function(p) {
    console.log('P: ' + p);
    //console.log(site.parent)
    
    // TODO: Shouldn't use mountpage here, but matched path
    
    var path = upath.join(site.mountpath || '', p)    
      , parent = site.parent;
    while (parent) {
      path = upath.join(parent.mountpath || '', path);
      parent = parent.parent;
    }
    
    console.log('#- ' + path);
    
    pool.task(path);
    
  };
};
