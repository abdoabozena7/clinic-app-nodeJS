const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Schedule extends Model {}

  Schedule.init(
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
      dayOfWeek: {
        // 0 = Sunday, 1 = Monday, ... 6 = Saturday
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      startTime: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      endTime: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      isBlocked: {
        // If true, this entire day is blocked (e.g., holiday)
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'Schedule',
      tableName: 'schedules',
    }
  );

  return Schedule;
};