const cluster = require('cluster');

if (cluster.isMaster) {
  // get CPUs
  const numCPUs = require('os').cpus().length;
  // place a worker on each CPU
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
  // start server
  app.listen(port, ip, () => {
    console.log('Listening on http://' + ip + ':' + port);
    console.log('Worker %d running!', cluster.worker.id);
  });
  // create Header to prevent CORS
  app.use((req, res, next) => {
    res.header('access-control-allow-origin', '*');
    res.header('access-control-allow-methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('access-control-allow-headers', 'content-type, accept');
    res.header('access-control-max-age', 10);
    next();
  });
  // handle root request -> sending index.html and answer all following requests from it
  app.use(express.static(path.join(__dirname, '../client/client')));
  // handle get request on API
  app.get('/classes/messages', (req, res) => {
    if (req.query !== undefined) {
      //read and prepare file for sending
      fs.readFile(path.join(__dirname, '/messages.json'), (err, data) => {

        var messages = JSON.parse(data);
 
        messages.results.sort((a, b) => {
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
    } else {
      res.sendFile(path.join(__dirname, '/messages.json'));
    }
  });

  app.post('/classes/messages', (req, res) => {

    var newMessage;
    // when receiving data start saving it and adding a timestamp
    req.on('data', data => { 
      newMessage = JSON.parse(data);
      d = new Date();
      newMessage.createdAt = d.toISOString();
    });
    // when data stream has ended -> read, update, write, end
    req.on('end', () => {
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