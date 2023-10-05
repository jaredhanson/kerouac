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
          _locals: undefined
        });
        expect(page.write.getCall(0).args[0]).to.equal('<p>Hello</p>');
        done();
      };
      page.next = function() {
        done('Page#next should not be called');
      };
      
      page.render('index');
    }); // should render layout with locals and write page
    
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
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal('something went wrong');
        done();
      };
      
      page.render('index', { name: 'Tobi' });
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
    
  }); // #render
  
});
