// client.js (updated Node.js CLI client, for testing)
const WebSocket = require('ws');
const readline = require('readline');

const server = process.argv[2] || 'ws://localhost:8080';
const name = process.argv[3] || 'NodeUser';

const ws = new WebSocket(server);

ws.on('open', () => {
  console.log('Connected to', server);
  ws.send(JSON.stringify({ type: 'setName', name }));
});

ws.on('message', (m) => {
  let data;
  try { data = JSON.parse(m); } catch (e) { return; }
  if (data.system && data.error) {
    console.log(`Error: ${data.error}`);
    process.exit(1);
  }
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  let text = data.system ? '(system) ' + data.message : `${data.from}: ${data.message}`;
  console.log(`${now} ${text}`);
});

ws.on('close', () => {
  console.log('Disconnected from server.');
  process.exit(0);
});

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.on('line', (line) => {
  if (line.trim()) {
    ws.send(JSON.stringify({ type: 'chat', message: line.trim() }));
  }
});