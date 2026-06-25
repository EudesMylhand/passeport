const { Notification } = require('../models');

let ioInstance = null;

function setIo(io) {
  ioInstance = io;
}

async function emitNotification(type, message, userId = null) {
  try {
    await Notification.create({ type, message, user_id: userId });
    if (ioInstance) {
      ioInstance.emit('notification', { type, message, date: new Date() });
    }
  } catch (err) {
    console.error('Erreur notification :', err.message);
  }
}

module.exports = { setIo, emitNotification };
