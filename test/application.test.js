var $require = require('proxyquire');
var sinon = require('sinon');
var kerouac = require('..');
var events = require('events');
var path = require('path');


describe('application', function() {
  var app = kerouac();
  
  
  describe('#engine', function() {
    
    describe('should register engine', function() {
      var site = kerouac();
      site.engine('foo', function(path, options, cb) {});
      expect(site.engines['.foo']).to.be.a('function')
    });
    
    describe('should register engine with leading dot', function() {
      var site = kerouac();
      site.engine('.foo', function(path, options, cb) {});
      expect(site.engines['.foo']).to.be.a('function')
    });
    
    it('should throw error when called without function argument', function() {
      expect(function() {
        var site = kerouac();
        site.engine('foo');
      }).to.throw(Error, 'callback function required');
    });
    
  }); // #engine
  
  describe('#markup', function() {
    
    it('should register markup to html by default', function() {
      var site = kerouac();
      site.markup('foo', function(str, options) {});
      expect(site.markups['.foo.html']).to.be.a('function')
    });
    
    it('should register markup with leading dot to html by default', function() {
      var site = kerouac();
      site.markup('.foo', function(str, options) {});
      expect(site.markups['.foo.html']).to.be.a('function')
    });
    
    it('should register markup to type', function() {
      var site = kerouac();
      site.markup('foo', 'txt', function(str, options) {});
      expect(site.markups['.foo.txt']).to.be.a('function')
    });
    
    it('should register markup with leading dot to type with leading dot', function() {
      var site = kerouac();
      site.markup('.foo', '.txt', function(str, options) {});
      expect(site.markups['.foo.txt']).to.be.a('function')
    });
    
    it('should throw error when called without function argument', function() {
      expect(function() {
        var site = kerouac();
        site.markup('foo');
      }).to.throw(Error, 'callback function required');
    });
    
    it('should throw error when called with output extension but without function argument', function() {
      expect(function() {
        var site = kerouac();
        site.markup('foo', 'txt');
      }).to.throw(Error, 'callback function required');
    });
    
  }); // #markup
  
  describe('#fm', function() {
    
    it('should parse YAML by default', function() {
      var site = kerouac();
      expect(site.frontmatters['---']).to.be.a('function')
    });
    
    it('should register parser', function() {
      var site = kerouac();
      site.fm(';;;', JSON.parse);
      expect(site.frontmatters[';;;']).to.be.a('function')
    });
    
    it('should throw error when called without function argument', function() {
      expect(function() {
        var site = kerouac();
        site.fm('+++');
      }).to.throw(Error, 'callback function required');
    });
    
  }); // #fm
  
  
  
  
  describe('#highlight', function() {
    
    it('should highlight syntax', function() {
      var str = "function foo() {};"
      
      var html = app.highlight(str);
      expect(html).to.equal('<span class=\"function\"><span class=\"keyword\">function</span> <span class=\"title\">foo</span><span class=\"params\">()</span> </span>{};');
    }); // should highlight syntax
    
  }); // #highlight
  
  describe('#render', function() {
    
    it('should render layout', function(done) {
      var app = kerouac();
      app.set('layouts', path.resolve(__dirname, 'layouts'));
      
      app.render('hello', function(err, out) {
        if (err) { return done(err); }
        expect(out).to.equal('<p>Hello.<p>\n');
        done();
      });
    }); // should render layout
    
    it('should render layout with options', function(done) {
      var app = kerouac();
      app.set('layouts', path.resolve(__dirname, 'layouts'));
      
      app.render('hello-name', { name: 'Alice' }, function(err, out) {
        if (err) { return done(err); }
        expect(out).to.equal('<p>Hello Alice.<p>\n');
        done();
      });
    }); // should render layout with options
    
    it('should render layout with page locals', function(done) {
      var app = kerouac();
      app.set('layouts', path.resolve(__dirname, 'layouts'));
      
      app.render('hello-name', { _locals: { name: 'Alice' } }, function(err, out) {
        if (err) { return done(err); }
        expect(out).to.equal('<p>Hello Alice.<p>\n');
        done();
      });
    }); // should render layout with page locals
    
    it('should render layout with app locals', function(done) {
      var app = kerouac();
      app.set('layouts', path.resolve(__dirname, 'layouts'));
      app.locals.name = 'Alice';
      
      app.render('hello-name', function(err, out) {
        if (err) { return done(err); }
        expect(out).to.equal('<p>Hello Alice.<p>\n');
        done();
      });
    }); // should render layout with app locals
    
  }); // #render
  
  describe('#convert', function() {
    
    it('should convert markdown to html by default', function() {
      var app = kerouac();
      var out = app.convert('Hello', 'md');
      expect(out).to.equal('<p>Hello</p>\n');
    }); // should convert markdown to html by default
    
    it('should convert markdown using github flavored markdown', function() {
      var app = kerouac();
      var out = app.convert('GFM is a does not ~~not~~ support strikethroughs.', 'md');
      expect(out).to.equal('<p>GFM is a does not <del>not</del> support strikethroughs.</p>\n');
    }); // should convert markdown using github flavored markdown
    
    it('should convert markdown with highlighted code blocks', function() {
      var app = kerouac();
      var out = app.convert('```js\nvar x = 1;\n```', 'md');
      expect(out).to.equal('<pre><code class="js"><span class="keyword">var</span> x = <span class="number">1</span>;\n</code></pre>\n');
    }); // should convert markdown with highlighted code blocks
    
    it('should convert markdown with leading dot to html by default', function() {
      var app = kerouac();
      var out = app.convert('Hello', '.md');
      expect(out).to.equal('<p>Hello</p>\n');
    }); // should compile markdown using dot-prefixed extension notation
    
    it('should convert markdown to text', function() {
      var app = kerouac();
      var out = app.convert('Hello', 'md', 'txt');
      expect(out).to.equal('Hello\n');
    }); // should convert markdown to text
    
    it('should convert markdown with leading dot to text with leading dot', function() {
      var app = kerouac();
      var out = app.convert('Hello', '.md', '.txt');
      expect(out).to.equal('Hello\n');
    }); // should convert markdown with leading dot to text with leading dot
    
    it('should convert markdown to excerpted text', function() {
      var app = kerouac();
      var out = app.convert('Beep.\n\nBeep boop.', 'md', 'txt', { excerpt: true });
      expect(out).to.equal('Beep.\n');
    }); // should convert markdown to excerpted text
    
    it('should throw error when markup is unsupported', function() {
      expect(function() {
        var site = kerouac();
        app.convert('Hello', 'foo');
      }).to.throw(Error, 'Failed to convert markup from ".foo" to ".html"');
    });
    
    it('should throw error when markup to type is unsupported', function() {
      expect(function() {
        var site = kerouac();
        app.convert('Hello', 'foo', 'bar');
      }).to.throw(Error, 'Failed to convert markup from ".foo" to ".bar"');
    });
    
  }); // #convert
  
  describe('#parse', function() {
    
    it('should parse YAML', function() {
      var app = kerouac();
      
      var data = app.parse('title: Hello');
      expect(data).to.deep.equal({ title: 'Hello' });
    }); // should parse YAML
    
    it('should parse JSON', function() {
      var app = kerouac();
      app.fm(';;;', JSON.parse);
      
      var data = app.parse('{ "title": "Hello" }', ';;;');
      expect(data).to.deep.equal({ title: 'Hello' });
    }); // should parse JSON
    
    it('should not parse empty string', function() {
      var app = kerouac();
      
      var data = app.parse('');
      expect(data).to.be.undefined;
    }); // should not parse empty string
    
    it('should throw error when parsing invalid YAML', function() {
      expect(function() {
        var app = kerouac();
        app.parse('{');
      }).to.throw(Error, 'unexpected end');
    }); // should throw error when parsing invalid YAML
    
    it('should throw error when parsing non-structured YAML', function() {
      expect(function() {
        var app = kerouac();
        app.parse('hello');
      }).to.throw(Error, 'Front matter must consist of fields and values');
    }); // should throw error when parsing non-structured YAML
    
    it('should throw error when delimiter is not supported', function() {
      expect(function() {
        var site = kerouac();
        var front = site.parse('{ "title": "Hello" }', 'xxx');
      }).to.throw(Error, 'Failed to parse front matter with delimiter "xxx".');
    }); // should throw error when delimiter is not supported
    
  }); // #parse
  
  describe('#generate', function() {
    
    it('should automatically generate pages from routes', function(done) {
      var app = kerouac();
      app.handle = sinon.spy(function(req) {
        req.end();
      });
      
      app.page('/foo.html', function(){});
      app.page('/bar.html', function(){});
      app.page('/baz.html', function(){});
      
      app.generate(function() {
        expect(app.handle).to.have.callCount(3);
        expect(app.handle.getCall(0).args[0].path).to.equal('/foo.html');
        expect(app.handle.getCall(1).args[0].path).to.equal('/bar.html');
        expect(app.handle.getCall(2).args[0].path).to.equal('/baz.html');
        done();
      });
    }); // should automatically generate pages from routes
    
    it('should automatically generate pages from app', function(done) {
      var app = kerouac();
      app.handle = sinon.spy(function(req) {
        req.end();
      });
      
      var pkg = function() {
        return new kerouac.Router();
      };
      pkg.createMapper = function() {
        var mapper = new events.EventEmitter();
        mapper.map = function() {
          this.request('/foo.html');
          this.request('/bar.html');
          this.request('/baz.html');
          this.end();
        };
        return mapper;
      };
      
      app.use(pkg);
      
      app.generate(function() {
        expect(app.handle).to.have.callCount(3);
        expect(app.handle.getCall(0).args[0].path).to.equal('/foo.html');
        expect(app.handle.getCall(1).args[0].path).to.equal('/bar.html');
        expect(app.handle.getCall(2).args[0].path).to.equal('/baz.html');
        done();
      });
    }); // should automatically generate pages from app
    
    it('should automatically generate pages from multiple apps mounted under same path', function(done) {
      var app = kerouac();
      app.handle = sinon.spy(function(req) {
        req.end();
      });
      
      var fooPkg = function() {
        return new kerouac.Router();
      };
      fooPkg.createMapper = function() {
        var mapper = new events.EventEmitter();
        mapper.map = function() {
          this.request('/foo.html');
          this.end();
        };
        return mapper;
      };
      
      var barPkg = function() {
        return new kerouac.Router();
      };
      barPkg.createMapper = function() {
        var mapper = new events.EventEmitter();
        mapper.map = function() {
          this.request('/bar.html');
          this.end();
        };
        return mapper;
      };
      
      var bazPkg = function() {
        return new kerouac.Router();
      };
      bazPkg.createMapper = function() {
        var mapper = new events.EventEmitter();
        mapper.map = function() {
          this.request('/baz.html');
          this.end();
        };
        return mapper;
      };
      
      app.use('/foo', fooPkg);
      app.use('/foo', barPkg);
      app.use('/baz', bazPkg);
      
      app.generate(function() {
        expect(app.handle).to.have.callCount(3);
        expect(app.handle.getCall(0).args[0].path).to.equal('/foo/foo.html');
        expect(app.handle.getCall(1).args[0].path).to.equal('/foo/bar.html');
        expect(app.handle.getCall(2).args[0].path).to.equal('/baz/baz.html');
        done();
      });
    }); // should automatically generate pages from multiple apps mounted under same path
    
    it('should automatically generate pages from routes and app', function(done) {
      var app = kerouac();
      app.handle = sinon.spy(function(req) {
        req.end();
      });
      
      app.page('/foo.html', function(){});
      app.page('/bar.html', function(){});
      app.page('/baz.html', function(){});
      
      var pkg = function() {
        return new kerouac.Router();
      };
      pkg.createMapper = function() {
        var mapper = new events.EventEmitter();
        mapper.map = function() {
          this.request('/foo.html');
          this.request('/bar.html');
          this.request('/baz.html');
          this.end();
        };
        return mapper;
      };
      
      app.use('/foo', pkg);
      
      app.generate(function() {
        expect(app.handle).to.have.callCount(6);
        expect(app.handle.getCall(0).args[0].path).to.equal('/foo/foo.html');
        expect(app.handle.getCall(1).args[0].path).to.equal('/foo/bar.html');
        expect(app.handle.getCall(2).args[0].path).to.equal('/foo/baz.html');
        expect(app.handle.getCall(3).args[0].path).to.equal('/foo.html');
        expect(app.handle.getCall(4).args[0].path).to.equal('/bar.html');
        expect(app.handle.getCall(5).args[0].path).to.equal('/baz.html');
        done();
      });
    }); // should automatically generate pages from routes and app
    
    it('should not automatically generate pages from routes when paths are explicitly specified', function(done) {
      var app = kerouac();
      app.handle = sinon.spy(function(req) {
        req.end();
      });
      
      app.page('/foo.html', function(){});
      app.page('/bar.html', function(){});
      app.page('/baz.html', function(){});
      
      app.generate([ '/beep.html', '/boop.html' ], function() {
        expect(app.handle).to.have.callCount(2);
        expect(app.handle.getCall(0).args[0].path).to.equal('/beep.html');
        expect(app.handle.getCall(1).args[0].path).to.equal('/boop.html');
        done();
      });
    }); // should not automatically generate pages from routes when paths are explicitly specified
    
    it('should not automatically generate pages from app when paths are explicitly specified', function(done) {
      var app = kerouac();
      app.handle = sinon.spy(function(req) {
        req.end();
      });
      
      var pkg = function() {
        return new kerouac.Router();
      };
      pkg.createMapper = function() {
        var mapper = new events.EventEmitter();
        mapper.map = function() {
          this.request('/foo.html');
          this.request('/bar.html');
          this.request('/baz.html');
          this.end();
        };
        return mapper;
      };
      
      app.use(pkg);
      
      app.generate([ '/beep.html', '/boop.html' ], function() {
        expect(app.handle).to.have.callCount(2);
        expect(app.handle.getCall(0).args[0].path).to.equal('/beep.html');
        expect(app.handle.getCall(1).args[0].path).to.equal('/boop.html');
        done();
      });
    }); // should not automatically generate pages from app when paths are explicitly specified
    
    it('should generate pages from array of paths', function(done) {
      var app = kerouac();
      app.handle = sinon.spy(function(req) {
        req.end();
      });
      
      app.generate([ '/foo.html', '/bar.html', '/baz.html' ], function() {
        expect(app.handle).to.have.callCount(3);
        expect(app.handle.getCall(0).args[0].path).to.equal('/foo.html');
        expect(app.handle.getCall(1).args[0].path).to.equal('/bar.html');
        expect(app.handle.getCall(2).args[0].path).to.equal('/baz.html');
        done();
      });
    }); // should generate pages from hash of paths to mappers
    
    it('should generate pages from hash of paths to mappers', function(done) {
      var app = kerouac();
      app.handle = sinon.spy(function(req) {
        req.end();
      });
      
      var fooMapper = new events.EventEmitter();
      fooMapper.map = function() {
        this.request('/foo.html');
        this.end();
      };
      var barMapper = new events.EventEmitter();
      barMapper.map = function() {
        this.request('/bar.html');
        this.end();
      };
      var bazMapper = new events.EventEmitter();
      bazMapper.map = function() {
        this.request('/baz.html');
        this.end();
      };
      
      app.generate({
        '/foo': fooMapper,
        '/bar': barMapper,
        '/baz': bazMapper
      }, function() {
        expect(app.handle).to.have.callCount(3);
        expect(app.handle.getCall(0).args[0].path).to.equal('/foo/foo.html');
        expect(app.handle.getCall(1).args[0].path).to.equal('/bar/bar.html');
        expect(app.handle.getCall(2).args[0].path).to.equal('/baz/baz.html');
        done();
      });
    }); // should generate pages from hash of paths to mappers
    
    it('should generate pages from hash of paths to array of mappers', function(done) {
      var app = kerouac();
      app.handle = sinon.spy(function(req) {
        req.end();
      });
      
      var fooMapper = new events.EventEmitter();
      fooMapper.map = function() {
        this.request('/foo.html');
        this.end();
      };
      var barMapper = new events.EventEmitter();
      barMapper.map = function() {
        this.request('/bar.html');
        this.end();
      };
      var bazMapper = new events.EventEmitter();
      bazMapper.map = function() {
        this.request('/baz.html');
        this.end();
      };
      
      app.generate({
        '/foo': [ fooMapper, barMapper ],
        '/baz': bazMapper
      }, function() {
        expect(app.handle).to.have.callCount(3);
        expect(app.handle.getCall(0).args[0].path).to.equal('/foo/foo.html');
        expect(app.handle.getCall(1).args[0].path).to.equal('/foo/bar.html');
        expect(app.handle.getCall(2).args[0].path).to.equal('/baz/baz.html');
        done();
      });
    }); // should generate pages from hash of paths to array of mappers
    
    it('should generate pages from array of mappers', function(done) {
      var app = kerouac();
      app.handle = sinon.spy(function(req) {
        req.end();
      });
      
      var fooMapper = new events.EventEmitter();
      fooMapper.map = function() {
        this.request('/foo.html');
        this.end();
      };
      var barMapper = new events.EventEmitter();
      barMapper.map = function() {
        this.request('/bar.html');
        this.end();
      };
      var bazMapper = new events.EventEmitter();
      bazMapper.map = function() {
        this.request('/baz.html');
        this.end();
      };
      
      app.generate([ fooMapper, barMapper, bazMapper ], function() {
        expect(app.handle).to.have.callCount(3);
        expect(app.handle.getCall(0).args[0].path).to.equal('/foo.html');
        expect(app.handle.getCall(1).args[0].path).to.equal('/bar.html');
        expect(app.handle.getCall(2).args[0].path).to.equal('/baz.html');
        done();
      });
    }); // should generate pages from array of mappers
    
  }); // #generate
  
}); // application
