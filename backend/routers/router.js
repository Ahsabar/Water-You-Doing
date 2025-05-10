const express = require('express');
const controller = require('../controllers/controller');
const router = express.Router();

// Get, add, update sensors
router.get("/sensors", controller.getSensors);
router.get("/sensors/:id", controller.getOneSensor);
router.post("/sensor", controller.addSensor);
//router.put("/sensor/:id", controller.updateSensor);

// get, add frames
router.get("/frames", controller.getFrames);
router.get("/frames/:id", controller.getOneFrame);
router.post("/frame", controller.addFrame);

// get camera
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

module.exports = router;
