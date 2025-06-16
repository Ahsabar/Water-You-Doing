const db = require('../data/db'); // centralized models export
const { get } = require('../routers/router');

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

// DEVICE REPOSITORY
const getDevices = async () => {
    return await db.device.findAll();
};

const getDevice = async (id) => {
    return await db.device.findByPk(id);
};

const turnOnDevice = async (id) => {
    const device = await db.device.findByPk(id);
    if (device) {
        await device.update({ status: 'on' });
        return device;
    }
    throw new Error('Device not found');
}

const turnOffDevice = async (id) => {
    const device = await db.device.findByPk(id);
    if (device) {
        await device.update({ status: 'off' });
        return device;
    }
    throw new Error('Device not found');
}

const updateDeviceAutomation = async (id, { isAutomated }) => {
    const device = await db.device.findByPk(id);
    if (device) {
        await device.update({ isAutomated });
        return device;
    }
    throw new Error('Device not found');
};

// NOTIFICATION REPOSITORY
const getNotifications = async () => {
    return await db.notification.findAll();
};

const getNotification = async (id) => {
    return await db.notification.findByPk(id);
};

const markAllNotificationsAsRead = async () => {
    await db.notification.update({ status: "read" }, { where: { status: "unread" } });
    return await db.notification.findAll();
};

// PICTURE REPOSITORY
const getPictures = async () => {
    return await db.picture.findAll();
};

const addPicture = async (pictureData) => {
    return await db.picture.create(pictureData);
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
