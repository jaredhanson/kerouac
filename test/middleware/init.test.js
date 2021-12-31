var chai = require('chai');
var init = require('../../lib/middleware/init');


describe('middleware/init', function() {
  
  it('should expose properties on page', function(done) {
    var app = function(){};
    app.pageext = new Object();
    app.pageext.render = function() {};
    
    chai.kerouac.use(init(app))
      .next(function(err, page) {
        if (err) { return done(err); }
        expect(page.next).to.be.a('function');
        expect(page.render).to.be.a('function');
        expect(page.locals).to.be.an('object');
        done();
      })
      .generate();
  });
  
});
