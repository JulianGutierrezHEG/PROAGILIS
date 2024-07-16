import EventBus from './eventBus';

// FONCTIONS POUR LA GESTION DES WEBSOCKETS

const sockets = {};

// Connecte un WebSocket en utilisant un identifiant et un type spécifiques
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

// Déconnecte un WebSocket en utilisant un identifiant et un type spécifiques
const disconnectWebSocket = (id, type) => {
  const socketKey = `${type}-${id}`;
  if (sockets[socketKey]) {
    console.log(`Déconnexion du WebSocket pour ${type} : ${id}`);
    sockets[socketKey].close();
    delete sockets[socketKey];
  }
};

// Déconnecte tous les WebSockets
const disconnectAll = () => {
  Object.keys(sockets).forEach((key) => {
    console.log(`Déconnexion du WebSocket pour l'ID : ${key}`);
    if (sockets[key]) {
      sockets[key].close();
      delete sockets[key];
    }
  });
};

// Envoie un message à un WebSocket spécifique
const sendMessage = (id, message) => {
  Object.keys(sockets).forEach((key) => {
    if (key.includes(id) && sockets[key].readyState === WebSocket.OPEN) {
      console.log(`Envoi d'un message WebSocket à l'ID : ${key}`, message);
      sockets[key].send(JSON.stringify(message));
    }
  });
};

// Ajoute un écouteur d'événements de message à un WebSocket avec ID
const onMessage = (id, callback) => {
  Object.keys(sockets).forEach((key) => {
    if (key.includes(id)) {
      sockets[key].addEventListener('message', callback);
    }
  });
};

// Supprime un écouteur d'événements de message à un WebSocket avec ID
const offMessage = (id, callback) => {
  Object.keys(sockets).forEach((key) => {
    if (key.includes(id)) {
      sockets[key].removeEventListener('message', callback);
    }
  });
};

// Vérifie si un WebSocket est connecté en utilisant un identifiant spécifique.
const isConnected = (id) => !!Object.keys(sockets).find(key => key.includes(id));

// Envoi du message de verrouillage d'un élément
const lockElement = (groupId, elementId, user) => {
  sendMessage(groupId, { event: 'lock_element', element_id: elementId, user });
};

// Envoi du message de déverrouillage d'un élément
const unlockElement = (groupId, elementId, user) => {
  sendMessage(groupId, { event: 'unlock_element', element_id: elementId, user });
};

// Envoi du message de mise à jour des détails du projet
const updateProjectDetails = (groupId, projectName, roles, user) => {
  sendMessage(groupId, { event: 'project_update', projectName, roles, user });
};

const updateSmartDetails = (groupId, phaseId, smartDetails, user) => {
  console.log(`Envoi de la mise à jour des détails intelligents pour le groupe: ${groupId}, phase: ${phaseId}`);
  sendMessage(groupId, { event: 'smart_update', group_id: groupId, phase_id: phaseId, smart_details: smartDetails, user });
};


// Envoi du message de soumission de la réponse d'une phase
const submitAnswer = (groupId, phaseId, answerData, user) => {
  sendMessage(groupId, { event: 'phase_answer_submit', phase_id: phaseId, answer: answerData, user });
};

// Envoi du message d'affichage de l'écran d'attente
const showWaitingScreen = (groupId, user) => {
  sendMessage(groupId, { event: 'show_waiting_screen', user });
};

// Envoi du message de mise à jour de l'état de la phase
const sendPhaseStatusUpdate = (groupId, phaseId, status) => {
  console.log(`Envoi du statut de la phase pour le groupe: ${groupId}, phase: ${phaseId}, status: ${status}`);
  sendMessage(groupId, { event: 'phase_status_update', group_id: groupId, phase_id: phaseId, status });
};

// Envoi du message de mise à jour de la réponse de la phase
const sendPhaseAnswerUpdate = (groupId, phaseId, answerData) => {
  console.log(`Envoi de la réponse de la phase du groupe: ${groupId}, phase: ${phaseId}`);
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
  updateSmartDetails,
  showWaitingScreen,
  sendPhaseStatusUpdate,
  sendPhaseAnswerUpdate,
  submitAnswer,
};
