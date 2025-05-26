const repository = require('../repositories/repository');

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

// NOTIFICATION CONTROLLERS
const getNotifications = async (req, res) => {
    const notifications = await repository.getNotifications();
    return res.status(200).json(notifications);
};

const getNotification = async (req, res) => {
    const notification = await repository.getNotification(req.params.id);
    return res.status(200).json(notification);
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
    getNotification
};
