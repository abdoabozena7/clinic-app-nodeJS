const { DataTypes, Model } = require('sequelize');

/**
 * RescheduleRequest model represents a pending reschedule operation initiated by a patient.
 * A doctor or admin must approve or reject the request before the appointment is updated.
 */
module.exports = (sequelize) => {
  class RescheduleRequest extends Model {}

  RescheduleRequest.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      // The appointment to be rescheduled
      appointmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      // User (patient) who requested the reschedule
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      // The doctor assigned to the appointment
      doctorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      newStartTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      newEndTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      // Status of the reschedule request: pending, approved, or rejected
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
      },
      // User (doctor or admin) who approved/rejected the request
      decidedByUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'RescheduleRequest',
      tableName: 'reschedule_requests',
      timestamps: true,
    }
  );

  return RescheduleRequest;
};