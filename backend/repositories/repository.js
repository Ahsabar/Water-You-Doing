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
    return await db.cameraframe.findAll();
};

const getOneFrame = async (id) => {
    return await db.cameraframe.findByPk(id);
};

const addFrame = async (frameData) => {
    return await db.cameraframe.create(frameData);
};

// CAMERA REPOSITORY
const getCamera = async () => {
    // Hardcoded URL or dynamic later
    return { camera_url: "http://yourserverip:yourport/live" };
};

// HEIGHT REPOSITORY
const getHeights = async () => {
    return await db.plantheight.findAll();
};

const getOneHeight = async (id) => {
    return await db.plantheight.findByPk(id);
};

const addHeight = async (heightData) => {
    return await db.plantheight.create(heightData);
};

const updateHeight = async (id, heightData) => {
    await db.plantheight.update(heightData, { where: { id } });
    return await db.plantheight.findByPk(id);
};

// ADJUSTMENT REPOSITORY
const getAdjustments = async () => {
    return await db.adjustment.findAll();
};

const addAdjustment = async (adjustmentData) => {
    return await db.adjustment.create(adjustmentData);
};

const updateAdjustment = async (id, adjustmentData) => {
    await db.adjustment.update(adjustmentData, { where: { id } });
    return await db.adjustment.findByPk(id);
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
