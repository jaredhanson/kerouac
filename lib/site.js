/**
 * Module dependencies.
 */
var Page = require('./page');


/**
 * Initialize a new `Site`.
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
