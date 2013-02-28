var kerouac = require('index');


describe('kerouac', function() {
    
  it('should export function', function() {
    expect(kerouac).to.be.a('function');
    
    var site = kerouac();
    expect(site.constructor.name).to.equal('Kerouac');
  });
  
});
