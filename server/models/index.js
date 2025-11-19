const sequelize = require('../config/database');

const UserModel = require('./user');
const DoctorModel = require('./doctor');
const ScheduleModel = require('./schedule');
const AppointmentModel = require('./appointment');

// Initialize models
const User = UserModel(sequelize);
const Doctor = DoctorModel(sequelize);
const Schedule = ScheduleModel(sequelize);
const Appointment = AppointmentModel(sequelize);

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

module.exports = {
  sequelize,
  User,
  Doctor,
  Schedule,
  Appointment,
};