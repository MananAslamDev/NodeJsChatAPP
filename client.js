// client.js
const WebSocket = require('ws');
const readline = require('readline');

const server = process.argv[2] || 'ws://localhost:8080';
const name = process.argv[3] || 'NodeUser';

const ws = new WebSocket(server);

ws.on('open', () => {
  console.log('Connected to', server);
  ws.send(JSON.stringify({ type: 'setName', name }));

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.setPrompt('');
  rl.on('line', line => {
    ws.send(JSON.stringify({ message: line.trim() }));
  });
});

ws.on('message', m => {
  try { m = JSON.parse(m); } catch(e){}
  console.log((m.system ? '(system) ' : `${m.from}: `) + (m.message || m));
});
