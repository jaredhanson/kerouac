var Route = require('../lib/route');


describe('Route', function() {
  
  describe('with path', function() {
    
    var route = new Route('/welcome', [ function(){} ]);
    
    it('should have path property', function() {
      expect(route.path).to.equal('/welcome');
    });
    
    it('should have fns property', function() {
      expect(route.fns).to.be.instanceof(Array);
      expect(route.fns).to.have.length(1);
    });
    
    it('should have whole path', function() {
      expect(route.isWholePath()).to.be.true;
    });
    
    it('should match correctly', function() {
      expect(route.match('/welcome')).to.be.true;
      expect(route.match('/not-welcome')).to.be.false;
    });
  
  });
  
  describe('with parameterized path', function() {
    
    var route = new Route('/blog/:year/:month/:day/:slug', [ function(){} ]);
    
    it('should have path property', function() {
      expect(route.path).to.equal('/blog/:year/:month/:day/:slug');
    });
    
    it('should have fns property', function() {
      expect(route.fns).to.be.instanceof(Array);
      expect(route.fns).to.have.length(1);
    });
    
    it('should not have whole path', function() {
      expect(route.isWholePath()).to.be.false;
    });
    
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
  
  });
  
});
