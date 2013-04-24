var prettyURL = require('middleware/prettyURL');


describe('prettyURL middleware', function() {
  
  it('should make ugly URLs pretty', function(done) {
    var middleware = prettyURL();
    var page = {};
    page.path = '/foo.html';
    
    middleware(page, function(err) {
      if (err) { return done(err); }
      expect(page.path).to.equal('/foo/index.html');
      done();
    });
  });
  
  it('should not make index URLs pretty', function(done) {
    var middleware = prettyURL();
    var page = {};
    page.path = '/foo/index.html';
    
    middleware(page, function(err) {
      if (err) { return done(err); }
      expect(page.path).to.equal('/foo/index.html');
      done();
    });
  });
  
});

describe('prettyURL middleware with ext option', function() {
  
  it('should make ugly URLs pretty', function(done) {
    var middleware = prettyURL('.htm');
    var page = {};
    page.path = '/foo.htm';
    
    middleware(page, function(err) {
      if (err) { return done(err); }
      expect(page.path).to.equal('/foo/index.htm');
      done();
    });
  });
  
  it('should not make index URLs pretty', function(done) {
    var middleware = prettyURL('.htm');
    var page = {};
    page.path = '/foo/index.htm';
    
    middleware(page, function(err) {
      if (err) { return done(err); }
      expect(page.path).to.equal('/foo/index.htm');
      done();
    });
  });
  
});

describe('prettyURL middleware with ext and index option', function() {
  
  it('should make ugly URLs pretty', function(done) {
    var middleware = prettyURL('.xhtml', 'idx');
    var page = {};
    page.path = '/foo.xhtml';
    
    middleware(page, function(err) {
      if (err) { return done(err); }
      expect(page.path).to.equal('/foo/idx.xhtml');
      done();
    });
  });
  
  it('should not make index URLs pretty', function(done) {
    var middleware = prettyURL('.xhtml', 'idx');
    var page = {};
    page.path = '/foo/idx.xhtml';
    
    middleware(page, function(err) {
      if (err) { return done(err); }
      expect(page.path).to.equal('/foo/idx.xhtml');
      done();
    });
  });
  
});
