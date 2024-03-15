var expect = require('chai').expect;
var sinon = require('sinon');
var Page = require('../lib/page');
var pagex = require('../lib/page-ex');
var setPrototypeOf = require('setprototypeof');


describe('Page extensions', function() {
  
  describe('#render', function() {
    
    it('should render layout and write page', function(done) {
      var app = new function(){};
      app.render = sinon.stub().yieldsAsync(null, '<p>Hello</p>');
      
      var page = new Page();
      setPrototypeOf(page, Object.create(pagex, {
          app: { configurable: true, enumerable: true, writable: true, value: app }
        }));
        
      page.write = sinon.spy();
      page.end = function() {
        expect(page.app.render.getCall(0).args[0]).to.equal('index');
        expect(page.app.render.getCall(0).args[1]).to.deep.equal({
          _locals: undefined
        });
        expect(page.write.getCall(0).args[0]).to.equal('<p>Hello</p>');
        done();
      };
      page.next = function() {
        done('Page#next should not be called');
      };
      
      page.render('index');
    }); // should render layout and write page
    
    it('should render layout with locals and write page', function(done) {
      var app = new function(){};
      app.render = sinon.stub().yieldsAsync(null, '<p>Hello</p>');
      
      var page = new Page();
      setPrototypeOf(page, Object.create(pagex, {
          app: { configurable: true, enumerable: true, writable: true, value: app }
        }));
        
      page.write = sinon.spy();
      page.end = function() {
        expect(page.app.render.getCall(0).args[0]).to.equal('index');
        expect(page.app.render.getCall(0).args[1]).to.deep.equal({
          name: 'Tobi',
          _locals: undefined
        });
        expect(page.write.getCall(0).args[0]).to.equal('<p>Hello</p>');
        done();
      };
      page.next = function() {
        done('Page#next should not be called');
      };
      
      page.render('index', { name: 'Tobi' });
    }); // should render layout with locals and write page
    
    it('should render layout with page locals and write page', function(done) {
      var app = new function(){};
      app.render = sinon.stub().yieldsAsync(null, '<p>Hello</p>');
      
      var page = new Page();
      page.locals = { organization: 'Acme' };
      setPrototypeOf(page, Object.create(pagex, {
          app: { configurable: true, enumerable: true, writable: true, value: app }
        }));
        
      page.write = sinon.spy();
      page.end = function() {
        expect(page.app.render.getCall(0).args[0]).to.equal('index');
        expect(page.app.render.getCall(0).args[1]).to.deep.equal({
          name: 'Tobi',
          _locals: {
            organization: 'Acme'
          }
        });
        expect(page.write.getCall(0).args[0]).to.equal('<p>Hello</p>');
        done();
      };
      page.next = function() {
        done('Page#next should not be called');
      };
      
      page.render('index', { name: 'Tobi' });
    }); // should render layout with page locals and write page
    
    it('should render layout and next with error', function(done) {
      var app = new function(){};
      app.render = sinon.stub().yieldsAsync(new Error('something went wrong'));
      
      var page = new Page();
      setPrototypeOf(page, Object.create(pagex, {
          app: { configurable: true, enumerable: true, writable: true, value: app }
        }));
        
      page.write = sinon.spy();
      page.end = function() {
        done('Page#end should not be called');
      };
      page.next = function(err) {
        expect(page.app.render.getCall(0).args[0]).to.equal('index');
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal('something went wrong');
        done();
      };
      
      page.render('index');
    }); // should render layout and next with error
    
    it('should render layout and invoke callback', function(done) {
      var app = new function(){};
      app.render = sinon.stub().yieldsAsync(null, '<p>Hello</p>');
      
      var page = new Page();
      setPrototypeOf(page, Object.create(pagex, {
          app: { configurable: true, enumerable: true, writable: true, value: app }
        }));
      
      page.render('index', function(err, str) {
        if (err) { return done(err); }
        expect(str).to.equal('<p>Hello</p>');
        expect(page.app.render.getCall(0).args[0]).to.equal('index');
        expect(page.app.render.getCall(0).args[1]).to.deep.equal({
          _locals: undefined
        });
        done();
      });
    }); // should render layout and invoke callback
    
    it('should render layout with locals and invoke callback', function(done) {
      var app = new function(){};
      app.render = sinon.stub().yieldsAsync(null, '<p>Hello</p>');
      
      var page = new Page();
      setPrototypeOf(page, Object.create(pagex, {
          app: { configurable: true, enumerable: true, writable: true, value: app }
        }));
      
      page.render('user', { name: 'Tobi' }, function(err, str) {
        if (err) { return done(err); }
        expect(str).to.equal('<p>Hello</p>');
        expect(page.app.render.getCall(0).args[0]).to.equal('user');
        expect(page.app.render.getCall(0).args[1]).to.deep.equal({
          name: 'Tobi',
          _locals: undefined
        });
        done();
      });
    }); // should render layout with locals and invoke callback
    
    it('should render layout with page locals and invoke callback', function(done) {
      var app = new function(){};
      app.render = sinon.stub().yieldsAsync(null, '<p>Hello</p>');
      
      var page = new Page();
      page.locals = { organization: 'Acme' };
      setPrototypeOf(page, Object.create(pagex, {
          app: { configurable: true, enumerable: true, writable: true, value: app }
        }));
      
      page.render('user', { name: 'Tobi' }, function(err, str) {
        if (err) { return done(err); }
        expect(str).to.equal('<p>Hello</p>');
        expect(page.app.render.getCall(0).args[0]).to.equal('user');
        expect(page.app.render.getCall(0).args[1]).to.deep.equal({
          name: 'Tobi',
          _locals: {
            organization: 'Acme'
          }
        });
        done();
      });
    }); // should render layout with page locals and invoke callback
    
    it('should render layout and invoke callback with error', function(done) {
      var app = new function(){};
      app.render = sinon.stub().yieldsAsync(new Error('something went wrong'));
      
      var page = new Page();
      setPrototypeOf(page, Object.create(pagex, {
          app: { configurable: true, enumerable: true, writable: true, value: app }
        }));
      
      page.render('index', function(err, str) {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal('something went wrong');
        expect(page.app.render.getCall(0).args[0]).to.equal('index');
        done();
      });
    }); // should render layout and invoke callback with error
    
  }); // #render
  
  describe('#convert', function() {
    
    it('should convert markup to html by default and write page', function(done) {
      var app = new function(){};
      app.convert = sinon.stub().returns('<p>Hello</p>');
      
      var page = new Page();
      setPrototypeOf(page, Object.create(pagex, {
          app: { configurable: true, enumerable: true, writable: true, value: app }
        }));
        
      page.write = sinon.spy();
      page.end = function() {
        expect(page.app.convert.getCall(0).args[0]).to.equal('Hello');
        expect(page.app.convert.getCall(0).args[1]).to.equal('md');
        expect(page.app.convert.getCall(0).args[2]).to.equal('html');
        expect(page.app.convert.getCall(0).args[3]).to.deep.equal({});
        expect(page.write.getCall(0).args[0]).to.equal('<p>Hello</p>');
        done();
      };
      page.next = function() {
        done('Page#next should not be called');
      };
      
      page.convert('Hello', 'md');
    }); // should convert markup to html by default and write page
    
    it('should convert markup to html by default with options and write page', function(done) {
      var app = new function(){};
      app.convert = sinon.stub().returns('<p>Hello</p>');
      
      var page = new Page();
      setPrototypeOf(page, Object.create(pagex, {
          app: { configurable: true, enumerable: true, writable: true, value: app }
        }));
        
      page.write = sinon.spy();
      page.end = function() {
        expect(page.app.convert.getCall(0).args[0]).to.equal('Hello');
        expect(page.app.convert.getCall(0).args[1]).to.equal('md');
        expect(page.app.convert.getCall(0).args[2]).to.equal('html');
        expect(page.app.convert.getCall(0).args[3]).to.deep.equal({ pendantic: true });
        expect(page.write.getCall(0).args[0]).to.equal('<p>Hello</p>');
        done();
      };
      page.next = function() {
        done('Page#next should not be called');
      };
      
      page.convert('Hello', 'md', { pendantic: true });
    }); // should convert markup to html by default with options and write page
    
    it('should convert markup to type and write page', function(done) {
      var app = new function(){};
      app.convert = sinon.stub().returns('Hello');
      
      var page = new Page();
      setPrototypeOf(page, Object.create(pagex, {
          app: { configurable: true, enumerable: true, writable: true, value: app }
        }));
        
      page.write = sinon.spy();
      page.end = function() {
        expect(page.app.convert.getCall(0).args[0]).to.equal('Hello');
        expect(page.app.convert.getCall(0).args[1]).to.equal('md');
        expect(page.app.convert.getCall(0).args[2]).to.equal('txt');
        expect(page.app.convert.getCall(0).args[3]).to.deep.equal({});
        expect(page.write.getCall(0).args[0]).to.equal('Hello');
        done();
      };
      page.next = function() {
        done('Page#next should not be called');
      };
      
      page.convert('Hello', 'md', 'txt');
    }); // should convert markup to type and write page
    
    it('should convert markup to type with options and write page', function(done) {
      var app = new function(){};
      app.convert = sinon.stub().returns('Hello');
      
      var page = new Page();
      setPrototypeOf(page, Object.create(pagex, {
          app: { configurable: true, enumerable: true, writable: true, value: app }
        }));
        
      page.write = sinon.spy();
      page.end = function() {
        expect(page.app.convert.getCall(0).args[0]).to.equal('Hello');
        expect(page.app.convert.getCall(0).args[1]).to.equal('md');
        expect(page.app.convert.getCall(0).args[2]).to.equal('txt');
        expect(page.app.convert.getCall(0).args[3]).to.deep.equal({ pedantic: true });
        expect(page.write.getCall(0).args[0]).to.equal('Hello');
        done();
      };
      page.next = function() {
        done('Page#next should not be called');
      };
      
      page.convert('Hello', 'md', 'txt', { pedantic: true });
    }); // should convert markup to type with options and write page
    
    it('should convert markup to html by default and invoke callback', function(done) {
      var app = new function(){};
      app.convert = sinon.stub().returns('<p>Hello</p>');
      
      var page = new Page();
      setPrototypeOf(page, Object.create(pagex, {
          app: { configurable: true, enumerable: true, writable: true, value: app }
        }));
      
      page.convert('Hello', 'md', function(err, str) {
        if (err) { return done(err); }
        expect(str).to.equal('<p>Hello</p>');
        expect(page.app.convert.getCall(0).args[0]).to.equal('Hello');
        expect(page.app.convert.getCall(0).args[1]).to.equal('md');
        expect(page.app.convert.getCall(0).args[2]).to.equal('html');
        expect(page.app.convert.getCall(0).args[3]).to.deep.equal({});
        done();
      });
    }); // should convert markup to html by default and invoke callback
    
    it('should convert markup to html by default with options and invoke callback', function(done) {
      var app = new function(){};
      app.convert = sinon.stub().returns('<p>Hello</p>');
      
      var page = new Page();
      setPrototypeOf(page, Object.create(pagex, {
          app: { configurable: true, enumerable: true, writable: true, value: app }
        }));
      
      page.convert('Hello', 'md', { pedantic: true }, function(err, str) {
        if (err) { return done(err); }
        expect(str).to.equal('<p>Hello</p>');
        expect(page.app.convert.getCall(0).args[0]).to.equal('Hello');
        expect(page.app.convert.getCall(0).args[1]).to.equal('md');
        expect(page.app.convert.getCall(0).args[2]).to.equal('html');
        expect(page.app.convert.getCall(0).args[3]).to.deep.equal({ pedantic: true });
        done();
      });
    }); // should convert markup to html by default with options and invoke callback
    
    it('should convert markup to type and invoke callback', function(done) {
      var app = new function(){};
      app.convert = sinon.stub().returns('Hello');
      
      var page = new Page();
      setPrototypeOf(page, Object.create(pagex, {
          app: { configurable: true, enumerable: true, writable: true, value: app }
        }));
      
      page.convert('Hello', 'md', 'txt', function(err, str) {
        if (err) { return done(err); }
        expect(str).to.equal('Hello');
        expect(page.app.convert.getCall(0).args[0]).to.equal('Hello');
        expect(page.app.convert.getCall(0).args[1]).to.equal('md');
        expect(page.app.convert.getCall(0).args[2]).to.equal('txt');
        expect(page.app.convert.getCall(0).args[3]).to.deep.equal({});
        done();
      });
    }); // should convert markup to type and invoke callback
    
    it('should convert markup to type with options and invoke callback', function(done) {
      var app = new function(){};
      app.convert = sinon.stub().returns('Hello');
      
      var page = new Page();
      setPrototypeOf(page, Object.create(pagex, {
          app: { configurable: true, enumerable: true, writable: true, value: app }
        }));
      
      page.convert('Hello', 'md', 'txt', { pedantic: true }, function(err, str) {
        if (err) { return done(err); }
        expect(str).to.equal('Hello');
        expect(page.app.convert.getCall(0).args[0]).to.equal('Hello');
        expect(page.app.convert.getCall(0).args[1]).to.equal('md');
        expect(page.app.convert.getCall(0).args[2]).to.equal('txt');
        expect(page.app.convert.getCall(0).args[3]).to.deep.equal({ pedantic: true });
        done();
      });
    }); // should convert markup to type with options and invoke callback
    
  }); // #convert
  
  describe('#compile', function() {
    
    it('should convert markup, render layout and write page', function(done) {
      var app = new function(){};
      app.convert = sinon.stub().returns('<p>Hello</p>');
      app.render = sinon.stub().yieldsAsync(null, '<p>Hello</p>');
      
      var page = new Page();
      setPrototypeOf(page, Object.create(pagex, {
          app: { configurable: true, enumerable: true, writable: true, value: app }
        }));
        
      page.write = sinon.spy();
      page.end = function() {
        expect(page.app.convert.getCall(0).args[0]).to.equal('Hello');
        expect(page.app.convert.getCall(0).args[1]).to.equal('md');
        expect(page.app.render.getCall(0).args[0]).to.equal('index');
        expect(page.app.render.getCall(0).args[1]).to.deep.equal({
          content: '<p>Hello</p>',
          _locals: undefined
        });
        expect(page.write.getCall(0).args[0]).to.equal('<p>Hello</p>');
        done();
      };
      page.next = function() {
        done('Page#next should not be called');
      };
      
      page.compile('Hello', 'md', 'index');
    }); // should convert markup, render layout and write page
    
    it('should convert markup, render layout and write page with options', function(done) {
      var app = new function(){};
      app.convert = sinon.stub().returns('<p>Hello</p>');
      app.render = sinon.stub().yieldsAsync(null, '<p>Hello</p>');
      
      var page = new Page();
      setPrototypeOf(page, Object.create(pagex, {
          app: { configurable: true, enumerable: true, writable: true, value: app }
        }));
        
      page.write = sinon.spy();
      page.end = function() {
        expect(page.app.convert.getCall(0).args[0]).to.equal('Hello');
        expect(page.app.convert.getCall(0).args[1]).to.equal('md');
        expect(page.app.convert.getCall(0).args[2].pedantic).to.be.true;
        expect(page.app.render.getCall(0).args[0]).to.equal('index');
        expect(page.app.render.getCall(0).args[1]).to.deep.equal({
          content: '<p>Hello</p>',
          name: 'Tobi',
          _locals: undefined,
          pedantic: true
        });
        expect(page.write.getCall(0).args[0]).to.equal('<p>Hello</p>');
        done();
      };
      page.next = function() {
        done('Page#next should not be called');
      };
      
      page.compile('Hello', 'md', 'index', { name: 'Tobi', pedantic: true });
    }); // should convert markup, render layout and write page with options
    
    it('should convert markup, render layout and invoke callback', function(done) {
      var app = new function(){};
      app.convert = sinon.stub().returns('<p>Hello</p>');
      app.render = sinon.stub().yieldsAsync(null, '<p>Hello</p>');
      
      var page = new Page();
      setPrototypeOf(page, Object.create(pagex, {
          app: { configurable: true, enumerable: true, writable: true, value: app }
        }));
      
      page.compile('Hello', 'md', 'index', function(err, str) {
        if (err) { return done(err); }
        expect(str).to.equal('<p>Hello</p>');
        expect(page.app.convert.getCall(0).args[0]).to.equal('Hello');
        expect(page.app.convert.getCall(0).args[1]).to.equal('md');
        expect(page.app.render.getCall(0).args[0]).to.equal('index');
        expect(page.app.render.getCall(0).args[1]).to.deep.equal({
          content: '<p>Hello</p>',
          _locals: undefined
        });
        done();
      });
    }); // should convert markup, render layout and invoke callback
    
    it('should convert markup, render layout and invoke callback with options', function(done) {
      var app = new function(){};
      app.convert = sinon.stub().returns('<p>Hello</p>');
      app.render = sinon.stub().yieldsAsync(null, '<p>Hello</p>');
      
      var page = new Page();
      setPrototypeOf(page, Object.create(pagex, {
          app: { configurable: true, enumerable: true, writable: true, value: app }
        }));
      
      page.compile('Hello', 'md', 'index', { name: 'Tobi', pedantic: true }, function(err, str) {
        if (err) { return done(err); }
        expect(str).to.equal('<p>Hello</p>');
        expect(page.app.convert.getCall(0).args[0]).to.equal('Hello');
        expect(page.app.convert.getCall(0).args[1]).to.equal('md');
        expect(page.app.convert.getCall(0).args[2].pedantic).to.be.true;
        expect(page.app.render.getCall(0).args[0]).to.equal('index');
        expect(page.app.render.getCall(0).args[1]).to.deep.equal({
          content: '<p>Hello</p>',
          name: 'Tobi',
          _locals: undefined,
          pedantic: true
        });
        done();
      });
    }); // should convert markup, render layout and invoke callback with options
    
  }); // #compile
  
});
