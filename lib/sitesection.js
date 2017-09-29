function SiteSection(path, site) {
  this._path = path || '';
  this._site = site;
}

/**
 * Add a new page with given `path`.
 *
 * @param {String} path
 * @api private
 */
SiteSection.prototype.add = function(path) {
  var qpath = this._path + path;
  this._site.add(qpath);
}


/**
 * Expose `SiteSection`.
 */
module.exports = SiteSection;
