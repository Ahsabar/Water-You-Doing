const WebSocket = require('ws');
const db = require('../data/db');

module.exports = async (sensor, sensorData, wss, controllerSocket) => {
    const adjustment = await db.adjustment.findOne({
        where: { adjustment_type: sensor.type },
        order: [['timestamp', 'DESC']]
    });

    if (!adjustment) return;

    const threshold = adjustment.value;
    const tolerance = 1;
    const halfTolerance = 0.5;
    let action = null;
    let stopAt = null;

    const currentStatus = sensor.status || 'off';

    // Determine what to activate
    if (sensorData.value > threshold + tolerance && currentStatus !== 'on') {
        action = 'cooler';
        stopAt = threshold - halfTolerance;
    } else if (sensorData.value < threshold - tolerance && currentStatus !== 'on') {
        action = 'heater';
        stopAt = threshold + halfTolerance;
    }

    if (!action) return; // Already active or within range

    // Update sensor status to "on"
    await sensor.update({ status: 'on' });

    const message = `${action.charAt(0).toUpperCase() + action.slice(1)} is started`;

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