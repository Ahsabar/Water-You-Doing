const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('device', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('on','off'),
      allowNull: true,
      defaultValue: "off"
    },
    sensorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'sensor',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'device',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "fk_device_sensor",
        using: "BTREE",
        fields: [
          { name: "sensorId" },
        ]
      },
    ]
  });
};
