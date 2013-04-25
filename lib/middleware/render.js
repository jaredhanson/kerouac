/**
 * Rendering middleware.
 *
 * This middleware renders a page using the default options.  Typically, this
 * is used as the final middleware in a stack that loads content and options
 * from an external source (such as lightweight markup and front matter, as
 * loaded by `loadContent` middleware).
 *
 * Examples:
 *
 *     site.page('/hello', loadContent('hello.md')
 *                       , render());
 *
 * @return {Function}
 * @api public
 */
module.exports = function() {
  
  return function render(page, next) {
    page.render();
  }
}
