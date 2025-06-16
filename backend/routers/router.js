const express = require('express');
const controller = require('../controllers/controller');
const upload = require('../middleware/imageUploader');
const router = express.Router();

// Get, add, update sensors
router.get("/sensors", controller.getSensors);
router.get("/sensors/:id", controller.getOneSensor);
router.post("/sensor", controller.addSensor);
//router.put("/sensor/:id", controller.updateSensor);

// Get, add frames
router.get("/frames", controller.getFrames);
router.get("/frames/:id", controller.getOneFrame);
router.post("/frame", controller.addFrame);

// Get camera
router.get("/camera", controller.getCamera);

// Get, add, update heights
router.get("/heights", controller.getHeights);
router.get("/heights/:id", controller.getHeights);
router.post("/height", controller.addHeight);
router.put("/height/:id", controller.updateHeight);

// Adjustment
router.get("/adjustments", controller.getAdjustments);
router.put("/adjustments/:id", controller.updateAdjustment);
router.post("/adjustment", controller.addAdjustment);

// Device
router.get("/devices", controller.getDevices);
router.get("/devices/:id", controller.getDevice);
router.put("/device/:id/automation", controller.updateDeviceAutomation);
router.post("/device/:id/on", controller.turnOnDevice);
router.post("/device/:id/off", controller.turnOffDevice);

// Notification
router.get("/notifications", controller.getNotifications);
router.get("/notifications/:id", controller.getNotification);
router.put("/notifications/mark-all-read", controller.markAllNotificationsAsRead);

// Pictures
router.get("/pictures", controller.getPictures);
router.post("/picture", upload.single('picture'), controller.addPicture);

module.exports = router;
