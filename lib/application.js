/**
 * Module dependencies.
 */
var Router = require('./router')
  , finalhandler = require('./finalhandler')
  , Page = require('./page')
  , Layout = require('./layout')
  , upath = require('canonical-path')
  , marked = require('marked-engine')
  , highlight = require('highlight.js')
  , yaml = require('js-yaml')
  , ssgp = require('./ssgp')
  , fnpool = require('functionpool')
  , utils = require('./utils')
  , setPrototypeOf = require('setprototypeof')
  , flatten = require('array-flatten')
  , slice = Array.prototype.slice
  , debug = require('debug')('kerouac');
  
var merge = utils.merge;
  

/**
 * Application prototype.
 */
var app = exports = module.exports = {};

/**
 * Initialize the site.
 *
 * @private
 */
app.init = function init() {
  this.engines = {};
  this.settings = {};
  this.converters = {};
  this._parsers = [];
  this._highlight;
  this._cache = {};
  
  this.defaultConfiguration();
}

/**
 * Initialize site configuration.
 *
 * @private
 */
app.defaultConfiguration = function defaultConfiguration() {
  var env = process.env.NODE_ENV || 'development';
  
  // default settings
  this.set('env', env);
  
  this.on('mount', function onmount(parent) {
    console.log('**** APP MOUNTED *****');
    //console.log(parent);
    
    // inherit protos
    setPrototypeOf(this.pageext, parent.pageext);
    setPrototypeOf(this.engines, parent.engines);
    setPrototypeOf(this.settings, parent.settings);
  });
  
  // setup locals
  this.locals = Object.create(null);
  
  // top-most app is mounted at /
  this.mountpath = '/';
  
  // default locals
  this.locals.settings = this.settings;
  
  // default settings
  this.set('layouts', process.cwd() + '/layouts'); // TODO: resolve the path
  // default site output to '_site' directory, matching the convention
  // established by other generators such as Jekyll and Eleventy.
  this.set('output', '_site'); // TODO: resolve the path
  this.set('layout engine', 'ejs'); // TODO: Remove this?
  
  if (env === 'production') {
    this.enable('view cache');
  }
  
  
  var self = this;
  
  this.converter('md', marked.render, {
    gfm: true,
    pedantic: false,
    sanitize: false,
    langPrefix: '',
    highlight: function(code, lang) {
      return self.highlight(code, lang);
    }
  });
  this.converter('md', 'txt', require('./converters/md/txt'), {
    // TODO: can remove highlight, etc here
    gfm: true,
    pedantic: false,
    sanitize: false,
    langPrefix: '',
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
}

app.lazyrouter = function lazyrouter() {
  if (!this._router) {
    this._router = new Router({
      caseSensitive: this.enabled('case sensitive routing'),
      strict: this.enabled('strict routing')
    });
    
    // TODO: Maybe don't use all these by default?
    //.       base there use on settings?
    this.use(require('./middleware/init')(this));
    this.use(require('./middleware/prettyURL')());
    this.use(require('./middleware/absoluteURL')());
    this.use(require('./middleware/canonicalURL')());
  }
};

/**
 * Handle page generation, by running it through the middleware stack.
 *
 * @api private
 */
app.handle = function handle(page, callback) {
  console.log('-#: ' + page.path);
  
  var router = this._router;
  
  // final handler
  var done = callback || finalhandler(page);

  // no routes
  if (!router) {
    debug('no routes defined on app');
    done();
    return;
  }
  
  router.handle(page, done);
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
app.use = function use(fn) {
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
      return router.use(path, fn);
    }

    debug('.use app under %s', path);
    fn.mountpath = path;
    fn.parent = this;

    // restore .app property on req and res
    router.use(path, function mounted_app(page, next) {
      var orig = page.app;
      fn.handle(page, function(err) {
        setPrototypeOf(page, orig.pageext)
        next(err);
      });
    });

    // mounted an app
    fn.emit('mount', this);
  }, this);

  return this;
}

app.route = function route(path) {
  this.lazyrouter();
  return this._router.route(path);
};


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
app.engine = function engine(ext, fn) {
  // TODO: move markdown to converter
  if (typeof fn != 'function') {
    throw new Error('callback function required');
  }
  
  // get file extension
  var extension = ext[0] !== '.'
    ? '.' + ext
    : ext;
  // store engine
  this.engines[extension] = fn;
  return this;
}

