const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class EmergencyRequest extends Model {}
  EmergencyRequest.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      doctorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      reason: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      acceptedByDoctor: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      acceptedByAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      rejected: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'EmergencyRequest',
      tableName: 'emergency_requests',
    }
  );
  return EmergencyRequest;
};