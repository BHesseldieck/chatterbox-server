/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/

const fs = require('fs');

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

var requestHandler = function(request, response) {
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  // console.log('Serving request type ' + request.method + ' for url ' + request.url);
  var path = request.url.split('?')[0];
  var query = request.url.split('?')[1];

  var statusCode = 404;
  var headers = defaultCorsHeaders;
  headers['Content-Type'] = 'application/json';
  var answer = '';

  if (request.method === 'GET' && path === '/classes/messages') {
    fs.readFile('./messages.json', (err, data) => {
      if (err) { throw err; } else {
        answer = JSON.stringify(JSON.parse(data));
        statusCode = 200;
        response.writeHead(statusCode, headers); 
        response.end(answer);
      }
    });
  } else if (request.method === 'GET' && path.length <= 1) {
    fs.readFile('../client/client/index.html', (err, data) => {
      response.writeHead(200, {'Content-Type': 'text/html', 'Content-Length': data.length});
      response.write(data);
      response.end();
    });
  } else if (request.method === 'POST' && path === '/classes/messages') {
    request.on('data', function(data) {
      var message = JSON.parse(data);
      fs.readFile('./messages.json', (err, data) => {
        if (err) { throw err; } else {
          var messages = JSON.parse(data);
          messages.results.unshift(message);
          fs.writeFile('./messages.json', JSON.stringify(messages), err => {
            if (err) { throw err; } else {
              statusCode = 201;
              response.writeHead(statusCode, headers); 
              response.end(answer);
            }
          });
        }
      });
    });
  } else if (request.method === 'OPTIONS') {
    statusCode = 200;
    response.writeHead(statusCode, headers); 
    response.end(answer);   
  } else {
    response.writeHead(statusCode, headers); 
    response.end(answer);
  }
};

exports.requestHandler = requestHandler;