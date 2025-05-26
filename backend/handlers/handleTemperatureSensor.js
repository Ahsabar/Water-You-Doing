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
    const value = sensorData.value;

	console.log(value);

    let action = null;
    let stopAction = null;

    // Determine whether to start
    if (value > threshold + tolerance) {
        action = 'cooler';
    } else if (value < threshold - tolerance) {
        action = 'heater';
    }

    // Determine whether to stop (based on device currently running)
    const devices = await db.device.findAll({ where: { sensorId: sensor.id } });

    for (const device of devices) {
        if (device.status === 'on') {
            if (device.name === 'cooler' && value <= threshold - halfTolerance) {
                stopAction = 'cooler';
            }
            if (device.name === 'heater' && value >= threshold + halfTolerance) {
                stopAction = 'heater';
            }
        }
    }

    // Handle stop first
    if (stopAction) {
        const device = devices.find(d => d.name === stopAction);
        await device.update({ status: 'off' });

        const message = `${stopAction.charAt(0).toUpperCase() + stopAction.slice(1)} is stopped`;

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ status: 'info', message }));
            }
        });

        await db.notification.create({ message });
        await db.log.create({ log_message: message, log_level: 'info' });

        if (controllerSocket && controllerSocket.readyState === WebSocket.OPEN) {
            controllerSocket.send(JSON.stringify({
                command: `stop_${stopAction}`,
                sensorId: sensor.id
            }));
        }
    }

    // Then handle start
    if (action && (!stopAction || stopAction !== action)) {
        const device = devices.find(d => d.name === action);
        if (!device) return console.warn(`Device not found for action: ${action}`);

        if (device.status === 'on') {
            console.log(`${action} already running. No command sent.`);
            return;
        }

        await device.update({ status: 'on' });

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
                sensorId: sensor.id
            }));
        }
    }
};