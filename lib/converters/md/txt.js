var marked = require('marked');
var TextRenderer = require('./txt/renderer');


module.exports = function md2txt(str, options, fn) {
  if ('function' == typeof options) {
    fn = options, options = {};
  }
  
  
  //options.renderer = new marked.TextRenderer();
  options.renderer = new TextRenderer();
  
  /*
  var y = marked.Lexer.lex(str, options);
  console.log(y);
  */
  
  /*
  var x = marked.Parser.parse(marked.Lexer.lex(str, options), options);
  console.log(x);
  */
  
  var txt = marked.parse(str, options);
  //var tokens = marked.lexer(str);
  
  fn(null, txt);
};
