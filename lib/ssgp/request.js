// Module dependencies.
var events = require('events')
  , util = require('util');

/**
 * This class is used to create a static page request.
 *
 * @classdesc This object is created internally and returned from
 * `Client#request()`.
 *
 * @class
 * @param {string} path
 */
function Request(path) {
  events.EventEmitter.call(this);
  this.path = path;
}

// Inherit from `events.EventEmitter`.
util.inherits(Request, events.EventEmitter);

// Export `Request`.
module.exports = Request;
