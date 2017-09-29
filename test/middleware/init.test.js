var init = require('../../lib/middleware/init');


describe('middleware/init', function() {
  
  it('should expose properties on page', function(done) {
    var middleware = init();
    var page = {};
    
    middleware(page, function(err) {
      if (err) { return done(err); }
      expect(page.locals).to.be.an('object');
      expect(page.next).to.be.a('function');
      done();
    });
  });
  
});
