var DataTypes = require("sequelize").DataTypes;
var _adjustment = require("./adjustment");
var _cameraframe = require("./cameraframe");
var _log = require("./log");
var _notification = require("./notification");
var _plantheight = require("./plantheight");
var _sensor = require("./sensor");
var _sensormeasurement = require("./sensormeasurement");

function initModels(sequelize) {
  var adjustment = _adjustment(sequelize, DataTypes);
  var cameraframe = _cameraframe(sequelize, DataTypes);
  var log = _log(sequelize, DataTypes);
  var notification = _notification(sequelize, DataTypes);
  var plantheight = _plantheight(sequelize, DataTypes);
  var sensor = _sensor(sequelize, DataTypes);
  var sensormeasurement = _sensormeasurement(sequelize, DataTypes);

  sensormeasurement.belongsTo(sensor, { foreignKey: "sensor_id"});
  sensor.hasMany(sensormeasurement, { foreignKey: "sensor_id"});

  return {
    adjustment,
    cameraframe,
    log,
    notification,
    plantheight,
    sensor,
    sensormeasurement,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
