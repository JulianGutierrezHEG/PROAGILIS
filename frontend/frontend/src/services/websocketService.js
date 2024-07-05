import EventBus from './eventBus';

const sockets = {};

const connectGroup = (groupId) => {
  if (!groupId) return;
  if (sockets[groupId]) {
    console.log(`WebSocket already connected for group: ${groupId}`);
    return;
  }
  console.log(`Connecting to WebSocket for group: ${groupId}`);
  const socket = new WebSocket(`ws://localhost:8000/ws/group/${groupId}/`);

  socket.onopen = () => {
    console.log(`WebSocket connection established for group: ${groupId}`);
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log(`WebSocket message received for group: ${groupId}`, data);
    EventBus.emit(data.event, data);
  };

  socket.onclose = () => {
    console.log(`WebSocket connection closed for group: ${groupId}`);
    delete sockets[groupId];
  };

  socket.onerror = (error) => {
    console.error(`WebSocket error for group: ${groupId}`, error);
  };

  sockets[groupId] = socket;
};

const disconnectGroup = (groupId) => {
  if (sockets[groupId]) {
    console.log(`Disconnecting WebSocket for group: ${groupId}`);
    sockets[groupId].close();
    delete sockets[groupId];
  }
};

const connectSessionStatus = (sessionId) => {
  if (!sessionId) return;
  if (sockets[sessionId]) {
    console.log(`WebSocket already connected for session: ${sessionId}`);
    return;
  }
  console.log(`Connecting to WebSocket for session: ${sessionId}`);
  const socket = new WebSocket(`ws://localhost:8000/ws/session/${sessionId}/`);

  socket.onopen = () => {
    console.log(`WebSocket connection established for session: ${sessionId}`);
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log(`WebSocket message received for session: ${sessionId}`, data);
    EventBus.emit(data.event, data);
  };

  socket.onclose = () => {
    console.log(`WebSocket connection closed for session: ${sessionId}`);
    delete sockets[sessionId];
  };

  socket.onerror = (error) => {
    console.error(`WebSocket error for session: ${sessionId}`, error);
  };

  sockets[sessionId] = socket;
};

const disconnectSession = (sessionId) => {
  if (sockets[sessionId]) {
    console.log(`Disconnecting WebSocket for session: ${sessionId}`);
    sockets[sessionId].close();
    delete sockets[sessionId];
  }
};

const sendMessage = (id, message) => {
  if (sockets[id] && sockets[id].readyState === WebSocket.OPEN) {
    console.log(`Sending WebSocket message to ID: ${id}`, message);
    sockets[id].send(JSON.stringify(message));
  } else {
    console.error(`WebSocket is not connected for ID: ${id}`);
  }
};

const isConnected = (id) => {
  return !!sockets[id];
};

export default {
  connectGroup,
  disconnectGroup,
  connectSessionStatus,
  disconnectSession,
  sendMessage,
  isConnected,
};
