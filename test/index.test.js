var kerouac = require('..');


describe('kerouac', function() {
    
  it('should export create function', function() {
    expect(kerouac).to.be.a('function');
    
    var site = kerouac();
    expect(site).to.be.a('function');
    expect(site.constructor.name).to.equal('EventEmitter');
  });
  
  it('should export constructors', function() {
    expect(kerouac.Router).to.be.a('function');
  });
  
  it('should export sites', function() {
    expect(kerouac.content).to.be.a('function');
    expect(kerouac.content.createMapper).to.be.a('function');
    expect(kerouac.assets).to.be.a('function');
    expect(kerouac.assets.createMapper).to.be.a('function');
  });
  
  it('should export middleware', function() {
    expect(kerouac.canonicalURL).to.be.a('function');
    expect(kerouac.copy).to.be.a('function');
    expect(kerouac.prettyURL).to.be.a('function');
    expect(kerouac.prettyURLs).to.equal(kerouac.prettyURL);
  });
  
  describe('createApplication', function() {
    var site = kerouac();
    
    it('should have default settings', function() {
      expect(site.get('layout engine')).to.equal('ejs');
      expect(site.get('layouts')).to.equal(process.cwd() + '/layouts');
      expect(site.get('output')).to.equal('_site');
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
