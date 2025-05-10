const db = require('../data/db'); // centralized models export

// SENSOR REPOSITORY
const getSensors = async () => {
    return await db.sensor.findAll();
};

const getOneSensor = async (id) => {
    return await db.sensor.findByPk(id);
};

const addSensor = async (sensorData) => {
    return await db.sensor.create(sensorData);
};

const updateSensor = async (id, sensorData) => {
    await db.sensor.update(sensorData, { where: { id } });
    return await db.sensor.findByPk(id);
};

// FRAME REPOSITORY
const getFrames = async () => {
    return await db.CameraFrame.findAll();
};

const getOneFrame = async (id) => {
    return await db.CameraFrame.findByPk(id);
};

const addFrame = async (frameData) => {
    return await db.CameraFrame.create(frameData);
};

// CAMERA REPOSITORY
const getCamera = async () => {
    // Hardcoded URL or dynamic later
    return { camera_url: "http://yourserverip:yourport/live" };
};

// HEIGHT REPOSITORY
const getHeights = async () => {
    return await db.PlantHeight.findAll();
};

const getOneHeight = async (id) => {
    return await db.PlantHeight.findByPk(id);
};

const addHeight = async (heightData) => {
    return await db.PlantHeight.create(heightData);
};

const updateHeight = async (id, heightData) => {
    await db.PlantHeight.update(heightData, { where: { id } });
    return await db.PlantHeight.findByPk(id);
};

// ADJUSTMENT REPOSITORY
const getAdjustments = async () => {
    return await db.Adjustment.findAll();
};

const addAdjustment = async (adjustmentData) => {
    return await db.Adjustment.create(adjustmentData);
};

const updateAdjustment = async (id, adjustmentData) => {
    await db.Adjustment.update(adjustmentData, { where: { id } });
    return await db.Adjustment.findByPk(id);
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
    addAdjustment,
    updateAdjustment,
};
