/**
 * Module dependencies.
 */
var Page = require('./page');


/**
 * Initialize a new `Site`.
 *
 * A site is simply a collection of pages, keyed by path.  This collection
 * defines the set of files that will be output during the process of generating
 * the static site.
 *
 * @api private
 */
function Site() {
}

/**
 * Add a new page with given `path`.
 *
 * @param {String} path
 * @api private
 */
Site.prototype.add = function(path) {
  this[path] = this[path] || new Page(path);
}


/**
 * Expose `Site`.
 */
module.exports = Site;
