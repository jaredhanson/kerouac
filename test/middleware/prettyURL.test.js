var prettyURL = require('../../lib/middleware/prettyURL');


describe('middleware/prettyURL', function() {
  
  it('should make ugly paths into pretty URLs', function(done) {
    var middleware = prettyURL();
    var page = {};
    page.path = '/foo.html';
    
    middleware(page, function(err) {
      if (err) { return done(err); }
      expect(page.path).to.equal('/foo.html');
      expect(page.outputPath).to.equal('/foo/index.html');
      expect(page.url).to.equal('/foo/');
      done();
    });
  });
  
  it('should preserve already pretty paths as pretty URLs', function(done) {
    var middleware = prettyURL();
    var page = {};
    page.path = '/foo/index.html';
    
    middleware(page, function(err) {
      if (err) { return done(err); }
      expect(page.path).to.equal('/foo/index.html');
      expect(page.outputPath).to.equal('/foo/index.html');
      expect(page.url).to.equal('/foo/');
      done();
    });
  });
  
  it('should not make non-HTML file types into pretty URLs', function(done) {
    var middleware = prettyURL();
    var page = {};
    page.path = '/foo.xml';
    
    middleware(page, function(err) {
      if (err) { return done(err); }
      expect(page.path).to.equal('/foo.xml');
      expect(page.outputPath).to.be.undefined;
      expect(page.url).to.be.undefined;
      done();
    });
  });
  
  it('should make ugly paths from base path into pretty URLs', function(done) {
    var middleware = prettyURL();
    var page = {};
    page.basePath = '/blog'
    page.path = '/foo.html';
  
    middleware(page, function(err) {
      if (err) { return done(err); }
      expect(page.path).to.equal('/foo.html');
      expect(page.outputPath).to.equal('/blog/foo/index.html');
      expect(page.url).to.equal('/foo/');
      done();
    });
  });
  
  it('should make ugly nested paths from base path into pretty URLs', function(done) {
    var middleware = prettyURL();
    var page = {};
    page.basePath = '/blog'
    page.path = '/2017/09/03/foo.html';
  
    middleware(page, function(err) {
      if (err) { return done(err); }
      expect(page.path).to.equal('/2017/09/03/foo.html');
      expect(page.outputPath).to.equal('/blog/2017/09/03/foo/index.html');
      expect(page.url).to.equal('/2017/09/03/foo/');
      done();
    });
  });
  
  it('should preserve already pretty paths from base path as pretty URLs', function(done) {
    var middleware = prettyURL();
    var page = {};
    page.basePath = '/blog'
    page.path = '/foo/index.html';
  
    middleware(page, function(err) {
      if (err) { return done(err); }
      expect(page.path).to.equal('/foo/index.html');
      expect(page.outputPath).to.equal('/blog/foo/index.html');
      expect(page.url).to.equal('/foo/');
      done();
    });
  });
  
  it('should not make non-HTML file types from base path into pretty URLs', function(done) {
    var middleware = prettyURL();
    var page = {};
    page.basePath = '/blog'
    page.path = '/foo.xml';
  
    middleware(page, function(err) {
      if (err) { return done(err); }
      expect(page.path).to.equal('/foo.xml');
      expect(page.outputPath).to.be.undefined;
      expect(page.url).to.be.undefined;
      done();
    });
  });
  
  describe('with file extension option', function() {
    
    it('should make ugly paths into pretty URLs', function(done) {
      var middleware = prettyURL('.htm');
      var page = {};
      page.path = '/foo.htm';
    
      middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.path).to.equal('/foo.htm');
        expect(page.outputPath).to.equal('/foo/index.htm');
        expect(page.url).to.equal('/foo/');
        done();
      });
    });
  
    it('should preserve already pretty paths as pretty URLs', function(done) {
      var middleware = prettyURL('.htm');
      var page = {};
      page.path = '/foo/index.htm';
    
      middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.path).to.equal('/foo/index.htm');
        expect(page.outputPath).to.equal('/foo/index.htm');
        expect(page.url).to.equal('/foo/');
        done();
      });
    });
    
    it('should not make non-HTML file types into pretty URLs', function(done) {
      var middleware = prettyURL('.htm');
      var page = {};
      page.path = '/foo.xml';
    
      middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.path).to.equal('/foo.xml');
        expect(page.outputPath).to.be.undefined;
        done();
      });
    });
    
  }); // with file extension option
  
  describe('with file extension and index option', function() {
    
    it('should make ugly paths into pretty URLs', function(done) {
      var middleware = prettyURL('.xhtml', 'idx');
      var page = {};
      page.path = '/foo.xhtml';
    
      middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.path).to.equal('/foo.xhtml');
        expect(page.url).to.equal('/foo/');
        expect(page.outputPath).to.equal('/foo/idx.xhtml');
        done();
      });
    });
  
    it('should preserve already pretty paths as pretty URLs', function(done) {
      var middleware = prettyURL('.xhtml', 'idx');
      var page = {};
      page.path = '/foo/idx.xhtml';
    
      middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.path).to.equal('/foo/idx.xhtml');
        expect(page.outputPath).to.equal('/foo/idx.xhtml');
        expect(page.url).to.equal('/foo/');
        done();
      });
    });
    
    it('should not make non-HTML file types into pretty URLs', function(done) {
      var middleware = prettyURL('.xhtml', '.idx');
      var page = {};
      page.path = '/foo.xml';
    
      middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.path).to.equal('/foo.xml');
        expect(page.outputPath).to.be.undefined;
        expect(page.url).to.be.undefined;
        done();
      });
    });
    
  }); // with file extension and index option
  
});
