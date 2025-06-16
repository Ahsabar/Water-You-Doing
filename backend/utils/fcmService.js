const admin = require('../config/firebase');

async function sendPushNotification(token, title, body, data = {}) {
  const message = {
    token,
    notification: {
      title,
      body
    },
    data, // optional custom data
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

module.exports = { sendPushNotification };