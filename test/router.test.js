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
  
  describe('with route containing multiple callbacks', function() {
    
    var router = new Router();
    
    router.route('/foo',
      function(page, next) {
        page.routedTo = [ '1' ];
        next();
      },
      function(page, next) {
        page.routedTo.push('2');
        next();
      },
      function(page, next) {
        page.routedTo.push('3');
        next();
      });
    
    it('should dispatch /foo', function(done) {
      var page = {};
      page.path = '/foo'
      
      router.middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.routedTo).to.be.an.instanceOf(Array);
        expect(page.routedTo).to.have.length(3);
        expect(page.routedTo[0]).to.equal('1');
        expect(page.routedTo[1]).to.equal('2');
        expect(page.routedTo[2]).to.equal('3');
        done();
      })
    });
    
  });
  
  describe('with route containing multiple callbacks some of which are skipped', function() {
    
    var router = new Router();
    
    router.route('/foo',
      function(page, next) {
        page.routedTo = [ 'a1' ];
        next();
      },
      function(page, next) {
        page.routedTo.push('a2');
        next('route');
      },
      function(page, next) {
        page.routedTo.push('a3');
        next();
      });
      
    router.route('/foo', function(page, next) {
      page.routedTo.push('b1');
      next();
    });
    
    it('should dispatch /foo', function(done) {
      var page = {};
      page.path = '/foo'
      
      router.middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.routedTo).to.be.an.instanceOf(Array);
        expect(page.routedTo).to.have.length(3);
        expect(page.routedTo[0]).to.equal('a1');
        expect(page.routedTo[1]).to.equal('a2');
        expect(page.routedTo[2]).to.equal('b1');
        done();
      })
    });
    
  });
  
});
