/**
 * Module dependencies.
 */
var p = require('path')
  , fs = require('fs')
  , diveSync = require('diveSync')
  , mkdirp = require('mkdirp')
  , Router = require('./router')
  , Site = require('./site')
  , Layout = require('./layout')
  , marked = require('marked-engine')
  , highlight = require('highlight.js')
  , yaml = require('js-yaml')
  , middleware = require('./middleware')
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
  this.site = new Site();
  this.settings = {};
  this.locals = {};
  this._engines = {};
  this._parsers = [];
  this._highlight;
  this._stack = [];
  this._cache = {};
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
    return yaml.load(data);
  });
  this.fm(function(data) {
    return JSON.parse(data);
  });
  
  // syntax highlighter
  this.highlight(function(code, lang) {
    if (lang) return highlight.highlight(lang, code).value;
    return highlight.highlightAuto(code).value;
  });
  
  // default settings
  this.set('layouts', process.cwd() + '/layouts');
  this.set('output', process.cwd() + '/output');
  this.set('layout engine', 'ejs');
  
  // default locals
  this.locals.settings = this.settings;
  
  // implicit middleware
  this.use(require('./middleware/init')(this, this.site));
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
  plugin.call(undefined, this, this.site);
  return this;
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
    , data = fn;
  for (var i = 0, len = parsers.length; i < len; i++) {
    var parse = parsers[i];
    try {
      var o = parse(data);
      if (o && typeof o == 'object') { return o; }
    } catch (e) {
      debug('fm parse exception: ' + e);
    }
  }
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
    this.site.add(path);
  }
  return this;
}

// TODO: Allow additional middleware to be passed here.
Kerouac.prototype.content = function(path) {
  var adir = p.resolve(process.cwd(), path)
    , rfile
    , rdir
    , comps
    , url;
  
  var self = this;
  diveSync(adir, function(err, file) {
    if (err) { throw err; }
    
    rfile = p.relative(adir, file)
    
    // TODO: Automatically determine output type based on extension (and allow override option).
    // TODO: Implement pretty URLs as middleware.
    
    rdir = p.dirname(rfile);
    comps = p.basename(rfile).split('.');
    url = p.join(rdir, comps[0]) + '.html';
    
    // TODO: Make prettyURLs optional (possible passing it as an argument).
    self.page(url, middleware.prettyURL()
                 , middleware.url()
                 , middleware.loadContent(file)
                 , middleware.render());
  });
}

Kerouac.prototype.static = function(path) {
  var adir = p.resolve(process.cwd(), path)
    , rfile
    , rdir
  
  var self = this;
  diveSync(adir, function(err, file) {
    if (err) { throw err; }
    
    rfile = p.relative(adir, file);
    
    self.page(rfile, middleware.url()
                   , middleware.copy(file));
  });
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
Kerouac.prototype.handle = function(page) {
  var self = this
    , stack = this._stack
    , idx = 0;
  
  function next(err) {
    var layer = stack[idx++]
      , path
      , c;

    // all done
    if (!layer) {
      if (err) {
        console.error(err.message);
        console.error(err.stack);
      }
      return;
    }

    try {
      path = page.path;
      
      // skip this layer if the route doesn't match.
      if (0 != path.toLowerCase().indexOf(layer.path.toLowerCase())) { return next(err); }

      c = path[layer.path.length];
      if (c && '/' != c && '.' != c) { return next(err); }

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
    , site = this.site
    , paths = Object.keys(site)
    , odir = this.get('output');
    
  (function iter(i, err) {
    if (err) { return cb(err); }
    
    var path = paths[i];
    if (!path) { return cb(); } // done
    var page = site[path];
    
    page.once('write', function(data) {
      var ofile = p.join(odir, page.path)
      mkdirp(p.dirname(ofile), function(err) {
        if (err) { return iter(i + 1, err); }
        fs.writeFile(ofile, data, function(err) {
          if (err) { return iter(i + 1, err); }
          iter(i + 1);
        });
      });
    });
    
    debug('generating %s', path);
    self.handle(page);
  })(0);
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
 * Expose CLI.
 *
 * @api private
 */
exports.cli = require('./cli');
