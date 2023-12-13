var chai = require('chai');
var init = require('../../lib/middleware/init');


describe('middleware/init', function() {
  
  it('should initialize page', function(done) {
    var app = function(){};
    app.pageext = new Object();
    app.pageext.render = function() {};
    
    var middleware = init(app);
    var page = {};
    
    middleware(page, function(err) {
      if (err) { return done(err); }
      expect(page.next).to.be.a('function');
      expect(page.render).to.be.a('function');
      expect(page.locals).to.be.an('object');
      done();
    });
  });
  
});
