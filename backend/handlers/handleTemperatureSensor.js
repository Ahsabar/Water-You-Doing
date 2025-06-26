const WebSocket = require('ws');
const db = require('../data/db');
const { sendPushNotification } = require('../utils/fcmService')
const storedFcmToken = require('../utils/fcmTokenManager')

module.exports = async (sensor, sensorData, wss, controllerSocket) => {
    const fcmToken = storedFcmToken.getFcmToken();

    const adjustment = await db.adjustment.findOne({
        where: { adjustment_type: sensor.type },
        order: [['timestamp', 'DESC']]
    });

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ status: 'updateTemperature', value: sensorData.value }));
        }
    });

    const device = await db.device.findOne({ where: { sensorId: sensor.id } });

    if (!device || device.isAutomated == 0) {
        console.log(`Climate Control is not automated. Skipping sensor handling.`);
        return;
    }

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

    let infoMessage = null;
    if (stopAction) {
      infoMessage = `${stopAction.charAt(0).toUpperCase() + stopAction.slice(1)} is stopped.`;
    } else if (action && (!stopAction || stopAction !== action)) {
      infoMessage = `${action.charAt(0).toUpperCase() + action.slice(1)} is started.`;
    }

    // if (!infoMessage) return;

    const mobileClients = [];
    wss.clients.forEach(client => {
        if (
        client.readyState === WebSocket.OPEN &&
        client.clientType === 'mobile' &&
        client.fcmToken // ensure we have a token
        ) {
          mobileClients.push(client);
        //   client.send(JSON.stringify({ status: 'info', message: infoMessage }));
        }
    });
    
    // if (mobileClients.length === 0) {
    //     const storedToken = fcmToken;

    //     await sendPushNotification(
    //         storedToken,
    //         'Climate Update',
    //         infoMessage
    //     );
    // }


    // Handle stop first
    if (stopAction) {
        const device = devices.find(d => d.name === stopAction);
        
        if (device.status === 'off') {
            console.log(`${stopAction} already stopped. No command sent.`);
            return;
        }

        await device.update({ status: 'off' });

        if (mobileClients.length === 0) {
            const storedToken = fcmToken;

            await sendPushNotification(
                storedToken,
                'Climate Update',
                infoMessage
            );
        }

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
        
        if (mobileClients.length === 0) {
            const storedToken = fcmToken;

            await sendPushNotification(
                storedToken,
                'Climate Update',
                infoMessage
            );
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