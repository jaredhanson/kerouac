var Route = require('../lib/route');


describe('Route', function() {
  
  describe('with path', function() {
    
    var route = new Route('/welcome', [ function(){} ]);
    
    it('should have path property', function() {
      expect(route.path).to.equal('/welcome');
    });
    
    // TODO: Put this back
    /*
    it('should have fns property', function() {
      expect(route.fns).to.be.instanceof(Array);
      expect(route.fns).to.have.length(1);
    });
    */
    
    // TODO: put this back
    /*
    it('should be bound', function() {
      expect(route.isBound()).to.be.true;
    });
    */
    
    // TODO: Put this back
    /*
    it('should match correctly', function() {
      expect(route.match('/welcome')).to.be.true;
      expect(route.params).to.be.instanceof(Object);
      expect(Object.keys(route.params)).to.have.length(0);
      
      expect(route.match('/not-welcome')).to.be.false;
    });
    */
    
    // TODO: Put this back
    /*
    it('should not match correctly', function() {
      expect(route.match('/not-welcome')).to.be.false;
    });
    */
    
  });
  
  describe('with parameterized path', function() {
    
    var route = new Route('/blog/:year/:month/:day/:slug', [ function(){} ]);
    
    it('should have path property', function() {
      expect(route.path).to.equal('/blog/:year/:month/:day/:slug');
    });
    
    // TODO: Put this back
    /*
    it('should have fns property', function() {
      expect(route.fns).to.be.instanceof(Array);
      expect(route.fns).to.have.length(1);
    });
    */
    
    // TODO: Put this back
    /*
    it('should not be bound', function() {
      expect(route.isBound()).to.be.false;
    });
    */
    
    // TODO: Put this back
    /*
    it('should match correctly', function() {
      expect(route.match('/blog/2013/04/18/hello-world')).to.be.true;
      expect(route.params).to.be.instanceof(Object);
      expect(Object.keys(route.params)).to.have.length(4);
      expect(route.params.year).to.equal('2013');
      expect(route.params.month).to.equal('04');
      expect(route.params.day).to.equal('18');
      expect(route.params.slug).to.equal('hello-world');
      
      expect(route.match('/blog/2013/04/18')).to.be.false;
      expect(route.match('/not-blog/2013/04/18/hello-world')).to.be.false;
    });
    */
    
    // TODO: Put this back
    /*
    it('should not match correctly', function() {
      expect(route.match('/blog/2013/04/18')).to.be.false;
      expect(route.match('/not-blog/2013/04/18/hello-world')).to.be.false;
    });
    */
  });
  
});
