// server.js
const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


// Simple HTTP server to serve frontend files
const server = http.createServer((req, res) => {
  let filePath = path.join(
    __dirname,
    'public',
    req.url === '/' ? 'index.html' : req.url
  );

  const ext = path.extname(filePath);
  const contentType = ext === '.css' ? 'text/css' :
                      ext === '.js'  ? 'application/javascript' : 'text/html';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end('Not found');
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

const wss = new WebSocket.Server({ server });

const clients = new Map(); // username → ws

wss.on('connection', (ws) => {
  let username = null;

  ws.on('message', (raw) => {
    let data;
    try { data = JSON.parse(raw); } catch { return; }

    // Handle setting username
    if (data.type === 'setName') {
      if (clients.has(data.name)) {
        ws.send(JSON.stringify({ system: true, error: 'Username already taken!' }));
        ws.close();
        return;
      }
      username = data.name;
      clients.set(username, ws);

      broadcast({ system: true, message: `${username} joined the chat` });
      return;
    }

    // Handle normal messages
    if (data.type === 'chat' && username) {
      broadcast({ from: username, message: data.message });
    }
  });

  ws.on('close', () => {
    if (username) {
      clients.delete(username);
      broadcast({ system: true, message: `${username} left the chat` });
    }
  });
});

function broadcast(payload) {
  const msg = JSON.stringify(payload);
  for (let client of clients.values()) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  }
}

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
