var Route = require('route');


describe('Route', function() {
  
  describe('with whole path', function() {
    
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
  
});
