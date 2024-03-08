var marked = require('marked')
  , util = require('util');


function Parser(options) {
  marked.Parser.call(this, options);
}
util.inherits(Parser, marked.Parser);

Parser.prototype.parse = function(src) {
  this.inline = new marked.InlineLexer(src.links, this.options);
  // use an InlineLexer with a TextRenderer to extract pure text
  this.inlineText = new marked.InlineLexer(
    src.links,
    merge({}, this.options, {renderer: new marked.TextRenderer()})
  );
  this.tokens = src.reverse();

  var out;
  while (this.next()) {
    out = this.tok();
    if (out) { return out; }
  }
  return;
};

Parser.prototype.tok = function() {
  switch (this.token.type) {
    case 'paragraph': {
      return this.renderer.paragraph(this.inline.output(this.token.text));
    }
  }
  
  marked.Parser.prototype.tok.call(this);
  return null;
};


module.exports = Parser;


function merge(obj) {
  var i = 1,
      target,
      key;

  for (; i < arguments.length; i++) {
    target = arguments[i];
    for (key in target) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        obj[key] = target[key];
      }
    }
  }

  return obj;
}
