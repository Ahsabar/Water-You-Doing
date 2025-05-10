// wsOperations.js
const db = require('../data/db');  // Assuming you are using Sequelize for DB operations
const WebSocket = require('ws'); // Needed for WebSocket.OPEN

const updateSensor = async (data, ws, wss) => {
    try {
        const { sensorId, sensorData } = data;

        // Find sensor
        const sensor = await db.sensor.findOne({ where: { id: sensorId } });
        if (!sensor) {
            throw new Error('Sensor not found');
        }

        // Update sensor
        await sensor.update(sensorData);

        // Save the new measurement
        await db.sensormeasurement.create({
            sensor_id: sensorId,
            value: sensorData.value,
        });

        // Find the latest threshold for the sensor type
        const adjustment = await db.adjustment.findOne({
            where: { adjustment_type: sensor.type },
            order: [['timestamp', 'DESC']]
        });

        if (adjustment) {
            const threshold = adjustment.value;
            let action = null;
            const tolerance = 1; // ±1°C

            if (sensorData.value > threshold + tolerance) {
                action = 'cooler';
            } else if (sensorData.value < threshold - tolerance) {
                action = 'heater';
            }

            if (action) {
                const message = `${action.charAt(0).toUpperCase() + action.slice(1)} is started`;

                // Broadcast to all connected clients
                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            status: 'info',
                            message: message
                        }));
                    }
                });

                await db.notification.create({ message });
                await db.log.create({ log_message: message, log_level: 'info' });
            }
        }

        return { status: 'success', updatedSensor: sensor };
    } catch (error) {
        return { status: 'error', message: error.message };
    }
};

// Operation to fetch sensor data
const getSensorData = async (data, ws) => {
    try {
        const { sensorId } = data;

        const sensor = await db.sensor.findOne({ where: { id: sensorId } });
        if (!sensor) {
            throw new Error('Sensor not found');
        }

        return { status: 'success', sensorData: sensor };
    } catch (error) {
        return { status: 'error', message: error.message };
    }
};

// Exporting the operations
module.exports = {
    updateSensor,
    getSensorData
};
