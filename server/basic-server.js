var express = require('express');
var path = require('path');
var fs = require('fs');
var app = express();

var port = 3000;
var ip = '127.0.0.1';

app.listen(port, ip, function() {
  console.log('Listening on http://' + ip + ':' + port);
});

app.use(function(req, res, next) {
  res.header('access-control-allow-origin', '*');
  res.header('access-control-allow-methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('access-control-allow-headers', 'content-type, accept');
  res.header('access-control-max-age', 10);
  next();
});

app.get('/', function(req, res) {
  res.status(200).sendFile(path.join(__dirname, '../client/client/index.html'));
});

app.get('/classes/messages', function(req, res) {
  res.status(200).sendFile(path.join(__dirname, '/messages.json'));
});

app.post('/classes/messages', function(req, res) {
  req.on('data', data => { 
    var newMessage = JSON.parse(data);
    // TODO: chain read and write with next
    fs.readFile(path.join(__dirname, '/messages.json'), (err, data) => {
      var messages = JSON.parse(data);
      messages.results.unshift(newMessage);

      fs.writeFile(path.join(__dirname, '/messages.json'), JSON.stringify(messages), () => {
        res.status(201).end();
      });
    });
  });
});