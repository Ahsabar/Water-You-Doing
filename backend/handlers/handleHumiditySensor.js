const WebSocket = require('ws');
const db = require('../data/db');
const { sendPushNotification } = require('../utils/fcmService')
const storedFcmToken = require('../utils/fcmTokenManager');

module.exports = async (sensor, sensorData, wss, controllerSocket) => {
    const fcmToken = storedFcmToken.getFcmToken();

    const adjustment = await db.adjustment.findOne({
        where: { adjustment_type: sensor.type },
        order: [['timestamp', 'DESC']]
    });

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ status: 'updateSoilMoisture', value: sensorData.value }));
        }
    });

    const device = await db.device.findOne({ where: { sensorId: sensor.id } });

    if (!device || device.isAutomated == 0) {
        console.log(`Watering is not automated. Skipping sensor handling.`);
        return;
    }

    if (!adjustment) return;

    const threshold = adjustment.value;
    const tolerance = 5;
    const halfTolerance = 2.5;
    const value = sensorData.value;

    console.log(value);

    let action = null;
    let stopAction = null;

    // Decide whether to start pump
    if (value < threshold - tolerance) {
        action = 'pump';
    }

    // Determine whether to stop pump (based on device currently running)
    const devices = await db.device.findAll({ where: { sensorId: sensor.id } });

    for (const device of devices) {
        if (device.status === 'on') {
            if (device.name === 'pump' && value >= threshold + halfTolerance) {
                stopAction = 'pump';
            }
        }
    }

    let infoMessage = null;
    if (stopAction) {
        infoMessage = 'Water pump is stopped';
    } else if (action && (!stopAction || stopAction !== action)) {
        infoMessage = 'Water pump is started';
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
    //         'Water Pump Update',
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
                'Water Pump Update',
                infoMessage
            );
        }

        const message = `Water pump is stopped`;

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
        if (!device) {
            console.warn(`Device not found for action: ${action}`);
            return;
        }

        if (device.status === 'on') {
            console.log(`${action} already running. No command sent.`);
            return;
        }

        if (mobileClients.length === 0) {
            const storedToken = fcmToken;
            await sendPushNotification(
                storedToken,
                'Water Pump Update',
                infoMessage
            );
        }

        await device.update({ status: 'on' });

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
                sensorId: sensor.id
            }));
        }
    }
};