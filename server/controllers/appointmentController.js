const { Appointment, Schedule, Doctor, User } = require('../models');
const moment = require('moment');
const { Op } = require('sequelize');

// Create a new appointment (patient booking)
exports.createAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { doctorId, date, time, reason } = req.body;
    if (!doctorId || !date || !time) {
      return res.status(400).json({ message: 'doctorId, date, and time are required.' });
    }
    const start = moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm');
    if (!start.isValid()) {
      return res.status(400).json({ message: 'Invalid date or time format.' });
    }
    const end = start.clone().add(1, 'hour');
    // Check schedule: ensure doctor works at this time
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
    // Check for double booking
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
    // Create appointment
    const appointment = await Appointment.create({
      doctorId,
      userId,
      startTime: start.toDate(),
      endTime: end.toDate(),
      reason: reason || '',
      status: 'scheduled',
    });
    return res.status(201).json({ message: 'Appointment booked successfully.', appointment });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get appointments for logged-in user (patient)
exports.getMyAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const appointments = await Appointment.findAll({
      where: { userId },
      include: [
        {
          model: Doctor,
          include: [User],
        },
      ],
      order: [['startTime', 'ASC']],
    });
    const result = appointments.map((appt) => {
      const status = appt.status;
      return {
        id: appt.id,
        doctorName: appt.Doctor?.User?.name || '',
        doctorSpecialty: appt.Doctor?.specialty || '',
        startTime: appt.startTime,
        endTime: appt.endTime,
        status: status,
        reason: appt.reason,
      };
    });
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Cancel appointment (patient or admin can call)
exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }
    // Only allow patient to cancel their own appointment or admin/staff
    if (userRole === 'patient' && appointment.userId !== userId) {
      return res.status(403).json({ message: 'You are not authorized to cancel this appointment.' });
    }
    // Check if within 24 hours
    const now = moment();
    const apptTime = moment(appointment.startTime);
    const hoursDiff = apptTime.diff(now, 'hours');
    if (hoursDiff < 24 && userRole === 'patient') {
      return res.status(400).json({ message: 'Cannot cancel within 24 hours of the appointment.' });
    }
    appointment.status = 'cancelled';
    await appointment.save();
    return res.json({ message: 'Appointment cancelled.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Update/reschedule an appointment
// Patients can reschedule their own future appointments (>24h before start), and admins can reschedule any.
exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time } = req.body;
    if (!date || !time) {
      return res.status(400).json({ message: 'date and time are required.' });
    }
    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }
    const userId = req.user.id;
    const role = req.user.role;
    // Only the appointment owner or admin can reschedule
    if (role === 'patient' && appointment.userId !== userId) {
      return res.status(403).json({ message: 'You are not authorized to reschedule this appointment.' });
    }
    const newStart = moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm');
    if (!newStart.isValid()) {
      return res.status(400).json({ message: 'Invalid date or time format.' });
    }
    const newEnd = newStart.clone().add(1, 'hour');
    // If patient, ensure the appointment is >24h away from now
    if (role === 'patient') {
      const now = moment();
      const diff = moment(appointment.startTime).diff(now, 'hours');
      if (diff < 24) {
        return res.status(400).json({ message: 'Cannot reschedule within 24 hours of appointment time.' });
      }
    }
    // Ensure the new slot is within doctor's working hours
    const doctorId = appointment.doctorId;
    const dayOfWeek = newStart.day();
    const schedules = await Schedule.findAll({ where: { doctorId, dayOfWeek, isBlocked: false } });
    let withinSchedule = false;
    for (const sched of schedules) {
      const schedStart = moment(`${date} ${sched.startTime}`, 'YYYY-MM-DD HH:mm:ss');
      const schedEnd = moment(`${date} ${sched.endTime}`, 'YYYY-MM-DD HH:mm:ss');
      if (newStart.isSameOrAfter(schedStart) && newEnd.isSameOrBefore(schedEnd)) {
        withinSchedule = true;
        break;
      }
    }
    if (!withinSchedule) {
      return res.status(400).json({ message: 'Selected time is outside of doctor working hours.' });
    }
    // Check for overlapping appointments (excluding this appointment)
    const existing = await Appointment.findOne({
      where: {
        id: { [Op.ne]: id },
        doctorId,
        status: 'scheduled',
        [Op.and]: [
          { startTime: { [Op.lt]: newEnd.toDate() } },
          { endTime: { [Op.gt]: newStart.toDate() } },
        ],
      },
    });
    if (existing) {
      return res.status(400).json({ message: 'New time slot overlaps with an existing appointment.' });
    }
    // Update the appointment
    appointment.startTime = newStart.toDate();
    appointment.endTime = newEnd.toDate();
    appointment.status = 'scheduled';
    await appointment.save();
    return res.json({ message: 'Appointment rescheduled.', appointment });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};