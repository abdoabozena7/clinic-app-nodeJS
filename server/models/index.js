const sequelize = require('../config/database');

const UserModel = require('./user');
const DoctorModel = require('./doctor');
const ScheduleModel = require('./schedule');
const AppointmentModel = require('./appointment');
const NotificationModel = require('./notification');
const EmergencyRequestModel = require('./emergencyRequest');
const RescheduleRequestModel = require('./rescheduleRequest');

// Initialize models
const User = UserModel(sequelize);
const Doctor = DoctorModel(sequelize);
const Schedule = ScheduleModel(sequelize);
const Appointment = AppointmentModel(sequelize);
const Notification = NotificationModel(sequelize);
const EmergencyRequest = EmergencyRequestModel(sequelize);
const RescheduleRequest = RescheduleRequestModel(sequelize);

// Define associations
// A user can have a doctor profile (if role === doctor)
User.hasOne(Doctor, { foreignKey: 'userId', onDelete: 'CASCADE' });
Doctor.belongsTo(User, { foreignKey: 'userId' });

// Doctor schedules
Doctor.hasMany(Schedule, { foreignKey: 'doctorId', onDelete: 'CASCADE' });
Schedule.belongsTo(Doctor, { foreignKey: 'doctorId' });

// Doctor appointments
Doctor.hasMany(Appointment, { foreignKey: 'doctorId', onDelete: 'CASCADE' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId' });

// User (patient) appointments
User.hasMany(Appointment, { foreignKey: 'userId', onDelete: 'CASCADE' });
Appointment.belongsTo(User, { foreignKey: 'userId' });

// Notifications
User.hasMany(Notification, { foreignKey: 'userId', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId' });

// Emergency requests associations
User.hasMany(EmergencyRequest, { foreignKey: 'userId', onDelete: 'CASCADE' });
EmergencyRequest.belongsTo(User, { foreignKey: 'userId' });
Doctor.hasMany(EmergencyRequest, { foreignKey: 'doctorId', onDelete: 'CASCADE' });
EmergencyRequest.belongsTo(Doctor, { foreignKey: 'doctorId' });

// Reschedule requests associations
// An appointment may have many reschedule requests over its lifetime
Appointment.hasMany(RescheduleRequest, { foreignKey: 'appointmentId', onDelete: 'CASCADE' });
RescheduleRequest.belongsTo(Appointment, { foreignKey: 'appointmentId' });
// A user (patient) can create many reschedule requests
User.hasMany(RescheduleRequest, { foreignKey: 'userId', onDelete: 'CASCADE' });
RescheduleRequest.belongsTo(User, { foreignKey: 'userId' });
// A doctor receives reschedule requests for their appointments
Doctor.hasMany(RescheduleRequest, { foreignKey: 'doctorId', onDelete: 'CASCADE' });
RescheduleRequest.belongsTo(Doctor, { foreignKey: 'doctorId' });

module.exports = {
  sequelize,
  User,
  Doctor,
  Schedule,
  Appointment,
  Notification,
  EmergencyRequest,
  RescheduleRequest,
};