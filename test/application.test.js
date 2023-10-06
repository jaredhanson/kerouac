var $require = require('proxyquire');
var kerouac = require('..');
var path = require('path');


describe('application', function() {
  var app = kerouac();
  
  describe('#fm', function() {
    
    it('should parse YAML front matter', function() {
      var str = "layout: 'yaml'\n"
              + "title: 'Hello YAML'\n";
      
      var fm = app.fm(str);
      expect(fm).to.deep.equal({
        layout: 'yaml',
        title: 'Hello YAML'
      });
    });
    
    it('should parse JSON front matter', function() {
      var str = "{ 'layout': 'json', 'title': 'Hello JSON' }"
      
      var fm = app.fm(str);
      expect(fm).to.deep.equal({
        layout: 'json',
        title: 'Hello JSON'
      });
    }); // should parse JSON front matter
    
    it('should not parse empty front matter', function() {
      var str = '';
      
      var fm = app.fm(str);
      expect(fm).to.be.undefined;
    }); // should not parse empty front matter
    
    it('should throw when parsing invalid front matter', function() {
      var str = 'beep boop';
      
      expect(function() {
        app.fm(str);
      }).to.throw(SyntaxError);
    }); // should throw when parsing invalid front matter
    
  }); // #fm
  
  describe('#highlight', function() {
    
    it('should highlight syntax', function() {
      var str = "function foo() {};"
      
      var html = app.highlight(str);
      expect(html).to.equal('<span class=\"function\"><span class=\"keyword\">function</span> <span class=\"title\">foo</span><span class=\"params\">()</span> </span>{};');
    }); // should highlight syntax
    
  }); // #highlight
  
  describe('#render', function() {
    
    it('should render layout', function(done) {
      var app = kerouac();
      app.set('layouts', path.resolve(__dirname, 'layouts'));
      
      app.render('hello', function(err, out) {
        if (err) { return done(err); }
        expect(out).to.equal('<p>Hello.<p>\n');
        done();
      });
    }); // should render layout
    
    it('should render layout with options', function(done) {
      var app = kerouac();
      app.set('layouts', path.resolve(__dirname, 'layouts'));
      
      app.render('hello-name', { name: 'Alice' }, function(err, out) {
        if (err) { return done(err); }
        expect(out).to.equal('<p>Hello Alice.<p>\n');
        done();
      });
    }); // should render layout with options
    
    it('should render layout with page locals', function(done) {
      var app = kerouac();
      app.set('layouts', path.resolve(__dirname, 'layouts'));
      
      app.render('hello-name', { _locals: { name: 'Alice' } }, function(err, out) {
        if (err) { return done(err); }
        expect(out).to.equal('<p>Hello Alice.<p>\n');
        done();
      });
    }); // should render layout with page locals
    
    it('should render layout with app locals', function(done) {
      var app = kerouac();
      app.set('layouts', path.resolve(__dirname, 'layouts'));
      app.locals.name = 'Alice';
      
      app.render('hello-name', function(err, out) {
        if (err) { return done(err); }
        expect(out).to.equal('<p>Hello Alice.<p>\n');
        done();
      });
    }); // should render layout with app locals
    
    
    it('should render content', function(done) {
      var Layout = function(name, options) {
        expect(name).to.equal('robot');
        this.path = [ this.root, name ].join('/');
      };
      Layout.prototype.render = function(options, callback) {
        expect(options.say).to.equal('beep boop');
        process.nextTick(function() {
          callback(null, '<html>');
        });
      };
      
      var app = $require('../lib/application', {
        './layout': Layout
      });
      var kerouac = $require('..', {
        './application': app
      });
      
      var app = kerouac();
      app.engine('md', {
        render: function(str, options, callback) {
          process.nextTick(function() {
            callback(null, '<xhtml>');
          });
        },
        // FIXME: Shouldn't need to have this function here
        renderFile: function() {
        }
      });
      
      app.convert({ content: '# Hello' }, 'md', function(err, out) {
        if (err) { return done(err); }
        expect(out).to.equal('<xhtml>');
        done();
      }, false);
    }); // should render content
    
  }); // #render
  
}); // application
