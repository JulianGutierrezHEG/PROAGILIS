import EventBus from './eventBus';

const sockets = {};

// Connecte un WebSocket en utilisant un identifiant et un type spécifiques.
const connectWebSocket = (id, type) => {
  if (!id) return;
  if (sockets[id]) {
    console.log(`WebSocket déjà connecté pour ${type} : ${id}`);
    return;
  }
  console.log(`Connexion au WebSocket pour ${type} : ${id}`);
  const socket = new WebSocket(`ws://localhost:8000/ws/${type}/${id}/`);

  socket.onopen = () => console.log(`Connexion WebSocket établie pour ${type} : ${id}`);
  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log(`Message WebSocket reçu pour ${type} : ${id}`, data);
      EventBus.emit(data.event, data);
    } catch (error) {
      console.error(`Erreur lors de l'analyse du message WebSocket pour ${type} : ${id}`, error);
    }
  };
  socket.onclose = () => {
    console.log(`Connexion WebSocket fermée pour ${type} : ${id}`);
    delete sockets[id];
  };
  socket.onerror = (error) => console.error(`Erreur WebSocket pour ${type} : ${id}`, error);

  sockets[id] = socket;
};

// Déconnecte un WebSocket en utilisant un identifiant et un type spécifiques.
const disconnectWebSocket = (id, type) => {
  if (sockets[id]) {
    console.log(`Déconnexion du WebSocket pour ${type} : ${id}`);
    sockets[id].close();
    delete sockets[id];
  }
};

// Déconnecte tous les WebSockets.
const disconnectAll = () => {
  Object.keys(sockets).forEach((id) => {
    console.log(`Déconnexion du WebSocket pour l'ID : ${id}`);
    if (sockets[id]) {
      sockets[id].close();
      delete sockets[id];
    }
  });
};

// Envoie un message à un WebSocket spécifique.
const sendMessage = (id, message) => {
  if (sockets[id] && sockets[id].readyState === WebSocket.OPEN) {
    console.log(`Envoi d'un message WebSocket à l'ID : ${id}`, message);
    sockets[id].send(JSON.stringify(message));
  } else {
    console.error(`WebSocket non connecté pour l'ID : ${id}`);
  }
};

// Vérifie si un WebSocket est connecté en utilisant un identifiant spécifique.
const isConnected = (id) => !!sockets[id];

export default {
  connectGroup: (groupId) => connectWebSocket(groupId, 'group'),
  disconnectGroup: (groupId) => disconnectWebSocket(groupId, 'group'),
  connectSessionStatus: (sessionId) => connectWebSocket(sessionId, 'session'),
  disconnectSession: (sessionId) => disconnectWebSocket(sessionId, 'session'),
  sendMessage,
  isConnected,
  disconnectAll,
};