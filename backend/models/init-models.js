var DataTypes = require("sequelize").DataTypes;
var _adjustment = require("./adjustment");
var _cameraframe = require("./cameraframe");
var _device = require("./device");
var _log = require("./log");
var _notification = require("./notification");
var _plantheight = require("./plantheight");
var _sensor = require("./sensor");
var _sensormeasurement = require("./sensormeasurement");
var _picture = require("./picture");

function initModels(sequelize) {
  var adjustment = _adjustment(sequelize, DataTypes);
  var cameraframe = _cameraframe(sequelize, DataTypes);
  var device = _device(sequelize, DataTypes);
  var log = _log(sequelize, DataTypes);
  var notification = _notification(sequelize, DataTypes);
  var plantheight = _plantheight(sequelize, DataTypes);
  var sensor = _sensor(sequelize, DataTypes);
  var sensormeasurement = _sensormeasurement(sequelize, DataTypes);
  var picture = _picture(sequelize, DataTypes);

  device.belongsTo(sensor, { foreignKey: "sensorId"});
  sensor.hasMany(device, { foreignKey: "sensorId"});
  plantheight.belongsTo(sensor, { foreignKey: "sensor_id"});
  sensor.hasMany(plantheight, { foreignKey: "sensor_id"});
  sensormeasurement.belongsTo(sensor, { foreignKey: "sensor_id"});
  sensor.hasMany(sensormeasurement, { foreignKey: "sensor_id"});

  return {
    adjustment,
    cameraframe,
    device,
    log,
    notification,
    plantheight,
    sensor,
    sensormeasurement,
    picture,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
