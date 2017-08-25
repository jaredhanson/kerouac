var render = require('../../lib/middleware/render');


describe('render middleware', function() {
  
  it('should render page', function(done) {
    var middleware = render();
    var page = {};
    page.render = function() {
      expect(arguments).to.have.length(0);
      done();
    }
    
    middleware(page, function(err) {
    });
  });
  
});
