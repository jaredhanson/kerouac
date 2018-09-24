/**
 * Initialize a new `Queue`.
 *
 * A queue contains a list of paths that need to be generated.
 *
 * @api private
 */
function Queue(site, q) {
  this._site = site;
  this._q = q;
}

/**
 * Add `path` to queue.
 *
 * @param {String} path
 * @api public
 */
Queue.prototype.add = function(path, ctx) {
  this._q.push({ site: this._site, path: path, context: ctx });
  return this;
}


/**
 * Expose `Queue`.
 */
module.exports = Queue;
