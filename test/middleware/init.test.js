var init = require('middleware/init');


describe('init middleware', function() {
  
  it('should expose properties on page', function(done) {
    var middleware = init('site', 'pages');
    var page = {};
    
    middleware(page, function(err) {
      if (err) { return done(err); }
      expect(page.site).to.equal('site');
      expect(page.pages).to.equal('pages');
      expect(page.locals).to.be.an('object');
      expect(page.next).to.be.a('function');
      done();
    });
  });
  
});
