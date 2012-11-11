/**
 * Initialize a new `Type` with the given `path`, an array of callback `fns`
 * and `options`.
 *
 * Options:
 *
 *   - `sensitive`  enable case-sensitive routes
 *   - `strict`     enable strict matching for trailing slashes
 *
 * `Type` is analagous to a `Route`.  The metaphor used is that of a letterpress
 * containing movable type.  Pages will be pressed (ie dispatched), against a
 * set of type (ie middleware functions) resulting in final printed form (ie
 * writing output).
 *
 * @param {String} path
 * @param {Array} fns
 * @param {Object} options
 * @api private
 */
function Type(path, fns, options) {
  options = options || {};
  this.path = path;
  this.fns = fns;
  this.regexp = normalize(path
    , this.keys = []
    , options.sensitive
    , options.strict);
}

/**
 * Test if type is fully set.
 *
 * A fully set type is that which is not parameterized.  As such it declares
 * a complete path of a page included in the site.
 *
 * @return {Boolean}
 * @api private
 */
Type.prototype.isSet = function() {
  return this.keys.length == 0;
}

/**
 * Check if this type matches `path`, if so populate `.params`.
 *
 * @param {String} path
 * @return {Boolean}
 * @api private
 */
Type.prototype.match = function(path) {
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
 * Normalize the given path string,
 * returning a regular expression.
 *
 * An empty array should be passed,
 * which will contain the placeholder
 * key names. For example "/user/:id" will
 * then contain ["id"].
 *
 * @param  {String|RegExp|Array} path
 * @param  {Array} keys
 * @param  {Boolean} sensitive
 * @param  {Boolean} strict
 * @return {RegExp}
 * @api private
 */

function normalize(path, keys, sensitive, strict) {
  if (path instanceof RegExp) return path;
  if (Array.isArray(path)) path = '(' + path.join('|') + ')';
  path = path
    .concat(strict ? '' : '/?')
    .replace(/\/\(/g, '(?:/')
    .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?(\*)?/g, function(_, slash, format, key, capture, optional, star){
      keys.push({ name: key, optional: !! optional });
      slash = slash || '';
      return ''
        + (optional ? '' : slash)
        + '(?:'
        + (optional ? slash : '')
        + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')'
        + (optional || '')
        + (star ? '(/*)?' : '');
    })
    .replace(/([\/.])/g, '\\$1')
    .replace(/\*/g, '(.*)');
  return new RegExp('^' + path + '$', sensitive ? '' : 'i');
}


/**
 * Expose `Type`.
 */
module.exports = Type;
