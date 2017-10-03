/**
 * Initialize a new `Queue`.
 *
 * A queue contains a list of paths that need to be generated.
 *
 * @api private
 */
function Queue(site, path, queue) {
  this._parent = queue;
  this._site = site;
  this._path = path || '';
  this._q = [];
}

/**
 * Add `path` to queue.
 *
 * @param {String} path
 * @api public
 */
Queue.prototype.add = function(path) {
  if (this._parent) {
    this._parent.add(this._path + path);
    return this;
  }
  
  if ('/' != path[0]) {
    path = '/' + path;
  }
  
  this._q.push({ path: path });
  return this;
}


/**
 * Expose `Queue`.
 */
module.exports = Queue;
