var kerouac = require('..');


describe('kerouac', function() {
    
  it('should export create function', function() {
    expect(kerouac).to.be.a('function');
    
    var site = kerouac();
    expect(site.constructor.name).to.equal('Kerouac');
  });
  
  it('should export middleware', function() {
    expect(kerouac.copy).to.be.a('function');
    expect(kerouac.loadContent).to.be.a('function');
    expect(kerouac.prettyURL).to.be.a('function');
    expect(kerouac.prettyURLs).to.equal(kerouac.prettyURL);
    expect(kerouac.render).to.be.a('function');
  });
  
  describe('newly initialized site', function() {
    var site = kerouac();
    
    it('should expose content and assets as convience for common sections', function() {
      expect(site.content).to.be.a('function');
      expect(site.assets).to.be.a('function');
      expect(site.assets).to.equal(site.static);
    });
    
    it('should have default settings', function() {
      expect(site.get('layout engine')).to.equal('ejs');
      expect(site.get('layouts')).to.equal(process.cwd() + '/layouts');
      expect(site.get('output')).to.equal(process.cwd() + '/www');
    });
    
    it('should parse YAML front matter', function() {
      var yaml = "layout: 'yaml'\n"
               + "title: 'Hello YAML'\n";
      
      var data = site.fm(yaml);
      expect(data.layout).to.equal('yaml');
      expect(data.title).to.equal('Hello YAML');
    });
    
    it('should parse JSON front matter', function() {
      var json = "{ 'layout': 'json', 'title': 'Hello JSON' }"
      
      var data = site.fm(json);
      expect(data.layout).to.equal('json');
      expect(data.title).to.equal('Hello JSON');
    });
    
    it('should not parse empty front matter', function() {
      var empty = "";
      
      var data = site.fm(empty);
      expect(data).to.be.undefined;
    });
    
    it('should throw exception when parsing invalid front matter', function() {
      var unknown = "fubar"
      
      expect(function() {
        site.fm(unknown);
      }).to.throw(SyntaxError);
    });
    
    it('should highlight syntax', function() {
      var code = "function foo() {};"
      
      var out = site.highlight(code);
      expect(out).to.equal('<span class=\"function\"><span class=\"keyword\">function</span> <span class=\"title\">foo</span><span class=\"params\">()</span> </span>{};');
    });
  });
  
  describe('settings', function() {
    
    var site = kerouac();
    
    it('should get and set settings', function() {
      site.set('foo', 'bar');
      expect(site.get('foo')).to.equal('bar');
    });
    
    it('should translate "view engine" to "layout engine"', function() {
      site.set('view engine', 'foo');
      expect(site.get('view engine')).to.equal('foo');
      expect(site.get('layout engine')).to.equal('foo');
    });
    
    it('should enable flags', function() {
      site.enable('baz');
      expect(site.get('baz')).to.be.true;
      expect(site.enabled('baz')).to.be.true;
      expect(site.disabled('baz')).to.be.false;
    });
    
    it('should disable flags', function() {
      site.disable('baz');
      expect(site.get('baz')).to.be.false;
      expect(site.enabled('baz')).to.be.false;
      expect(site.disabled('baz')).to.be.true;
    });
    
  });
  
  describe('engine registration', function() {
    
    describe('using a function', function() {
      var site = kerouac();
      site.engine('foo', function(path, options, cb) {
      });
    
      it('should internally register foo engine', function() {
        expect(site._engines['.foo'].renderFile).to.be.a('function')
        expect(site._engines['.foo'].render).to.be.undefined
      });
    });
    
    describe('using a function and extension with leading dot', function() {
      var site = kerouac();
      site.engine('.bar', function(path, options, cb) {
      });
      
      it('should internally register bar engine', function() {
        expect(site._engines['.bar'].renderFile).to.be.a('function')
        expect(site._engines['.bar'].render).to.be.undefined
      });
    });
    
    describe('using a module', function() {
      var site = kerouac();
      var engine = {};
      engine.renderFile = function(path, options, cb) {};
      engine.render = function(path, options, cb) {};
      
      site.engine('foo', engine, { foo: 'bar' });
    
      it('should internally register foo engine', function() {
        expect(site._engines['.foo'].renderFile).to.be.a('function')
        expect(site._engines['.foo'].render).to.be.a('function')
        expect(site._engines['.foo'].options['foo']).to.equal('bar')
      });
    });
    
    describe('using a module that exports __express', function() {
      var site = kerouac();
      var engine = {};
      engine.__express = function(path, options, cb) {};
      engine.render = function(path, options, cb) {};
      
      site.engine('foo', engine, { foo: 'bar' });
    
      it('should internally register foo engine', function() {
        expect(site._engines['.foo'].renderFile).to.be.a('function')
        expect(site._engines['.foo'].render).to.be.a('function')
        expect(site._engines['.foo'].options['foo']).to.equal('bar')
      });
    });
    
    describe('using a non-engine module', function() {
      var site = kerouac();
      var engine = {};
      
      it('should not register foo engine', function() {
        expect(function() {
          site.engine('foo', engine, { foo: 'bar' });
        }).to.throw(Error);
      });
    });
    
  });
  
  describe('front matter parser registration', function() {
    var site = kerouac();
    site.fm(function(data) {
      if (data == 'foobar') { return { foo: 'bar' }; }
      return undefined;
    })
    
    it('should parse using registered parser', function() {
      var foo = "foobar"
      
      var data = site.fm(foo);
      expect(data.foo).to.equal('bar');
    });
  });
  
  describe('syntax highlighting registration', function() {
    var site = kerouac();
    site.highlight(function(code, lang) {
      return { code: code, lang: lang }
    })
    
    it('should highlight using registered highlighter', function() {
      var out = site.highlight('var foo;', 'javascript');
      expect(out.code).to.equal('var foo;');
      expect(out.lang).to.equal('javascript');
    });
  });
  
});
