var pathRegexp = require('path-to-regexp');


/**
 * Initialize a new `Route` with the given `path`, an array of callback `fns`,
 * and `options`.
 *
 * Options:
 *
 *   - `sensitive`  enable case-sensitive routes
 *   - `strict`     enable strict matching for trailing slashes
 *
 * @param {String} path
 * @param {Array} fns
 * @param {Object} options
 * @api private
 */
function Route(path, fns, options) {
  options = options || {};
  this.path = path;
  this.fns = fns;
  this.regexp = pathRegexp(path, this.keys = [], options);
}

/**
 * Test if path is whole.
 *
 * A whole path is one which is not parameterized and, as such, declares the
 * full and complete path of a page to be generated for inclusion in the site.
 *
 * In contrast, a non-whole path is parameterized.  These parameters are
 * typically used by middleware to pre-process a set of similar pages in some
 * way.
 *
 * @return {Boolean}
 * @api protected
 */
Route.prototype.isWholePath = function() {
  return this.keys.length == 0;
}

/**
 * Check if this type matches `path`, if so populate `.params`.
 *
 * @param {String} path
 * @return {Boolean}
 * @api protected
 */
Route.prototype.match = function(path) {
  var keys = this.keys
    , params = this.params = []
    , m = this.regexp.exec(path);

  if (!m) return false;

  for (var i = 1, len = m.length; i < len; ++i) {
    var key = keys[i - 1];
    var val = m[i];

    if (key) {
      params[key.name] = val;
    } else {
      params.push(val);
    }
  }

  return true;
}


/**
 * Expose `Route`.
 */
module.exports = Route;
