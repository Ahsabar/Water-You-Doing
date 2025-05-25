const db = require('../data/db');
const handleTemperatureSensor = require('../handlers/handleTemperatureSensor');
const handleHumiditySensor = require('../handlers/handleHumiditySensor');
const handleHeightSensor = require('../handlers/handleHeightSensor');

const updateSensor = async (data, ws, wss, controllerSocket) => {
    try {
        const { sensorId, sensorData } = data;

        const sensor = await db.sensor.findOne({ where: { id: sensorId } });
        if (!sensor) throw new Error('Sensor not found');

        await sensor.update(sensorData);

        await db.sensormeasurement.create({
            sensor_id: sensorId,
            value: sensorData.value,
        });

        // Route to specific handler based on sensor type
        switch (sensor.type) {
            case 'temperature':
                await handleTemperatureSensor(sensor, sensorData, wss, controllerSocket);
                break;
            case 'humidity':
                await handleHumiditySensor(sensor, sensorData, wss, controllerSocket);
                break;
			case 'height':
                await handleHeightSensor(sensor, sensorData, wss, controllerSocket);
                break;
            default:
                console.warn(`No handler for sensor type: ${sensor.type}`);
        }

        return { status: 'success', updatedSensor: sensor };
    } catch (error) {
        return { status: 'error', message: error.message };
    }
};

const getSensorData = async (data, ws) => {
    try {
        const { sensorId } = data;

        const sensor = await db.sensor.findOne({ where: { id: sensorId } });
        if (!sensor) throw new Error('Sensor not found');

        return { status: 'success', sensorData: sensor };
    } catch (error) {
        return { status: 'error', message: error.message };
    }
};

module.exports = {
    updateSensor,
    getSensorData
};
