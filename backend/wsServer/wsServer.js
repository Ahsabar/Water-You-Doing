const WebSocket = require('ws');
const wsOperations = require('../wsOperations/wsOperations');
const socketManager = require('../utils/socketManager');
const admin = require('../config/firebase');
const storedFcmToken = require('../utils/fcmTokenManager');

let wss; // WebSocket server instance
// let controllerSocket = null; // Store the controller socket

const initializeWebSocketServer = (server) => {
    wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        console.log('New WebSocket connection established');
        ws.clientType = 'unknown'; // Default client type
        ws.fcmToken = null;

        ws.on('message', async (message) => {
            console.log('Received message:', message);
            try {
                const data = JSON.parse(message);

                if (data.action === 'greet') {
                    console.log("Greet received:", data.message);

                    if (data.message === 'controller') {
                        // controllerSocket = ws;
                        console.log('Controller socket stored');
                        socketManager.setControllerSocket(ws);
                        ws.clientType = 'controller';
                        console.log('Controller socket stored');
                    } else if (data.message === 'mobile' && data.fcmToken) { // Check for FCM token in greet
                        ws.clientType = 'mobile';
                        ws.fcmToken = data.fcmToken; // Store the FCM token
                        // storedFcmToken = data.fcmToken;
                        storedFcmToken.setFcmToken(data.fcmToken);
                        console.log('Mobile client connected with FCM Token:', ws.fcmToken);
                    } else {
                        ws.clientType = 'mobile'; // Fallback for mobile without FCM token (though you should ideally get it)
                        console.log('Mobile client connected');
                    }

                    console.log(data);
                    ws.send(JSON.stringify({
                        status: 'success',
                        reply: `Hello ${ws.clientType}! You said: ${data.message}`
                    }));
                    return;
                }

                if (wsOperations[data.action]) {
                    const result = await wsOperations[data.action](data, ws, wss, socketManager.getControllerSocket());
                    ws.send(JSON.stringify(result));
                } else {
                    ws.send(JSON.stringify({ status: 'error', message: 'Unknown action' }));
                }

            } catch (error) {
                console.error('Error processing message:', error);
                ws.send(JSON.stringify({ status: 'error', message: error.message }));
            }
        });

        ws.send('WebSocket connection established');
        
        ws.on('close', () => {
            if (ws === socketManager.getControllerSocket()) {
                console.log('Controller disconnected');
                socketManager.setControllerSocket(null);
            }
        });
        
    });

    return wss;
};

module.exports = initializeWebSocketServer;