const WebSocket = require('ws');
const db = require('../data/db');

module.exports = async (sensor, sensorData, wss, controllerSocket) => {
	await db.plantheight.create({
        sensor_id: sensor.id,
        height: sensorData.value,
    });

	await db.log.create({ log_message: "Plant height saved", log_level: 'info' });
};