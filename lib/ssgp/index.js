var Server = require('./server');

/**
 * Returns a new instance of `ssgp.Server`.
 *
 * The `requestListener` is a function which is automatically added to the
 * `'request'` event.
 *
 * @public
 */
exports.createServer = function(requestListener) {
  var server = new Server();
  if (requestListener) { server.on('request', requestListener); }
  return server;
};
