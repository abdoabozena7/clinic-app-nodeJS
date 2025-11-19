const { User, Doctor, Schedule, Appointment } = require('../models');
const moment = require('moment');
const { Op } = require('sequelize');

// Create a new doctor (admin only)
exports.createDoctor = async (req, res) => {
  try {
    const { name, email, phone, password, specialty, bio, imageUrl } = req.body;
    if (!name || !email || !password || !specialty) {
      return res.status(400).json({ message: 'Name, email, password and specialty are required.' });
    }
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }
    const user = await User.create({ name, email, phone, password, role: 'doctor' });
    const doctor = await Doctor.create({ userId: user.id, specialty, bio: bio || '', imageUrl: imageUrl || '' });
    return res.status(201).json({ message: 'Doctor created successfully.', doctorId: doctor.id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Update doctor details
exports.updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, password, specialty, bio, imageUrl } = req.body;
    const doctor = await Doctor.findByPk(id, { include: [User] });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found.' });
    const user = doctor.User;
    // Update user details
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (password) user.password = password; // Will be hashed due to model hook
    await user.save();
    // Update doctor details
    if (specialty) doctor.specialty = specialty;
    if (bio) doctor.bio = bio;
    if (imageUrl) doctor.imageUrl = imageUrl;
    await doctor.save();
    return res.json({ message: 'Doctor updated.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Remove doctor
exports.deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findByPk(id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found.' });
    // Remove associated user and cascade deletes due to association
    const user = await User.findByPk(doctor.userId);
    await doctor.destroy();
    if (user) await user.destroy();
    return res.json({ message: 'Doctor removed.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Add a schedule slot for doctor
exports.addSchedule = async (req, res) => {
  try {
    const { doctorId, dayOfWeek, startTime, endTime, isBlocked } = req.body;
    if (doctorId === undefined || dayOfWeek === undefined || !startTime || !endTime) {
      return res.status(400).json({ message: 'doctorId, dayOfWeek, startTime and endTime are required.' });
    }
    // Validate dayOfWeek
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return res.status(400).json({ message: 'dayOfWeek must be between 0 (Sunday) and 6 (Saturday).' });
    }
    const schedule = await Schedule.create({ doctorId, dayOfWeek, startTime, endTime, isBlocked: !!isBlocked });
    return res.status(201).json({ message: 'Schedule added.', schedule });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all appointments (admin)
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      include: [
        {
          model: Doctor,
          include: [User],
        },
        {
          model: User,
          as: 'User',
        },
      ],
      order: [['startTime', 'ASC']],
    });
    const result = appointments.map((appt) => ({
      id: appt.id,
      patientName: appt.User?.name || '',
      doctorName: appt.Doctor?.User?.name || '',
      doctorSpecialty: appt.Doctor?.specialty || '',
      startTime: appt.startTime,
      endTime: appt.endTime,
      status: appt.status,
      reason: appt.reason,
    }));
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Manual booking (admin)
exports.manualBooking = async (req, res) => {
  try {
    const { doctorId, userId, date, time, reason } = req.body;
    if (!doctorId || !userId || !date || !time) {
      return res.status(400).json({ message: 'doctorId, userId, date and time are required.' });
    }
    const start = moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm');
    if (!start.isValid()) {
      return res.status(400).json({ message: 'Invalid date or time format.' });
    }
    const end = start.clone().add(1, 'hour');
    // Check schedule
    const dayOfWeek = start.day();
    const schedules = await Schedule.findAll({ where: { doctorId, dayOfWeek, isBlocked: false } });
    let withinSchedule = false;
    for (const sched of schedules) {
      const schedStart = moment(`${date} ${sched.startTime}`, 'YYYY-MM-DD HH:mm:ss');
      const schedEnd = moment(`${date} ${sched.endTime}`, 'YYYY-MM-DD HH:mm:ss');
      if (start.isSameOrAfter(schedStart) && end.isSameOrBefore(schedEnd)) {
        withinSchedule = true;
        break;
      }
    }
    if (!withinSchedule) {
      return res.status(400).json({ message: 'Selected time is outside of doctor working hours.' });
    }
    // Check for overlapping appointments
    const existing = await Appointment.findOne({
      where: {
        doctorId,
        status: 'scheduled',
        [Op.and]: [
          { startTime: { [Op.lt]: end.toDate() } },
          { endTime: { [Op.gt]: start.toDate() } },
        ],
      },
    });
    if (existing) {
      return res.status(400).json({ message: 'Time slot already booked.' });
    }
    const appointment = await Appointment.create({
      doctorId,
      userId,
      startTime: start.toDate(),
      endTime: end.toDate(),
      reason: reason || '',
      status: 'scheduled',
    });
    return res.status(201).json({ message: 'Appointment booked manually.', appointment });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all patients (admin)
exports.getPatients = async (req, res) => {
  try {
    const patients = await User.findAll({ where: { role: 'patient' } });
    const result = patients.map((user) => ({ id: user.id, name: user.name, email: user.email, phone: user.phone }));
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Update a patient (admin) – allows editing name, email, phone, password
exports.updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, password } = req.body;
    const user = await User.findByPk(id);
    if (!user || user.role !== 'patient') {
      return res.status(404).json({ message: 'Patient not found.' });
    }
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (password) user.password = password; // Will be hashed by hook
    await user.save();
    return res.json({ message: 'Patient updated.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a patient (admin)
exports.deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user || user.role !== 'patient') {
      return res.status(404).json({ message: 'Patient not found.' });
    }
    await user.destroy();
    return res.json({ message: 'Patient deleted.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Analytics: returns counts of appointments and cancellation rate and bookings per doctor
exports.getAnalytics = async (req, res) => {
  try {
    // Total appointments
    const total = await Appointment.count();
    const completed = await Appointment.count({ where: { status: 'completed' } });
    const cancelled = await Appointment.count({ where: { status: 'cancelled' } });
    const scheduled = await Appointment.count({ where: { status: 'scheduled' } });
    const cancellationRate = total > 0 ? cancelled / total : 0;
    // Appointments per doctor
    const appointments = await Appointment.findAll({
      attributes: ['doctorId', [require('sequelize').fn('COUNT', require('sequelize').col('doctorId')), 'count']],
      group: ['doctorId'],
    });
    // Map doctor IDs to names
    const doctors = await Doctor.findAll({ include: [User] });
    const doctorMap = {};
    doctors.forEach((d) => {
      doctorMap[d.id] = d.User?.name || `Doctor ${d.id}`;
    });
    const perDoctor = appointments.map((row) => ({ doctorId: row.doctorId, doctorName: doctorMap[row.doctorId] || '', count: row.get('count') }));
    return res.json({ total, scheduled, completed, cancelled, cancellationRate, perDoctor });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};