const request = require('supertest');
const jwt = require('jsonwebtoken');
const { sequelize, User, Doctor, Appointment, RescheduleRequest, Schedule } = require('../models');

// Require the express app.  server.js exports the app for testing.
const app = require('../server');

describe('Appointment API', () => {
  let patientToken;
  let doctorToken;
  let adminToken;
  let appointmentId;
  let doctorId;

  // Seed database before tests
  beforeAll(async () => {
    // Sync DB and run migrations
    await sequelize.sync({ force: true });
    // Create users
    const admin = await User.create({ name: 'Test Admin', email: 'admin@test.com', password: 'admin123', role: 'admin' });
    const patient = await User.create({ name: 'Test Patient', email: 'patient@test.com', password: 'patient123', role: 'patient' });
    const doctorUser = await User.create({ name: 'Test Doctor', email: 'doctor@test.com', password: 'doctor123', role: 'doctor' });
    const doctor = await Doctor.create({ userId: doctorUser.id, specialty: 'Cardiology', price: 200 });
    doctorId = doctor.id;
    // Create schedules for doctor (Monday 9-17)
    await Schedule.create({ doctorId: doctor.id, dayOfWeek: 1, startTime: '09:00:00', endTime: '17:00:00' });
    // Issue JWTs
    patientToken = jwt.sign({ id: patient.id, role: 'patient' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    doctorToken = jwt.sign({ id: doctorUser.id, role: 'doctor' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    adminToken = jwt.sign({ id: admin.id, role: 'admin' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
  });

  test('Patient creates and reschedules appointment (pending approval)', async () => {
    // Patient books appointment
    const resBook = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ doctorId, date: '2030-01-02', time: '10:00', reason: 'Test' });
    expect(resBook.statusCode).toBe(201);
    appointmentId = resBook.body.appointment.id;
    // Patient requests reschedule for >24h
    const resResched = await request(app)
      .put(`/api/appointments/${appointmentId}`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ date: '2030-01-03', time: '11:00' });
    expect(resResched.statusCode).toBe(200);
    expect(resResched.body.message).toMatch(/pending approval/);
    const appt = await Appointment.findByPk(appointmentId);
    expect(appt.status).toBe('pending_reschedule');
    const requests = await RescheduleRequest.findAll({ where: { appointmentId } });
    expect(requests.length).toBe(1);
  });

  test('Admin manual booking with phone creates appointment', async () => {
    const res = await request(app)
      .post('/api/admin/appointments/manual')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ doctorId, phone: '0123456789', date: '2030-01-04', time: '09:00', reason: 'Manual call' });
    expect(res.statusCode).toBe(201);
    expect(res.body.appointment.manualPhone).toBe('0123456789');
  });
});