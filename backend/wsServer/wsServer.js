const WebSocket = require('ws');
const wsOperations = require('../wsOperations/wsOperations');

let wss; // WebSocket server instance
let controllerSocket = null; // Store the controller socket

const initializeWebSocketServer = (server) => {
    wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        console.log('New WebSocket connection established');
        ws.clientType = 'unknown'; // Default client type

        ws.on('message', async (message) => {
            console.log('Received message:', message);
            try {
                const data = JSON.parse(message);

                if (data.action === 'greet') {
                    console.log("Greet received:", data.message);

                    if (data.message === 'controller') {
                        controllerSocket = ws;
                        ws.clientType = 'controller';
                        console.log('Controller socket stored');
                    } else {
                        ws.clientType = 'mobile';
                        console.log('Mobile client connected');
                    }

                    ws.send(JSON.stringify({
                        status: 'success',
                        reply: `Hello ${ws.clientType}! You said: ${data.message}`
                    }));
                    return;
                }

                if (wsOperations[data.action]) {
                    const result = await wsOperations[data.action](data, ws, wss, controllerSocket);
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
            if (ws === controllerSocket) {
                console.log('Controller disconnected');
                controllerSocket = null;
            }
        });
    });

    return wss;
};

module.exports = initializeWebSocketServer;