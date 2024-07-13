import EventBus from './eventBus';

const sockets = {};

// Connecte un WebSocket en utilisant un identifiant et un type spécifiques.
const connectWebSocket = (id, type) => {
  if (!id) return;
  const socketKey = `${type}-${id}`;
  if (sockets[socketKey]) {
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
    delete sockets[socketKey];
  };
  socket.onerror = (error) => console.error(`Erreur WebSocket pour ${type} : ${id}`, error);

  sockets[socketKey] = socket;
};

// Déconnecte un WebSocket en utilisant un identifiant et un type spécifiques.
const disconnectWebSocket = (id, type) => {
  const socketKey = `${type}-${id}`;
  if (sockets[socketKey]) {
    console.log(`Déconnexion du WebSocket pour ${type} : ${id}`);
    sockets[socketKey].close();
    delete sockets[socketKey];
  }
};

// Déconnecte tous les WebSockets.
const disconnectAll = () => {
  Object.keys(sockets).forEach((key) => {
    console.log(`Déconnexion du WebSocket pour l'ID : ${key}`);
    if (sockets[key]) {
      sockets[key].close();
      delete sockets[key];
    }
  });
};

// Envoie un message à un WebSocket spécifique.
const sendMessage = (id, message) => {
  Object.keys(sockets).forEach((key) => {
    if (key.includes(id) && sockets[key].readyState === WebSocket.OPEN) {
      console.log(`Envoi d'un message WebSocket à l'ID : ${key}`, message);
      sockets[key].send(JSON.stringify(message));
    }
  });
};

// Adds a message event listener to a WebSocket by ID.
const onMessage = (id, callback) => {
  Object.keys(sockets).forEach((key) => {
    if (key.includes(id)) {
      sockets[key].addEventListener('message', callback);
    }
  });
};

// Removes a message event listener from a WebSocket by ID.
const offMessage = (id, callback) => {
  Object.keys(sockets).forEach((key) => {
    if (key.includes(id)) {
      sockets[key].removeEventListener('message', callback);
    }
  });
};

// Vérifie si un WebSocket est connecté en utilisant un identifiant spécifique.
const isConnected = (id) => !!Object.keys(sockets).find(key => key.includes(id));

const lockElement = (groupId, elementId, user) => {
  console.log(`Sending lock event by: ${user}`); 
  sendMessage(groupId, { event: 'lock_element', element_id: elementId, user });
};

const unlockElement = (groupId, elementId, user) => {
  console.log(`Sending unlock event by: ${user}`); 
  sendMessage(groupId, { event: 'unlock_element', element_id: elementId, user });
};

const updateProjectDetails = (groupId, projectName, roles, user) => {
  console.log(`Sending project update by: ${user}`);
  sendMessage(groupId, { event: 'project_update', projectName, roles, user });
};

const submitProjectData = (groupId, projectData, user) => {
  console.log(`Submitting project data by: ${user}`);
  sendMessage(groupId, { event: 'submit_project_data', projectData, user });
};

const showWaitingScreen = (groupId, user) => {
  console.log(`Sending waiting screen event to group: ${groupId}`);
  sendMessage(groupId, { event: 'show_waiting_screen', user });
};

const sendPhaseStatusUpdate = (groupId, phaseId, status) => {
  console.log(`Sending phase status update for group: ${groupId}, phase: ${phaseId}, status: ${status}`);
  sendMessage(groupId, { event: 'phase_status_update', group_id: groupId, phase_id: phaseId, status });
};

const sendPhaseAnswerUpdate = (groupId, phaseId, answerData) => {
  console.log(`Sending phase answer update for group: ${groupId}, phase: ${phaseId}`);
  sendMessage(groupId, { event: 'phase_answer_update', group_id: groupId, phase_id: phaseId, answer: answerData });
};

export default {
  connectGroup: (groupId) => connectWebSocket(groupId, 'group'),
  disconnectGroup: (groupId) => disconnectWebSocket(groupId, 'group'),
  connectSessionStatus: (sessionId) => connectWebSocket(sessionId, 'session'),
  disconnectSession: (sessionId) => disconnectWebSocket(sessionId, 'session'),
  sendMessage,
  isConnected,
  disconnectAll,
  onMessage,
  offMessage,
  lockElement,
  unlockElement,
  updateProjectDetails,
  submitProjectData,
  showWaitingScreen,
  sendPhaseStatusUpdate,
  sendPhaseAnswerUpdate,
};
