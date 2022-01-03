var Server = require('./server');

exports.createServer = function(requestListener) {
  var server = new Server();
  if (requestListener) { server.on('request', requestListener); }
  return server;
};
