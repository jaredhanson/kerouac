var copy = require('middleware/copy');


describe('copy middleware', function() {
  
  it('should copy page', function(done) {
    var middleware = copy('foo.ext');
    var page = {};
    page.copy = function(path) {
      expect(arguments).to.have.length(1);
      expect(path).to.be.equal('foo.ext');
      done();
    }
    
    middleware(page, function(err) {
    });
  });
  
});
