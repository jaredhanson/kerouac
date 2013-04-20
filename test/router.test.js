var Router = require('router');


describe('Router', function() {
  
  describe('with two simple routes', function() {
    
    var router = new Router();
    
    router.route('/foo', function(page, next) {
      page.routedToFoo = true;
      next();
    });
    
    router.route('/bar', function(page, next) {
      page.routedToBar = true;
      next();
    });
    
    it('should have two routes', function() {
      expect(router._routes).to.have.length(2);
    });
    
    it('should dispatch /foo', function(done) {
      var page = {};
      page.path = '/foo'
      
      router.middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.routedToFoo).to.be.true;
        expect(page.routedToBar).to.be.undefined;
        done();
      })
    });
    
    it('should dispatch /bar', function(done) {
      var page = {};
      page.path = '/bar'
      
      router.middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.routedToFoo).to.be.undefined;
        expect(page.routedToBar).to.be.true;
        done();
      })
    });
    
    it('should not dispatch /baz', function(done) {
      var page = {};
      page.path = '/baz'
      
      router.middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.routedToFoo).to.be.undefined;
        expect(page.routedToBar).to.be.undefined;
        done();
      })
    });
    
  });
  
});