app.converter = function converter(ext, oext, fn, options) {
  if (typeof oext === 'function') {
    options = fn;
    fn = oext;
    oext = '.html';
  }
  
  if (typeof fn !== 'function') {
    throw new Error('callback function required');
  }

  var opts = options;
  // get file extension
  var extension = ext[0] !== '.'
    ? '.' + ext
    : ext;
  var oextension = oext[0] !== '.'
    ? '.' + oext
    : oext;
  
  // store converter
  this.converters[extension + oextension] = { convert: fn, options: opts };

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
app.set = function set(setting, val) {
  // translate for Express compatibility
  if (setting === 'view engine') { setting = 'layout engine' }
  
  if (arguments.length === 1) {
    // app.get(setting)
    return this.settings[setting];
  }
  
  // set value
  this.settings[setting] = val;
  return this;
}

app.path = function path() {
  return this.parent
    ? this.parent.path() + this.mountpath
    : '';
};

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
app.enabled = function enabled(setting) {
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
app.disabled = function disabled(setting) {
  return !this.set(setting);
}

/**
 * Enable `setting`.
 *
 * @param {String} setting
 * @return {Kerouac} for chaining
 * @api public
 */
app.enable = function enable(setting) {
  return this.set(setting, true);
};

/**
 * Disable `setting`.
 *
 * @param {String} setting
 * @return {Kerouac} for chaining
 * @api public
 */
app.disable = function disable(setting) {
  return this.set(setting, false);
}

app.page = function(path, fns) {
  this.lazyrouter();

  var route = this._router.route(path);
  route.put.apply(route, slice.call(arguments, 1));
  return this;
}

app.render = function(name, options, callback) {
  var cache = this.cache;
  var done = callback;
  var engines = this.engines;
  var opts = options;
  var renderOptions = {};
  var layout;
  
  // support callback function as second arg
  if (typeof options === 'function') {
    done = options;
    opts = {};
  }
  
  // merge app.locals
  merge(renderOptions, this.locals);

  // merge options._locals
  if (opts._locals) {
    merge(renderOptions, opts._locals);
  }
  
  // merge options
  merge(renderOptions, opts);
  
  // set .cache unless explicitly provided
  if (renderOptions.cache == null) {
    renderOptions.cache = this.enabled('layout cache');
  }
    
  // primed cache
  if (renderOptions.cache) {
    layout = cache[name];
  }
  
  // layout
  if (!layout) {
    layout = new Layout(name, {
      defaultEngine: this.get('layout engine'),
      root: this.get('layouts'),
      engines: engines
    });
    
    if (!layout.path) {
      var dirs = Array.isArray(layout.root) && layout.root.length > 1
        ? 'directories "' + layout.root.slice(0, -1).join('", "') + '" or "' + layout.root[layout.root.length - 1] + '"'
        : 'directory "' + layout.root + '"'
      var err = new Error('Failed to lookup layout "' + name + '" in layouts ' + dirs);
      err.layout = layout;
      return done(err);
    }

    // prime the cache
    if (renderOptions.cache) {
      cache[name] = layout;
    }
  }
  
  // render
  tryRender(layout, renderOptions, done);
}

app.convert = function(str, type, otype, options, callback) {
  if (typeof otype === 'function') {
    callback = otype;
    options = {};
    otype = '.html';
  } else if (typeof options == 'function') {
    callback = options;
    options = {};
  }

  var done = callback;
  var opts = options || {};
  var extension = type[0] !== '.'
    ? '.' + type
    : type;
  var oextension = otype[0] !== '.'
    ? '.' + otype
    : otype;
  
  var converter = this.converters[extension + oextension];
  
  if (!converter) {
    // TODO: test this, better error
    throw new Error('no converter')
  }
  
  if (converter.options) merge(opts, converter.options);
  
  // TODO: better error message
  if ('function' != typeof converter.convert) throw new Error('string rendering not supported by "' + ext + '" engine');
  converter.convert(str, opts, done);
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
app.generate = function(clients, cb) {
  if (typeof clients == 'function') {
    cb = clients;
    clients = undefined;
  }  
  cb = cb || function() {};
  
  var server = ssgp.createServer(this)
    , client, key, val, i, len;
  
  if (Array.isArray(clients)) {
    for (i = 0, len = clients.length; i < len; ++i) {
      client = clients[i];
      server.accept(client);
    }
  } else {
    for (key in clients) {
      val = clients[key];
      if (!Array.isArray(val)) { val = [ val ]; }
      for (i = 0, len = val.length; i < len; ++i) {
        client = val[i];
        server.accept(client, key);
      }
    }
  }
  
  // TODO: Determine when client is done, and has no more request.
}

app.listen = function listen() {
  var self = this;
  var server = http.createServer(function(req, res) {
    // TODO: create page and dispatch, pipe to res.
  });
  return server.listen.apply(server, arguments);
};

/**
 * Try rendering a layout.
 * @private
 */
function tryRender(layout, options, callback) {
  try {
    layout.render(options, callback);
  } catch (err) {
    callback(err);
  }
}
