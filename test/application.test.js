var kerouac = require('..');


describe('application', function() {
  var site = kerouac();
  
  describe('#fm', function() {
    
    it('should parse YAML front matter', function() {
      var yaml = "layout: 'yaml'\n"
               + "title: 'Hello YAML'\n";
      
      var data = site.fm(yaml);
      expect(data).to.deep.equal({
        layout: 'yaml',
        title: 'Hello YAML'
      });
    });
    
    it('should parse JSON front matter', function() {
      var json = "{ 'layout': 'json', 'title': 'Hello JSON' }"
      
      var data = site.fm(json);
      expect(data).to.deep.equal({
        layout: 'json',
        title: 'Hello JSON'
      });
    });
    
  }); // #fm
  
}); // application
