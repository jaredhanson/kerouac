var Router = require('../lib/router/index');


describe.skip('Router', function() {
  
  describe('two simple routes', function() {
    
    var router = new Router();
    
    router.route('/foo', function(page, next) {
      page.foo = true;
      next();
    });
    
    router.route('/bar', function(page, next) {
      page.bar = true;
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
        expect(page.foo).to.be.true;
        expect(page.bar).to.be.undefined;
        done();
      })
    });
    
    it('should dispatch /bar', function(done) {
      var page = {};
      page.path = '/bar'
      
      router.middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.foo).to.be.undefined;
        expect(page.bar).to.be.true;
        done();
      })
    });
    
    it('should not dispatch /baz', function(done) {
      var page = {};
      page.path = '/baz'
      
      router.middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.foo).to.be.undefined;
        expect(page.bar).to.be.undefined;
        done();
      })
    });
    
  });
  
  describe('one route containing multiple callbacks', function() {
    
    var router = new Router();
    
    router.route('/foo',
      function(page, next) {
        page.__locals = [ '1' ];
        next();
      },
      function(page, next) {
        page.__locals.push('2');
        next();
      },
      function(page, next) {
        page.__locals.push('3');
        next();
      });
    
    it('should dispatch', function(done) {
      var page = {};
      page.path = '/foo'
      
      router.middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.__locals).to.be.an.instanceOf(Array);
        expect(page.__locals).to.have.length(3);
        expect(page.__locals[0]).to.equal('1');
        expect(page.__locals[1]).to.equal('2');
        expect(page.__locals[2]).to.equal('3');
        done();
      })
    });
    
  });
  
  describe('multiple routes declared with same path, containing a callback which is skipped', function() {
    
    var router = new Router();
    
    router.route('/foo',
      function(page, next) {
        page.__locals = [ '1A' ];
        next();
      },
      function(page, next) {
        page.__locals.push('2A');
        next('route');
      },
      function(page, next) {
        page.__locals.push('3A');
        next();
      });
      
    router.route('/foo', function(page, next) {
      page.__locals.push('1B');
      next();
    });
    
    it('should dispatch', function(done) {
      var page = {};
      page.path = '/foo'
      
      router.middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.__locals).to.be.an.instanceOf(Array);
        expect(page.__locals).to.have.length(3);
        expect(page.__locals[0]).to.equal('1A');
        expect(page.__locals[1]).to.equal('2A');
        expect(page.__locals[2]).to.equal('1B');
        done();
      })
    });
    
  });
  
  describe('route that is parameterized', function() {
    
    var router = new Router();
    
    router.route('/blog/:year/:month/:day/:slug', function(page, next) {
      page.__locals = [];
      page.__locals.push(page.params['year']);
      page.__locals.push(page.params['month']);
      page.__locals.push(page.params['day']);
      page.__locals.push(page.params['slug']);
      next();
    });
    
    it('should dispatch with parameter values', function(done) {
      var page = {};
      page.path = '/blog/2013/04/20/foo'
      
      router.middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.__locals).to.have.length(4);
        expect(page.__locals[0]).to.equal('2013');
        expect(page.__locals[1]).to.equal('04');
        expect(page.__locals[2]).to.equal('20');
        expect(page.__locals[3]).to.equal('foo');
        done();
      })
    });
    
  });
  
  describe('route that encounters an error', function() {
    
    var router = new Router();
    
    router.route('/foo', function(page, next) {
      next(new Error('something went wrong'));
    });
    
    it('should dispatch', function(done) {
      var page = {};
      page.path = '/foo'
      
      router.middleware(page, function(err) {
        expect(err).to.not.be.undefined;
        expect(err.message).to.equal('something went wrong');
        done();
      })
    });
    
  });
  
  describe('route that throws an exception', function() {
    
    var router = new Router();
    
    router.route('/foo', function(page, next) {
      throw new Error('something went horribly wrong');
    });
    
    it('should dispatch', function(done) {
      var page = {};
      page.path = '/foo'
      
      router.middleware(page, function(err) {
        expect(err).to.not.be.undefined;
        expect(err.message).to.equal('something went horribly wrong');
        done();
      })
    });
    
  });
  
  describe('with route containing error handling that is not invoked', function() {
    
    var router = new Router();
    
    router.route('/foo',
      function(page, next) {
        page.__locals = [ '1' ];
        next();
      },
      function(page, next) {
        page.__locals.push('2');
        next();
      },
      function(err, page, next) {
        page.__locals.push('error');
        next();
      });
    
    it('should dispatch', function(done) {
      var page = {};
      page.path = '/foo'
      
      router.middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.__locals).to.be.an.instanceOf(Array);
        expect(page.__locals).to.have.length(2);
        expect(page.__locals[0]).to.equal('1');
        expect(page.__locals[1]).to.equal('2');
        done();
      })
    });
    
  });
  
  describe('with route containing error handling that is invoked', function() {
    
    var router = new Router();
    
    router.route('/foo',
      function(page, next) {
        page.__locals = [ '1' ];
        next(new Error('1X'));
      },
      function(page, next) {
        page.__locals.push('2');
        next();
      },
      function(err, page, next) {
        page.__locals.push(err.message);
        next();
      });
    
    it('should dispatch', function(done) {
      var page = {};
      page.path = '/foo'
      
      router.middleware(page, function(err) {
        if (err) { return done(err); }
        expect(page.__locals).to.be.an.instanceOf(Array);
        expect(page.__locals).to.have.length(2);
        expect(page.__locals[0]).to.equal('1');
        expect(page.__locals[1]).to.equal('1X');
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
