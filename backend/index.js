const express = require("express");
const { PORT } = require('./config');
const cors = require('cors');
const initializeWebSocketServer = require('./wsServer/wsServer');  // Import WebSocket server setup

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' })); 
app.use(express.static("node_modules"));
app.use('/pictures', express.static("pictures"));

const router = require("./routers/router");
app.use(router);

// Create the HTTP server as usual
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`App is listening on port ${PORT}`);
});

// Initialize WebSocket server
initializeWebSocketServer(server);  // Pass the HTTP server to initialize WS
