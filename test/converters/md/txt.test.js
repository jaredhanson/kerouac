var convert = require('../../../lib/converters/md/txt')


describe('converters/md/txt', function() {
  
  it('should convert paragraph to text', function(done) {
    convert('How are you?', function(err, txt) {
      if (err) { return done(err); }
      expect(txt).to.equal('How are you?\n');
      done();
    });
  });
  
  it('should convert paragraph to text', function(done) {
    convert('How are you?\n\nI am fine.', function(err, txt) {
      if (err) { return done(err); }
      expect(txt).to.equal('How are you?\nI am fine.\n');
      done();
    });
  });
  
});
