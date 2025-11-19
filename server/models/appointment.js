const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Appointment extends Model {}

  Appointment.init(
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
        allowNull: true,
      },
      startTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      reason: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        // Appointment status now supports additional states for reschedule and emergency workflows
        type: DataTypes.ENUM(
          'scheduled',
          'completed',
          'cancelled',
          // Patient has requested a reschedule but it is not yet approved by doctor/admin
          'pending_reschedule',
          // Emergency appointment requested by patient; awaiting approval
          'pending_emergency',
          // Emergency appointment approved by doctor/admin
          'confirmed_emergency',
          // Emergency appointment was rejected
          'rejected_emergency'
        ),
        defaultValue: 'scheduled',
      },
      // When manual bookings are created via phone without a registered patient, store the phone number here.
      manualPhone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Appointment',
      tableName: 'appointments',
    }
  );

  return Appointment;
};