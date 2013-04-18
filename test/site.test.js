var Site = require('site')
  , Page = require('page');


describe('Site', function() {
    
  it('should add pages by path', function() {
    var site = new Site();
    expect(Object.keys(site)).to.have.length(0);
    
    site.add('/index.html');
    expect(Object.keys(site)).to.have.length(1);
    expect(site['/index.html']).to.be.instanceof(Page);
    
    site.add('/about.html');
    expect(Object.keys(site)).to.have.length(2);
    expect(site['/about.html']).to.be.instanceof(Page);
  });
  
  it('should have single page when adding path twice', function() {
    var site = new Site();
    expect(Object.keys(site)).to.have.length(0);
    
    site.add('/legal.html');
    expect(Object.keys(site)).to.have.length(1);
    var p = site['/legal.html'];
    expect(p).to.be.instanceof(Page);
    
    site.add('/legal.html');
    expect(Object.keys(site)).to.have.length(1);
    expect(site['/legal.html']).to.be.equal(p);
  });
  
});
