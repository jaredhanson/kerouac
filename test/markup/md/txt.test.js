var convert = require('../../../lib/markup/md/txt')


describe('markup/md/txt', function() {
  
  it('should convert paragraph to text', function(done) {
    convert('Beep.', function(err, txt) {
      if (err) { return done(err); }
      expect(txt).to.equal('Beep.\n');
      done();
    });
  });
  
  it('should convert paragraph to text', function(done) {
    convert('Beep.\n\nBeep boop.', function(err, txt) {
      if (err) { return done(err); }
      expect(txt).to.equal('Beep.\nBeep boop.\n');
      done();
    });
  });
  
});