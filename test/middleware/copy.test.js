var copy = require('../../lib/middleware/copy');
var path = require('path');


describe('middleware/copy', function() {
  
  it('should copy file', function(done) {
    var middleware = copy('test/data/hello');
    var page = {};
    page.params = [ 'hello.txt' ];
    page.copy = function(name) {
      expect(name).to.equal(path.resolve(__dirname, '../data/hello/hello.txt'));
      done();
    }
  
    middleware(page, function(err) {
      done(new Error('should not call next'));
    });
  });
  
});
