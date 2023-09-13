var absoluteURL = require('../../lib/middleware/absoluteURL');


describe('middleware/absoluteURL', function() {
  
  it('should set URL when base URL is not set', function(done) {
    var middleware = absoluteURL();
    var page = {};
    page.app = { get: function() { return undefined; } }
    page.path = '/home.xml';
  
    middleware(page, function(err) {
      if (err) { return done(err); }
      expect(page.path).to.equal('/home.xml');
      expect(page.url).to.equal('/home.xml');
      expect(page.fullURL).to.be.undefined;
      done();
    });
  });
  
  it('should set nested URL when base URL is not set', function(done) {
    var middleware = absoluteURL();
    var page = {};
    page.app = { get: function() { return undefined; } }
    page.path = '/2000/01/01/hello.xml';
  
    middleware(page, function(err) {
      if (err) { return done(err); }
      expect(page.path).to.equal('/2000/01/01/hello.xml');
      expect(page.url).to.equal('/2000/01/01/hello.xml');
      expect(page.fullURL).to.be.undefined;
      done();
    });
  });
  
  it('should preserve URL when base URL is not set', function(done) {
    var middleware = absoluteURL();
    var page = {};
    page.app = { get: function() { return undefined; } }
    page.path = '/home.html';
    page.url = '/home/';
  
    middleware(page, function(err) {
      if (err) { return done(err); }
      expect(page.path).to.equal('/home.html');
      expect(page.url).to.equal('/home/');
      expect(page.fullURL).to.be.undefined;
      done();
    });
  });
  
  it('should preserve nested URL when base URL is not set', function(done) {
    var middleware = absoluteURL();
    var page = {};
    page.app = { get: function() { return undefined; } }
    page.path = '/2000/01/01/hello.html';
    page.url = '/2000/01/01/hello/';
  
    middleware(page, function(err) {
      if (err) { return done(err); }
      expect(page.path).to.equal('/2000/01/01/hello.html');
      expect(page.url).to.equal('/2000/01/01/hello/');
      expect(page.fullURL).to.be.undefined;
      done();
    });
  });
  
  it('should set URL and full URL when base URL is set to domain', function(done) {
    var middleware = absoluteURL();
    var page = {};
    page.app = { get: function() { return 'http://www.example.com/'; } }
    page.path = '/home.html';
  
    middleware(page, function(err) {
      if (err) { return done(err); }
      expect(page.path).to.equal('/home.html');
      expect(page.url).to.equal('/home.html');
      expect(page.fullURL).to.equal('http://www.example.com/home.html');
      done();
    });
  });
  
  it('should preserve URL and set full URL when base URL is set to domain', function(done) {
    var middleware = absoluteURL();
    var page = {};
    page.app = { get: function() { return 'http://www.example.com/'; } }
    page.path = '/home.html';
    page.url = '/home/';
  
    middleware(page, function(err) {
      if (err) { return done(err); }
      expect(page.path).to.equal('/home.html');
      expect(page.url).to.equal('/home/');
      expect(page.fullURL).to.equal('http://www.example.com/home/');
      done();
    });
  });
  
  it('should preserve nested URL and set full URL when base URL is set to domain', function(done) {
    var middleware = absoluteURL();
    var page = {};
    page.app = { get: function() { return 'http://www.example.com/'; } }
    page.path = '/2000/01/01/hello.html';
    page.url = '/2000/01/01/hello/';
  
    middleware(page, function(err) {
      if (err) { return done(err); }
      expect(page.path).to.equal('/2000/01/01/hello.html');
      expect(page.url).to.equal('/2000/01/01/hello/');
      expect(page.fullURL).to.equal('http://www.example.com/2000/01/01/hello/');
      done();
    });
  });
  
  it('should set URL and full URL when base URL is set to domain and directory', function(done) {
    var middleware = absoluteURL();
    var page = {};
    page.app = { get: function() { return 'http://www.example.com/~foo'; } }
    page.path = '/home.html';
  
    middleware(page, function(err) {
      if (err) { return done(err); }
      expect(page.path).to.equal('/home.html');
      expect(page.url).to.equal('/~foo/home.html');
      expect(page.fullURL).to.equal('http://www.example.com/~foo/home.html');
      done();
    });
  });
  
  it('should set URL and set full URL when base URL is set to domain and directory', function(done) {
    var middleware = absoluteURL();
    var page = {};
    page.app = { get: function() { return 'http://www.example.com/~foo'; } }
    page.path = '/home.html';
    page.url = '/home/';
  
    middleware(page, function(err) {
      if (err) { return done(err); }
      expect(page.path).to.equal('/home.html');
      expect(page.url).to.equal('/~foo/home/');
      expect(page.fullURL).to.equal('http://www.example.com/~foo/home/');
      done();
    });
  });
  
  // WIP:
  it('should preserve path when base URL is set to domain and directory with trailing slash', function(done) {
    var middleware = absoluteURL();
    var page = {};
    page.app = { get: function() { return 'http://www.example.com/~foo/'; } }
    page.path = '/home.html';
  
    middleware(page, function(err) {
      if (err) { return done(err); }
      expect(page.path).to.equal('/home.html');
      expect(page.fullURL).to.equal('http://www.example.com/~foo/home.html');
      done();
    });
  });
  
});
