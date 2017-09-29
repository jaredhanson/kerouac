var prettyURL = require('../../lib/middleware/prettyURL');


describe('middleware/prettyURL', function() {
  
  it('should make ugly URLs pretty', function(done) {
    var middleware = prettyURL();
    var page = {};
    page.path = '/foo.html';
    page.url = '/foo.html';
    
    middleware(page, function(err) {
      if (err) { return done(err); }
      expect(page.path).to.equal('/foo.html');
      expect(page.url).to.equal('/foo/');
      expect(page.outputPath).to.equal('/foo/index.html');
      done();
    });
  });
  
  it('should not make index URLs pretty', function(done) {
    var middleware = prettyURL();
    var page = {};
    page.path = '/foo/index.html';
    page.url = '/foo/index.html';
    
    middleware(page, function(err) {
      if (err) { return done(err); }
      expect(page.path).to.equal('/foo/index.html');
      expect(page.url).to.equal('/foo/index.html');
      expect(page.outputPath).to.be.undefined;
      done();
    });
  });
  
  describe('with ext option', function() {
    
    it('should make ugly URLs pretty', function(done) {
      var middleware = prettyURL('.htm');
      var page = {};
      page.path = '/foo.htm';
      page.url = '/foo.htm';
    
      middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.path).to.equal('/foo.htm');
        expect(page.url).to.equal('/foo/');
        expect(page.outputPath).to.equal('/foo/index.htm');
        done();
      });
    });
  
    it('should not make index URLs pretty', function(done) {
      var middleware = prettyURL('.htm');
      var page = {};
      page.path = '/foo/index.htm';
      page.url = '/foo/index.htm';
    
      middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.path).to.equal('/foo/index.htm');
        expect(page.url).to.equal('/foo/index.htm');
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
      page.url = '/foo.xhtml';
    
      middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.path).to.equal('/foo.xhtml');
        expect(page.url).to.equal('/foo/');
        expect(page.outputPath).to.equal('/foo/idx.xhtml');
        done();
      });
    });
  
    it('should not make index URLs pretty', function(done) {
      var middleware = prettyURL('.xhtml', 'idx');
      var page = {};
      page.path = '/foo/idx.xhtml';
      page.url = '/foo/idx.xhtml';
    
      middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.path).to.equal('/foo/idx.xhtml');
        expect(page.url).to.equal('/foo/idx.xhtml');
        expect(page.outputPath).to.be.undefined;
        done();
      });
    });
    
  }); // with ext and index option
  
});
