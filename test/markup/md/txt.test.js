var convert = require('../../../lib/markup/md/txt')


describe('markup/md/txt', function() {
  
  it('should convert paragraph to text', function() {
    var txt = convert('Beep.', function(){});
    expect(txt).to.equal('Beep.\n');
  });
  
  it('should convert paragraph to text', function() {
    var txt = convert('Beep.\n\nBeep boop.', function(){});
    expect(txt).to.equal('Beep.\nBeep boop.\n');
  });
  
});
