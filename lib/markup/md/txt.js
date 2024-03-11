var marked = require('marked');
var TextRenderer = require('./txt/renderer');
var ExcerptParser = require('./excerptparser');


module.exports = function md2txt(str, options) {
  options = options || {};
  
  if (options.excerpt) {
    var tokens = marked.lexer(str);
    var renderer = new TextRenderer();
    var parser = new ExcerptParser({ renderer: renderer });
    var out = parser.parse(tokens);
    
    return out;
  }
  
  
  
  //options.renderer = new marked.TextRenderer();
  options.renderer = new TextRenderer();
  
  
  var y = marked.Lexer.lex(str, options);
  console.log(y);
  
  
  /*
  var x = marked.Parser.parse(marked.Lexer.lex(str, options), options);
  console.log(x);
  */
  
  var txt = marked.parse(str, options);
  //var tokens = marked.lexer(str);
  return txt;
};
