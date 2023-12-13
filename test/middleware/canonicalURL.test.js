var chai = require('chai');
var canonicalURL = require('../../lib/middleware/canonicalURL');


describe('middleware/canonicalURL', function() {
  
  it('should set canonical URL to URL', function(done) {
    var middleware = canonicalURL();
    var page = {};
    page.locals = {};
    page.url = '/2000/01/01/hello/';
    
    middleware(page, function(err) {
      if (err) { return done(err); }
      expect(page.locals.canonicalURL).to.equal('/2000/01/01/hello/');
      done();
    });
  });
  
  it('should set canonical URL to full URL', function(done) {
    var middleware = canonicalURL();
    var page = {};
    page.locals = {};
    page.fullURL = 'http://www.example.com/2000/01/01/hello/';
    
    middleware(page, function(err) {
      if (err) { return done(err); }
      expect(page.locals.canonicalURL).to.equal('http://www.example.com/2000/01/01/hello/');
      done();
    });
  });
  
  it('should not set canonical URL when URL not defined', function(done) {
    var middleware = canonicalURL();
    var page = {};
    page.locals = {};
    
    middleware(page, function(err) {
      if (err) { return done(err); }
      expect(page.locals.canonicalURL).to.be.undefined;
      done();
    });
  });
  
});
