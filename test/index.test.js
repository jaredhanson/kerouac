var kerouac = require('index');


describe('Kerouac', function() {
    
  it('should export function', function() {
    expect(kerouac).to.be.a('function');
    
    var site = kerouac();
    expect(site.constructor.name).to.equal('Kerouac');
  });
  
  describe('newly initialized site', function() {
    var site = kerouac();
    
    it('should parse YAML front matter', function() {
      var yaml = "layout: 'yaml'\n"
               + "title: 'Hello YAML'\n";
      
      var data = site.fm(yaml);
      expect(data.layout).to.equal('yaml');
      expect(data.title).to.equal('Hello YAML');
    });
    
    it('should parse JSON front matter', function() {
      var json = "{ 'layout': 'json', 'title': 'Hello JSON' }"
      
      var data = site.fm(json);
      expect(data.layout).to.equal('json');
      expect(data.title).to.equal('Hello JSON');
    });
    
    it('should not parse unknown front matter format', function() {
      var unknown = "foobar"
      
      var data = site.fm(unknown);
      expect(data).to.be.undefined;
    });
  });
  
});
