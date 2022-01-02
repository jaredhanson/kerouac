var kerouac = require('..');


describe('application', function() {
  var site = kerouac();
  
  describe('#fm', function() {
    
    it('should parse YAML front matter', function() {
      var str = "layout: 'yaml'\n"
               + "title: 'Hello YAML'\n";
      
      var fm = site.fm(str);
      expect(fm).to.deep.equal({
        layout: 'yaml',
        title: 'Hello YAML'
      });
    });
    
    it('should parse JSON front matter', function() {
      var str = "{ 'layout': 'json', 'title': 'Hello JSON' }"
      
      var fm = site.fm(str);
      expect(fm).to.deep.equal({
        layout: 'json',
        title: 'Hello JSON'
      });
    }); // should parse JSON front matter
    
    it('should not parse empty front matter', function() {
      var str = '';
      
      var fm = site.fm(str);
      expect(fm).to.be.undefined;
    }); // should not parse empty front matter
    
    it('should throw when parsing invalid front matter', function() {
      var str = 'beep boop';
      
      expect(function() {
        site.fm(str);
      }).to.throw(SyntaxError);
    }); // should throw when parsing invalid front matter
    
  }); // #fm
  
  describe('#highlight', function() {
    
    it('should highlight syntax', function() {
      var str = "function foo() {};"
      
      var html = site.highlight(str);
      expect(html).to.equal('<span class=\"function\"><span class=\"keyword\">function</span> <span class=\"title\">foo</span><span class=\"params\">()</span> </span>{};');
    });
    
    
  }); // #highlight
  
}); // application
