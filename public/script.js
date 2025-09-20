let ws;
const messagesList = document.getElementById("messages");
const nameInput = document.getElementById("username");
const msgInput = document.getElementById("msg");
const joinBtn = document.getElementById("joinBtn");
const sendBtn = document.getElementById("sendBtn");
const loginScreen = document.getElementById("login");
const chatScreen = document.getElementById("chat");
const errorP = document.getElementById("error");

let username;

joinBtn.onclick = () => {
  if (!nameInput.value.trim()) {
    errorP.textContent = "Enter a username first!";
    return;
  }
  errorP.textContent = "";
  username = nameInput.value.trim();
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  ws = new WebSocket(`${protocol}//${location.host}`);

  ws.onopen = () => {
    ws.send(JSON.stringify({ type: "setName", name: username }));
    nameInput.disabled = true;
    joinBtn.disabled = true;
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.system && data.error) {
      errorP.textContent = data.error;
      nameInput.disabled = false;
      joinBtn.disabled = false;
      ws = null;
      return;
    }

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let text = data.system ? `[System] ${data.message}` : `${data.from}: ${data.message}`;
    
    const li = document.createElement("li");
    const messageSpan = document.createElement("span");
    messageSpan.classList.add("message-text");
    messageSpan.textContent = data.system ? data.message : `${data.from}: ${data.message}`;
    
    const timeSpan = document.createElement("span");
    timeSpan.classList.add("message-time");
    timeSpan.textContent = now;
    
    li.appendChild(messageSpan);
    li.appendChild(timeSpan);
    
    if (data.system) li.classList.add("system");
    messagesList.appendChild(li);
    messagesList.scrollTop = messagesList.scrollHeight;

    if (!loginScreen.classList.contains("hidden") && data.system && data.message === `${username} joined the chat`) {
      loginScreen.classList.add("hidden");
      chatScreen.classList.remove("hidden");
      msgInput.disabled = false;
      sendBtn.disabled = false;
    }
  };

  ws.onclose = () => {
    if (!loginScreen.classList.contains("hidden")) {
      errorP.textContent = "Connection closed. Please try again.";
    } else {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const li = document.createElement("li");
      const messageSpan = document.createElement("span");
      messageSpan.classList.add("message-text");
      messageSpan.textContent = "[System] Disconnected from chat.";
      const timeSpan = document.createElement("span");
      timeSpan.classList.add("message-time");
      timeSpan.textContent = now;
      li.appendChild(messageSpan);
      li.appendChild(timeSpan);
      li.classList.add("system");
      messagesList.appendChild(li);
      messagesList.scrollTop = messagesList.scrollHeight;
      msgInput.disabled = true;
      sendBtn.disabled = true;
    }
  };
};

sendBtn.onclick = () => {
  if (msgInput.value.trim() && ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "chat", message: msgInput.value.trim() }));
    msgInput.value = "";
  }
};

msgInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendBtn.onclick();
});