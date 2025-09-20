let ws;
let username;

document.getElementById('joinBtn').onclick = () => {
  username = document.getElementById('username').value.trim();
  if (!username) return;

  ws = new WebSocket(`ws://${location.host}`);
  
  ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'setName', name: username }));
    document.getElementById('login').classList.add('hidden');
    document.getElementById('chat').classList.remove('hidden');
  };

  ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    const li = document.createElement('li');

    if (data.system) {
      li.classList.add('system');
      li.textContent = data.message || data.error;
      if (data.error) {
        document.getElementById('error').textContent = data.error;
        ws.close();
        document.getElementById('login').classList.remove('hidden');
        document.getElementById('chat').classList.add('hidden');
      }
    } else {
      li.classList.add(data.from === username ? 'self' : 'other');
      li.textContent = `${data.from}: ${data.message}`;
    }

    document.getElementById('messages').appendChild(li);
    li.scrollIntoView();
  };

  ws.onclose = () => {
    const li = document.createElement('li');
    li.classList.add('system');
    li.textContent = "Disconnected from server.";
    document.getElementById('messages').appendChild(li);
  };
};

document.getElementById('sendBtn').onclick = sendMessage;
document.getElementById('msg').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
  const input = document.getElementById('msg');
  const text = input.value.trim();
  if (text && ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'chat', message: text }));
    input.value = '';
  }
}
