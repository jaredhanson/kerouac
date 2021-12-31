var absoluteURL = require('../../lib/middleware/absoluteURL');


describe('middleware/absoluteURL', function() {
  
  describe('without base url setting', function() {
    
    it('should leave pretty url', function(done) {
      var middleware = absoluteURL();
      var page = {};
      page.app = { get: function() { return undefined; } }
      page.url = '/home/';
    
      middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.absoluteURL).to.equal('/home/');
        expect(page.fullURL).to.be.undefined;
        done();
      });
    });
    
    it('should leave ugly url', function(done) {
      var middleware = absoluteURL();
      var page = {};
      page.app = { get: function() { return undefined; } }
      page.url = '/home.xml';
    
      middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.absoluteURL).to.equal('/home.xml');
        expect(page.fullURL).to.be.undefined;
        done();
      });
    });
    
    it('should leave pretty nested url', function(done) {
      var middleware = absoluteURL();
      var page = {};
      page.app = { get: function() { return undefined; } }
      page.url = '/2000/01/01/hello/';
    
      middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.absoluteURL).to.equal('/2000/01/01/hello/');
        expect(page.fullURL).to.be.undefined;
        done();
      });
    });
    
    it('should leave ugly nested url', function(done) {
      var middleware = absoluteURL();
      var page = {};
      page.app = { get: function() { return undefined; } }
      page.url = '/2000/01/01/hello.xml';
    
      middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.absoluteURL).to.equal('/2000/01/01/hello.xml');
        expect(page.fullURL).to.be.undefined;
        done();
      });
    });
    
    it('should join base path and path of pretty url', function(done) {
      var middleware = absoluteURL();
      var page = {};
      page.app = { get: function() { return undefined; } }
      page.basePath = '/blog';
      page.url = '/hello/';
    
      middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.absoluteURL).to.equal('/blog/hello/');
        expect(page.fullURL).to.be.undefined;
        done();
      });
    });
    
    it('should join base path and path of ugly url', function(done) {
      var middleware = absoluteURL();
      var page = {};
      page.app = { get: function() { return undefined; } }
      page.basePath = '/blog';
      page.url = '/hello.html';
    
      middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.absoluteURL).to.equal('/blog/hello.html');
        expect(page.fullURL).to.be.undefined;
        done();
      });
    });
    
    it('should join base path and path of pretty nested url', function(done) {
      var middleware = absoluteURL();
      var page = {};
      page.app = { get: function() { return undefined; } }
      page.basePath = '/blog';
      page.url = '/2000/01/01/hello/';
    
      middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.absoluteURL).to.equal('/blog/2000/01/01/hello/');
        expect(page.fullURL).to.be.undefined;
        done();
      });
    });
    
    it('should join base path and path of ugly nested url', function(done) {
      var middleware = absoluteURL();
      var page = {};
      page.app = { get: function() { return undefined; } }
      page.basePath = '/blog';
      page.url = '/2000/01/01/hello.xml';
    
      middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.absoluteURL).to.equal('/blog/2000/01/01/hello.xml');
        expect(page.fullURL).to.be.undefined;
        done();
      });
    });
    
  }); // without base url setting
  
  
  describe('with base url in root directory', function() {
    
    it('should leave path', function(done) {
      var middleware = absoluteURL();
      var page = {};
      page.app = { get: function() { return 'http://www.example.com/'; } }
      page.url = '/home.html';
    
      middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.absoluteURL).to.equal('/home.html');
        expect(page.fullURL).to.equal('http://www.example.com/home.html');
        done();
      });
    });
    
    it('should join base path and path', function(done) {
      var middleware = absoluteURL();
      var page = {};
      page.app = { get: function() { return 'http://www.example.com/'; } }
      page.basePath = '/blog';
      page.url = '/hello.html';
    
      middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.absoluteURL).to.equal('/blog/hello.html');
        expect(page.fullURL).to.equal('http://www.example.com/blog/hello.html');
        done();
      });
    });
    
    it('should join base path and nested path', function(done) {
      var middleware = absoluteURL();
      var page = {};
      page.app = { get: function() { return 'http://www.example.com/'; } }
      page.basePath = '/blog';
      page.url = '/2000/01/01/happy-new-year.html';
    
      middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.absoluteURL).to.equal('/blog/2000/01/01/happy-new-year.html');
        expect(page.fullURL).to.equal('http://www.example.com/blog/2000/01/01/happy-new-year.html');
        done();
      });
    });
    
  }); // with base url in root directory
  
  
  describe('with base url in sub directory', function() {
    
    it('should leave path', function(done) {
      var middleware = absoluteURL();
      var page = {};
      page.app = { get: function() { return 'http://www.example.com/~foo'; } }
      page.url = '/home.html';
    
      middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.absoluteURL).to.equal('/~foo/home.html');
        expect(page.fullURL).to.equal('http://www.example.com/~foo/home.html');
        done();
      });
    });
    
    it('should join base path and path', function(done) {
      var middleware = absoluteURL();
      var page = {};
      page.app = { get: function() { return 'http://www.example.com/~foo'; } }
      page.basePath = '/blog';
      page.url = '/hello.html';
    
      middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.absoluteURL).to.equal('/~foo/blog/hello.html');
        expect(page.fullURL).to.equal('http://www.example.com/~foo/blog/hello.html');
        done();
      });
    });
    
    it('should join base path and nested path', function(done) {
      var middleware = absoluteURL();
      var page = {};
      page.app = { get: function() { return 'http://www.example.com/~foo'; } }
      page.basePath = '/blog';
      page.url = '/2000/01/01/happy-new-year.html';
    
      middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.absoluteURL).to.equal('/~foo/blog/2000/01/01/happy-new-year.html');
        expect(page.fullURL).to.equal('http://www.example.com/~foo/blog/2000/01/01/happy-new-year.html');
        done();
      });
    });
    
  }); // with base url in root directory
  
  
  describe('with base url in sub directory with trailing slash', function() {
    
    it('should leave path', function(done) {
      var middleware = absoluteURL();
      var page = {};
      page.app = { get: function() { return 'http://www.example.com/~foo/'; } }
      page.url = '/home.html';
    
      middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.absoluteURL).to.equal('/~foo/home.html');
        expect(page.fullURL).to.equal('http://www.example.com/~foo/home.html');
        done();
      });
    });
    
    it('should join base path and path', function(done) {
      var middleware = absoluteURL();
      var page = {};
      page.app = { get: function() { return 'http://www.example.com/~foo/'; } }
      page.basePath = '/blog';
      page.url = '/hello.html';
    
      middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.absoluteURL).to.equal('/~foo/blog/hello.html');
        expect(page.fullURL).to.equal('http://www.example.com/~foo/blog/hello.html');
        done();
      });
    });
    
    it('should join base path and nested path', function(done) {
      var middleware = absoluteURL();
      var page = {};
      page.app = { get: function() { return 'http://www.example.com/~foo/'; } }
      page.basePath = '/blog';
      page.url = '/2000/01/01/happy-new-year.html';
    
      middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.absoluteURL).to.equal('/~foo/blog/2000/01/01/happy-new-year.html');
        expect(page.fullURL).to.equal('http://www.example.com/~foo/blog/2000/01/01/happy-new-year.html');
        done();
      });
    });
    
  }); // with base url in root directory
  
});
