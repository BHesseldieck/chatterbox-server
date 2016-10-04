const cluster = require('cluster');

if (cluster.isMaster) {
  const numCPUs = require('os').cpus().length;
  
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  const express = require('express');
  const path = require('path');
  const fs = require('fs');
  const app = express();
  
  const port = 3000;
  const ip = '127.0.0.1';
  
  app.listen(port, ip, function() {
    console.log('Listening on http://' + ip + ':' + port);
    console.log('Worker %d running!', cluster.worker.id);
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
          // newest message last
          return new Date(a.createdAt) - new Date(b.createdAt);
        } else if (req.query.order === '+createdAt') {
          // newest message first
          return new Date(b.createdAt) - new Date(a.createdAt);
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
          res.status(201).end();
        });
      });
    });
  });
}