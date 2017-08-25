var url = require('../../lib/middleware/url');


describe('url middleware', function() {
  
  it('should set URL of page', function(done) {
    var middleware = url();
    var page = {};
    page.path = 'foo.html';
    page.site = {
      get: function(key) { if (key == 'base url') return 'http://www.example.com/'; }
    }
    
    middleware(page, function(err) {
      if (err) { return done(err); }
      expect(page.url).to.equal('http://www.example.com/foo.html');
      done();
    });
  });
  
  it('should not set URL of page if base url is not defined', function(done) {
    var middleware = url();
    var page = {};
    page.path = 'foo.html';
    page.site = {
      get: function(key) { return undefined; }
    }
    
    middleware(page, function(err) {
      if (err) { return done(err); }
      expect(page.url).to.be.undefined;
      done();
    });
  });
  
});
