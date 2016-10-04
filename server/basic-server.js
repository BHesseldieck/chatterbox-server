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

app.use(express.static(path.join(__dirname, '../client/client')));

app.get('/classes/messages', function(req, res) {
  fs.readFile(path.join(__dirname, '/messages.json'), (err, data) => {
    var messages = JSON.parse(data);
    messages.results.sort(function(a, b) {
      if (req.query.order === '-createdAt') {
        return new Date(b.createdAt) - new Date(a.createdAt); // newest message last
      } else {
        return new Date(a.createdAt) - new Date(b.createdAt); // newest message first
      }
    });
    res.json(messages);
  });
});

app.post('/classes/messages', function(req, res) {
  req.on('data', data => { 
    var newMessage = JSON.parse(data);
    d = new Date();
    newMessage.createdAt = d.toISOString();
    fs.readFile(path.join(__dirname, '/messages.json'), (err, data) => {
      var messages = JSON.parse(data);
      messages.results.unshift(newMessage);
      fs.writeFile(path.join(__dirname, '/messages.json'), JSON.stringify(messages), () => {
        res.end();
      });
    });
  });
});