const repository = require('../repositories/repository');
const socketManager = require('../utils/socketManager');
const path = require('path');
const fs = require('fs');

// SENSOR CONTROLLERS
const getSensors = async (req, res) => {
    const sensors = await repository.getSensors();
    return res.status(200).json(sensors);
};

const getOneSensor = async (req, res) => {
    const sensor = await repository.getOneSensor(req.params.id);
    return res.status(200).json(sensor);
};

const addSensor = async (req, res) => {
    const sensor = await repository.addSensor(req.body);
    return res.status(201).json(sensor);
};

const updateSensor = async (req, res) => {
    const updatedSensor = await repository.updateSensor(req.params.id, req.body);
    return res.status(200).json(updatedSensor);
};

// FRAME CONTROLLERS
const getFrames = async (req, res) => {
    const frames = await repository.getFrames();
    return res.status(200).json(frames);
};

const getOneFrame = async (req, res) => {
    const frame = await repository.getOneFrame(req.params.id);
    return res.status(200).json(frame);
};

const addFrame = async (req, res) => {
    const frame = await repository.addFrame(req.body);
    return res.status(201).json(frame);
};

// CAMERA CONTROLLER
const getCamera = async (req, res) => {
    const cameraData = await repository.getCamera();
    return res.status(200).json(cameraData);
};

// HEIGHT CONTROLLERS
const getHeights = async (req, res) => {
    const heights = await repository.getHeights();
    return res.status(200).json(heights);
};

const getOneHeight = async (req, res) => {
    const height = await repository.getOneHeight(req.params.id);
    return res.status(200).json(height);
};

const addHeight = async (req, res) => {
    const height = await repository.addHeight(req.body);
    return res.status(201).json(height);
};

const updateHeight = async (req, res) => {
    const updatedHeight = await repository.updateHeight(req.params.id, req.body);
    return res.status(200).json(updatedHeight);
};

//ADJUSTMENTS
const getAdjustments = async (req, res) => {
    const adjustments = await repository.getAdjustments();
    return res.status(200).json(adjustments);
};

const updateAdjustment = async (req, res) => {
    const updatedAdjustment = await repository.updateAdjustment(req.params.id, req.body);
    return res.status(201).json(updatedAdjustment);
};

const addAdjustment = async (req, res) => {
    const adjustment = await repository.addAdjustment(req.body);
    return res.status(200).json(adjustment);
};

// DEVICE CONTROLLERS
const getDevices = async (req, res) => {
    const devices = await repository.getDevices();
    return res.status(200).json(devices);
};

const getDevice = async (req, res) => {
    const device = await repository.getDevice(req.params.id);
    return res.status(200).json(device);
};

const turnOnDevice = async (req, res) => {
    const current_device = await repository.getDevice(req.params.id);
    const deviceName = current_device.name;
    // Send command to controller first
    const controllerSocket = socketManager.getControllerSocket();
    if (controllerSocket && controllerSocket.readyState === WebSocket.OPEN) {
        controllerSocket.send(JSON.stringify({
            command: `start_${deviceName}`,
            deviceId: req.params.id
        }));
    }
    // Then update database
    const device = await repository.turnOnDevice(req.params.id);
    return res.status(200).json(device);
};

const turnOffDevice = async (req, res) => {
    const deviceName = await repository.getDevice(req.params.id).then(device => device.name);
    // Send command to controller first
    const controllerSocket = socketManager.getControllerSocket();
    if (controllerSocket && controllerSocket.readyState === WebSocket.OPEN) {
        controllerSocket.send(JSON.stringify({
            command: `stop_${deviceName}`,
            deviceId: req.params.id
        }));
    }
    
    // Then update database
    const device = await repository.turnOffDevice(req.params.id);
    return res.status(200).json(device);
};

const updateDeviceAutomation = async (req, res) => {
    const { isAutomated } = req.body;
    let updatedDevice;
    if (req.params.id === '1' || req.params.id === '2') {
        // Update both devices 1 and 2
        const updated1 = await repository.updateDeviceAutomation('1', { isAutomated });
        const updated2 = await repository.updateDeviceAutomation('2', { isAutomated });
        updatedDevice = [updated1, updated2];
    } else if (req.params.id === '3') {
        updatedDevice = await repository.updateDeviceAutomation('3', { isAutomated });
    } else {
        return res.status(400).json({ error: 'Invalid device id' });
    }
    return res.status(200).json(updatedDevice);
};

// NOTIFICATION CONTROLLERS
const getNotifications = async (req, res) => {
    const notifications = await repository.getNotifications();
    return res.status(200).json(notifications);
};

const getNotification = async (req, res) => {
    const notification = await repository.getNotification(req.params.id);
    return res.status(200).json(notification);
};

const markAllNotificationsAsRead = async (req, res) => {
    const updatedNotifications = await repository.markAllNotificationsAsRead();
    return res.status(200).json(updatedNotifications);
}

// PICTURE CONTROLLERS
const getPictures = async (req, res) => {
    const pictures = await repository.getPictures();
    return res.status(200).json(pictures);
};

const addPicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const pictureData = {
          file_name: req.file.filename, // Use the stored filename
          file_path: req.file.path
        };

        const picture = await repository.addPicture(pictureData);

        return res.status(201).json(picture);
    } catch (err) {
        console.log('Error adding picture:', err);
        return res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getSensors,
    getOneSensor,
    addSensor,
    updateSensor,
    getFrames,
    getOneFrame,
    addFrame,
    getCamera,
    getHeights,
    getOneHeight,
    addHeight,
    updateHeight,
	getAdjustments,
	updateAdjustment,
	addAdjustment,
    getDevices,
    getDevice,
    getNotifications,
    getNotification,
    markAllNotificationsAsRead,
    turnOnDevice,
    turnOffDevice,
    updateDeviceAutomation,
    getPictures,
    addPicture
};
