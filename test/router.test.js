var Router = require('../lib/router');


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
  
  describe('with route that is parameterized', function() {
    
    var router = new Router();
    
    router.route('/blog/:year/:month/:day/:slug', function(page, next) {
      page.gotParams = [];
      page.gotParams.push(page.params['year']);
      page.gotParams.push(page.params['month']);
      page.gotParams.push(page.params['day']);
      page.gotParams.push(page.params['slug']);
      next();
    });
    
    router.route('/blog/2013/04/20/foo', function(page, next) {
      page.blogPage = true;
      next();
    });
    
    it('should dispatch /blog', function(done) {
      var page = {};
      page.path = '/blog/2013/04/20/foo'
      
      router.middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.gotParams).to.have.length(4);
        expect(page.gotParams[0]).to.equal('2013');
        expect(page.gotParams[1]).to.equal('04');
        expect(page.gotParams[2]).to.equal('20');
        expect(page.gotParams[3]).to.equal('foo');
        expect(page.blogPage).to.be.true;
        done();
      })
    });
    
  });
  
  describe('with route that encounters an error', function() {
    
    var router = new Router();
    
    router.route('/foo', function(page, next) {
      next(new Error('something went wrong'));
    });
    
    it('should dispatch /foo', function(done) {
      var page = {};
      page.path = '/foo'
      
      router.middleware(page, function(err) {
        expect(err).to.not.be.undefined;
        expect(err.message).to.equal('something went wrong');
        done();
      })
    });
    
  });
  
  describe('with route that throws an exception', function() {
    
    var router = new Router();
    
    router.route('/foo', function(page, next) {
      throw new Error('something went horribly wrong');
    });
    
    it('should dispatch /foo', function(done) {
      var page = {};
      page.path = '/foo'
      
      router.middleware(page, function(err) {
        expect(err).to.not.be.undefined;
        expect(err.message).to.equal('something went horribly wrong');
        done();
      })
    });
    
  });
  
  describe('with route containing error handling that is not called', function() {
    
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
      function(err, page, next) {
        page.routedTo.push('error');
        next();
      });
    
    it('should dispatch /foo', function(done) {
      var page = {};
      page.path = '/foo'
      
      router.middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.routedTo).to.be.an.instanceOf(Array);
        expect(page.routedTo).to.have.length(2);
        expect(page.routedTo[0]).to.equal('1');
        expect(page.routedTo[1]).to.equal('2');
        done();
      })
    });
    
  });
  
  describe('with route containing error handling that is called', function() {
    
    var router = new Router();
    
    router.route('/foo',
      function(page, next) {
        page.routedTo = [ '1' ];
        next(new Error('1 error'));
      },
      function(page, next) {
        page.routedTo.push('2');
        next();
      },
      function(err, page, next) {
        page.routedTo.push(err.message);
        next();
      });
    
    it('should dispatch /foo', function(done) {
      var page = {};
      page.path = '/foo'
      
      router.middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.routedTo).to.be.an.instanceOf(Array);
        expect(page.routedTo).to.have.length(2);
        expect(page.routedTo[0]).to.equal('1');
        expect(page.routedTo[1]).to.equal('1 error');
        done();
      })
    });
    
  });
  
  describe('with route containing error handling that is called due to an exception', function() {
    
    var router = new Router();
    
    router.route('/foo',
      function(page, next) {
        page.routedTo = [ '1' ];
        wtf
        next();
      },
      function(page, next) {
        page.routedTo.push('2');
        next();
      },
      function(err, page, next) {
        page.routedTo.push(err.message);
        next();
      });
    
    it('should dispatch /foo', function(done) {
      var page = {};
      page.path = '/foo'
      
      router.middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.routedTo).to.be.an.instanceOf(Array);
        expect(page.routedTo).to.have.length(2);
        expect(page.routedTo[0]).to.equal('1');
        expect(page.routedTo[1]).to.have.string('is not defined');
        done();
      })
    });
    
  });
  
});
