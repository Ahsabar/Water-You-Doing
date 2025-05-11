const WebSocket = require('ws');
const db = require('../data/db');

module.exports = async (sensor, sensorData, wss, controllerSocket) => {
    const adjustment = await db.adjustment.findOne({
        where: { adjustment_type: sensor.type },
        order: [['timestamp', 'DESC']]
    });

    if (!adjustment) return;

    const threshold = adjustment.value;
    const tolerance = 5;        // ±1% humidity
    const halfTolerance = 2;  // for stopping condition

    let action = null;
    let stopAt = null;

    if (sensorData.value < threshold - tolerance) {
        action = 'pump';
        stopAt = threshold + halfTolerance;
    }

    if (!action) return;

    const message = `Water pump is started`;

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ status: 'info', message }));
        }
    });

    await db.notification.create({ message });
    await db.log.create({ log_message: message, log_level: 'info' });

    if (controllerSocket && controllerSocket.readyState === WebSocket.OPEN) {
        controllerSocket.send(JSON.stringify({
            command: `start_${action}`,
            sensorId: sensor.id,
            stopAt
        }));
    }
};
