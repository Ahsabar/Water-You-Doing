const WebSocket = require('ws');
const db = require('../data/db');

module.exports = async (sensor, sensorData, wss, controllerSocket) => {
    const adjustment = await db.adjustment.findOne({
        where: { adjustment_type: sensor.type },
        order: [['timestamp', 'DESC']]
    });

    if (!adjustment) return;

    const threshold = adjustment.value;
    const tolerance = 5;
    const halfTolerance = 2;
    let action = null;
    let stopAt = null;

    if (sensorData.value < threshold - tolerance) {
        action = 'pump';
        stopAt = threshold + halfTolerance;
    }

    if (!action) return;

    // Check device status before triggering
    const device = await db.device.findOne({ where: { name: action, sensorId: sensor.id } });

    if (!device) {
        console.warn(`Device not found for action: ${action}`);
        return;
    }

    if (device.status === 'on') {
        console.log(`${action} already running. No command sent.`);
        return;
    }

    // Update device status to 'on'
    await device.update({ status: 'on' });

    const message = 'Water pump is started';

    // Broadcast info message to all clients
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ status: 'info', message }));
        }
    });

    await db.notification.create({ message });
    await db.log.create({ log_message: message, log_level: 'info' });

    // Send command only to controller socket
    if (controllerSocket && controllerSocket.readyState === WebSocket.OPEN) {
        controllerSocket.send(JSON.stringify({
            command: `start_${action}`,
            sensorId: sensor.id,
            stopAt
        }));
    }
};