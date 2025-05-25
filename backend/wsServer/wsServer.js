const WebSocket = require('ws');
const wsOperations = require('../wsOperations/wsOperations');

let wss; // Store globally
let controllerSocket = null;

const initializeWebSocketServer = (server) => {
    wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        console.log('New WebSocket connection established');

        ws.on('message', async (message) => {
            console.log('Received message:', message);
            try {
                const data = JSON.parse(message);
				if (data.action === 'greet') {
					console.log("Greet received from controller:", data.message);
                    ws.send(JSON.stringify({
                        status: 'success',
                        reply: `Hello controller! You said: ${data.message}`
                    }));
				}
				else {
					if (wsOperations[data.action]) {
						const result = await wsOperations[data.action](data, ws, wss, controllerSocket);
                    	ws.send(JSON.stringify(result));
					} else {
                    	ws.send(JSON.stringify({ status: 'error', message: 'Unknown action' }));
                	}
				}
                // Handle WebSocket operations
                /**/
            } catch (error) {
                console.error('Error processing message:', error);
                ws.send(JSON.stringify({ status: 'error', message: error.message }));
            }
        });

        ws.send('WebSocket connection established');
    });

    return wss;
};

module.exports = initializeWebSocketServer;
