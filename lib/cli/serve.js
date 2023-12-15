var http = require('http');
var finalhandler = require('finalhandler');
var serveStatic = require('serve-static');


exports = module.exports = function serve(argv) {
  console.log('serving...');
  console.log(argv);
  
  var serve = serveStatic('dist')
  
  var server = http.createServer(function (req, res) {
    serve(req, res, finalhandler(req, res));
  });
  server.listen(3000);
};
