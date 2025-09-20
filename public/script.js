// Connect with secure WebSocket if hosted on https, otherwise ws
const protocol = location.protocol === "https:" ? "wss:" : "ws:";
const ws = new WebSocket(`${protocol}//${location.host}`);

let username = null;

document.getElementById("joinBtn").onclick = () => {
  const nameInput = document.getElementById("username");
  const error = document.getElementById("error");
  if (!nameInput.value.trim()) {
    error.textContent = "Please enter a username.";
    return;
  }
  username = nameInput.value.trim();
  ws.send(JSON.stringify({ type: "setName", name: username }));

  // switch screens
  document.getElementById("login").classList.add("hidden");
  document.getElementById("chat").classList.remove("hidden");
};

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  const messagesList = document.getElementById("messages");

  let text;
  if (msg.system) {
    text = `[System] ${msg.message || msg.error}`;
  } else {
    text = `${msg.from}: ${msg.message}`;
  }

  const li = document.createElement("li");
  li.textContent = text;
  messagesList.appendChild(li);
  messagesList.scrollTop = messagesList.scrollHeight;
};

document.getElementById("sendBtn").onclick = () => {
  const input = document.getElementById("msg");
  const message = input.value.trim();
  if (message) {
    ws.send(JSON.stringify({ type: "chat", message }));
    input.value = "";
  }
};
