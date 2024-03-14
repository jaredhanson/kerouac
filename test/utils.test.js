var sinon = require('sinon');
var utils = require('../lib/utils');


describe('utils', function() {
  
  describe('.encloseOptions', function() {
    
    it('should merge enclosed options with first argument', function() {
      var fn = sinon.spy();
      var efn = utils.encloseOptions(fn, { foo: 'bar' });
      efn({ baz: 'qux' });
      
      expect(fn).to.have.been.calledOnce;
      expect(fn.getCall(0).args[0]).to.deep.equal({ foo: 'bar', baz: 'qux' });
    }); // should merge enclosed options with first argument
    
    it('should merge enclosed options with second argument', function() {
      var fn = sinon.spy();
      var efn = utils.encloseOptions(fn, { foo: 'bar' });
      efn('beep', { baz: 'qux' });
      
      expect(fn).to.have.been.calledOnce;
      expect(fn.getCall(0).args[0]).to.equal('beep');
      expect(fn.getCall(0).args[1]).to.deep.equal({ foo: 'bar', baz: 'qux' });
    }); // should merge enclosed options with second argument
    
    it('should merge enclosed options with third argument', function() {
      var fn = sinon.spy();
      var efn = utils.encloseOptions(fn, { foo: 'bar' });
      efn('beep', 'boop', { baz: 'qux' });
      
      expect(fn).to.have.been.calledOnce;
      expect(fn.getCall(0).args[0]).to.equal('beep');
      expect(fn.getCall(0).args[1]).to.equal('boop');
      expect(fn.getCall(0).args[2]).to.deep.equal({ foo: 'bar', baz: 'qux' });
    }); // should merge enclosed options with third argument
    
    it('should append enclosed options as first argument', function() {
      var fn = sinon.spy();
      var efn = utils.encloseOptions(fn, { foo: 'bar' });
      efn();
      
      expect(fn).to.have.been.calledOnce;
      expect(fn.getCall(0).args[0]).to.deep.equal({ foo: 'bar' });
    }); // should append enclosed options as first argument
    
    it('should append enclosed options as second argument', function() {
      var fn = sinon.spy();
      var efn = utils.encloseOptions(fn, { foo: 'bar' });
      efn('beep');
      
      expect(fn).to.have.been.calledOnce;
      expect(fn.getCall(0).args[0]).to.equal('beep');
      expect(fn.getCall(0).args[1]).to.deep.equal({ foo: 'bar' });
    }); // should append enclosed options as second argument
    
    it('should append enclosed options as third argument', function() {
      var fn = sinon.spy();
      var efn = utils.encloseOptions(fn, { foo: 'bar' });
      efn('beep', 'boop');
      
      expect(fn).to.have.been.calledOnce;
      expect(fn.getCall(0).args[0]).to.equal('beep');
      expect(fn.getCall(0).args[1]).to.equal('boop');
      expect(fn.getCall(0).args[2]).to.deep.equal({ foo: 'bar' });
    }); // should append enclosed options as third argument
    
  });
  
});
