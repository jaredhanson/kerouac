var prettyURL = require('../../lib/middleware/prettyURL');


describe.only('middleware/prettyURL', function() {
  
  it('should make ugly URLs pretty', function(done) {
    var middleware = prettyURL();
    var page = {};
    page.path = '/foo.html';
    
    middleware(page, function(err) {
      if (err) { return done(err); }
      expect(page.path).to.equal('/foo.html');
      expect(page.url).to.equal('/foo/');
      expect(page.outputPath).to.equal('/foo/index.html');
      done();
    });
  });
  
  it('should make index URLs pretty', function(done) {
    var middleware = prettyURL();
    var page = {};
    page.path = '/foo/index.html';
    
    middleware(page, function(err) {
      if (err) { return done(err); }
      expect(page.path).to.equal('/foo/index.html');
      expect(page.url).to.equal('/foo/');
      expect(page.outputPath).to.equal('/foo/index.html');
      done();
    });
  });
  
  it('should not make other exensions pretty', function(done) {
    var middleware = prettyURL();
    var page = {};
    page.path = '/foo.xml';
    
    middleware(page, function(err) {
      if (err) { return done(err); }
      expect(page.path).to.equal('/foo.xml');
      expect(page.outputPath).to.be.undefined;
      done();
    });
  });
  
  describe('with ext option', function() {
    
    it('should make ugly URLs pretty', function(done) {
      var middleware = prettyURL('.htm');
      var page = {};
      page.path = '/foo.htm';
    
      middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.path).to.equal('/foo.htm');
        expect(page.url).to.equal('/foo/');
        expect(page.outputPath).to.equal('/foo/index.htm');
        done();
      });
    });
  
    it('should make index URLs pretty', function(done) {
      var middleware = prettyURL('.htm');
      var page = {};
      page.path = '/foo/index.htm';
    
      middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.path).to.equal('/foo/index.htm');
        expect(page.url).to.equal('/foo/');
        expect(page.outputPath).to.equal('/foo/index.htm');
        done();
      });
    });
    
    it('should not make other exensions pretty', function(done) {
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
    
  }); // with ext option
  
  describe('with ext and index option', function() {
    
    it('should make ugly URLs pretty', function(done) {
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
  
    it('should make index URLs pretty', function(done) {
      var middleware = prettyURL('.xhtml', 'idx');
      var page = {};
      page.path = '/foo/idx.xhtml';
    
      middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.path).to.equal('/foo/idx.xhtml');
        expect(page.url).to.equal('/foo/');
        expect(page.outputPath).to.equal('/foo/idx.xhtml');
        done();
      });
    });
    
    it('should not make other exensions pretty', function(done) {
      var middleware = prettyURL('.xhtml', '.idx');
      var page = {};
      page.path = '/foo.xml';
    
      middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.path).to.equal('/foo.xml');
        expect(page.outputPath).to.be.undefined;
        done();
      });
    });
    
  }); // with ext and index option
  
  describe('base path handling', function() {
    
    it('should build correct output path with root path', function(done) {
      var middleware = prettyURL();
      var page = {};
      page.basePath = '/blog'
      page.path = '/foo.html';
    
      middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.path).to.equal('/foo.html');
        expect(page.url).to.equal('/foo/');
        expect(page.outputPath).to.equal('/blog/foo/index.html');
        done();
      });
    });
    
    it('should build correct output path with nested path', function(done) {
      var middleware = prettyURL();
      var page = {};
      page.basePath = '/blog'
      page.path = '/2017/09/03/foo.html';
    
      middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.path).to.equal('/2017/09/03/foo.html');
        expect(page.url).to.equal('/2017/09/03/foo/');
        expect(page.outputPath).to.equal('/blog/2017/09/03/foo/index.html');
        done();
      });
    });
    
  });
  
});
