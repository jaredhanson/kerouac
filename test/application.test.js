var $require = require('proxyquire');
var kerouac = require('..');
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
      expect(site.converters['.foo.html'].convert).to.be.a('function')
    });
    
    it('should register markup with leading dot to html by default', function() {
      var site = kerouac();
      site.markup('.foo', function(str, options) {});
      expect(site.converters['.foo.html'].convert).to.be.a('function')
    });
    
    it('should register markup to type', function() {
      var site = kerouac();
      site.markup('foo', 'txt', function(str, options) {});
      expect(site.converters['.foo.txt'].convert).to.be.a('function')
    });
    
    it('should register markup with leading dot to type with leading dot', function() {
      var site = kerouac();
      site.markup('.foo', '.txt', function(str, options) {});
      expect(site.converters['.foo.txt'].convert).to.be.a('function')
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
    
    it('should parse YAML', function() {
      var site = kerouac();
      
      var fm = site.fm('title: Hello');
      expect(fm).to.deep.equal({ title: 'Hello' });
    });
    
    it('should register parser', function() {
      var site = kerouac();
      site.fm(function(data) {
        if (data == 'foo') { return { foo: 'bar' }; }
        return undefined;
      });
      
      var fm = site.fm('foo');
      expect(fm).to.deep.equal({ foo: 'bar' });
    });
    
    it('should register multiple parsers', function() {
      var site = kerouac();
      site.fm(function(data) {
        if (data == 'foo') { return { foo: 'bar' }; }
        return undefined;
      });
      site.fm(function(data) {
        if (data == 'baz') { return { beep: 'qux' }; }
        return undefined;
      });
      
      var fm = site.fm('foo');
      expect(fm).to.deep.equal({ foo: 'bar' });
      fm = site.fm('baz');
      expect(fm).to.deep.equal({ beep: 'qux' });
    });
    
    it('should not parse non-object data', function() {
      var site = kerouac();
      
      var fm = site.fm('hello');
      expect(fm).to.be.undefined;
    });
    
    it('should not parse zero-length string', function() {
      var site = kerouac();
      
      var fm = site.fm('');
      expect(fm).to.be.undefined;
    });
    
    it('should throw error when parsing invalid YAML', function() {
      expect(function() {
        var site = kerouac();
        site.fm('{')
      }).to.throw(Error, 'unexpected end');
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
    
    it('should convert markdown to HTML by default', function() {
      var app = kerouac();
      var out = app.convert('Hello', 'md');
      expect(out).to.equal('<p>Hello</p>\n');
    }); // should convert markdown to HTML by default
    
    it('should compile markdown using dot-prefixed extension notation', function() {
      var app = kerouac();
      
      var out = app.convert('Hello', '.md');
      expect(out).to.equal('<p>Hello</p>\n');
      
      /*
      app.convert('Hello', '.md', function(err, out) {
        if (err) { return done(err); }
        expect(out).to.equal('<p>Hello</p>\n');
        done();
      });
      */
    }); // should compile markdown using dot-prefixed extension notation
    
    it('should compile markdown to text', function() {
      var app = kerouac();
      
      var out = app.convert('Hello', 'md', 'txt');
      expect(out).to.equal('Hello\n');
      
      /*
      app.convert('Hello', 'md', 'txt', function(err, out) {
        if (err) { return done(err); }
        expect(out).to.equal('Hello\n');
        done();
      });
      */
    }); // should compile markdown
    
    it('should compile markdown to text using dot-prefixed extension notation', function() {
      var app = kerouac();
      
      var out = app.convert('Hello', '.md', '.txt');
      expect(out).to.equal('Hello\n');
      
      /*
      app.convert('Hello', '.md', '.txt', function(err, out) {
        if (err) { return done(err); }
        expect(out).to.equal('Hello\n');
        done();
      });
      */
    }); // should compile markdown using dot-prefixed extension notation
    
    it('should compile markdown to excerpt text', function() {
      var app = kerouac();
      
      var out = app.convert('Beep.\n\nBeep boop.', 'md', 'txt', { excerpt: true });
      expect(out).to.equal('Beep.\n');
      
      /*
      app.convert('Beep.\n\nBeep boop.', 'md', 'txt', { excerpt: true }, function(err, out) {
        if (err) { return done(err); }
        expect(out).to.equal('Beep.\n');
        done();
      });
      */
    }); // should compile markdown
    
  }); // #convert
  
}); // application
