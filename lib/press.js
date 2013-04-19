/**
 * Module dependencies.
 */
var Type = require('./route')
  , utils = require('./utils')
  , debug = require('debug')('kerouac');


/**
 * Initialize a new `Press`.
 *
 * `Press` is analagous to a `Router`.  The metaphor used is that of a
 * letterpress containing movable type.  Pages will be pressed (ie dispatched),
 * against a set of type (ie middleware functions) resulting in final printed
 * form (ie writing output).
 *
 * @api private
 */
function Press() {
  var self = this;
  this._types = [];
  this.middleware = function(page, next) {
    self._dispatch(page, next);
  };
}

/**
 * Typeset `path` to one or more callbacks.
 *
 * @param {String} path
 * @param {Function|Array} fns
 * @return {Type}
 * @api private
 */
Press.prototype.type = function(path, fns) {
  var fns = utils.flatten([].slice.call(arguments, 1));
  
  debug('defined %s', path);
  var type = new Type(path, fns);
  this._types.push(type);
  return type;
}

/**
 * Press dispatch, aka the press "middleware".
 *
 * @param {Page} page
 * @param {Function} next
 * @api private
 */
Press.prototype._dispatch = function(page, next) {
  var self = this;
  
  debug('dispatching %s %s', page.path);
  
  // type dispatch
  (function pass(i, err) {
    
    function nextType(err) {
      pass(page._type_index + 1, err);
    }
    
    // match type
    var type = self._match(page, i);
    
    // no type
    if (!type) { return next(err); }
    debug('matched %s', type.path);
    
    page.params = type.params;
    
    // invoke type callbacks
    var i = 0;
    function callbacks(err) {
      var fn = type.fns[i++];
      try {
        if ('type' == err) {
          nextType();
        } else if (err && fn) {
          if (fn.length < 3) { return callbacks(err); }
          debug('applying %s %s', page.path, fn.name || 'anonymous');
          fn(err, page, callbacks);
        } else if (fn) {
          if (fn.length < 3) {
            debug('applying %s %s', page.path, fn.name || 'anonymous');
            return fn(page, callbacks);
          }
          callbacks();
        } else {
          nextType(err);
        }
      } catch (err) {
        callbacks(err);
      }
    }
    callbacks();
  })(0);
}

/**
 * Attempt to match a type for `page`
 * with optional starting index of `i`
 * defaulting to 0.
 *
 * @param {Page} page
 * @param {Number} i
 * @return {Type}
 * @api private
 */
Press.prototype._match = function(page, i) {
  var path = page.path
    , types = this._types
    , i = i || 0
    , type;
  
  // matching types
  for (var len = types.length; i < len; ++i) {
    type = types[i];
    if (type.match(path)) {
      page._type_index = i;
      return type;
    }
  }
}


/**
 * Expose `Press`.
 */
module.exports = Press;
