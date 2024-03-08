function Renderer(options) {
  this.options = options || {};
}

Renderer.prototype.code = function(code, lang, escaped) {
}

Renderer.prototype.blockquote = function(quote) {
}

Renderer.prototype.html = function(html) {
}

Renderer.prototype.heading = function(text, level, raw) {
  if (level == 1) { return text; }
}

Renderer.prototype.hr = function() {
}

Renderer.prototype.list = function(list, ordered) {
}

Renderer.prototype.listitem = function(item) {
}

Renderer.prototype.paragraph = function(text) {
  // TODO: make a custom parser that wil render "space" tokens by adding a new line
  return text + '\n';
}

Renderer.prototype.table = function(header, body) {
}

Renderer.prototype.tablerow = function(content) {
}

Renderer.prototype.tablecell = function(content, flags) {
}

Renderer.prototype.strong = function(text) {
}

Renderer.prototype.em = function(text) {
}

Renderer.prototype.codespan = function(text) {
}

Renderer.prototype.br = function() {
}

Renderer.prototype.del = function(text) {
}

Renderer.prototype.link = function(href, title, text) {
}

Renderer.prototype.image = function(href, title, text) {
}

Renderer.prototype.text = function(text) {
  return text;
}


module.exports = Renderer;
