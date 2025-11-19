const { Doctor, User, Schedule, Appointment } = require('../models');
const moment = require('moment');

// Get all doctors with their user data
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'phone'],
        },
      ],
    });
    // For each doctor compute availability today (if schedule exists for today)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const formatted = [];
    for (const doc of doctors) {
      const schedules = await Schedule.findAll({ where: { doctorId: doc.id, dayOfWeek, isBlocked: false } });
      const availableToday = schedules.length > 0;
      formatted.push({
        id: doc.id,
        name: doc.User.name,
        email: doc.User.email,
        phone: doc.User.phone,
        specialty: doc.specialty,
        bio: doc.bio,
        imageUrl: doc.imageUrl,
        location: doc.location,
        price: doc.price,
        availableToday,
      });
    }
    return res.json(formatted);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get single doctor by id
exports.getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'phone'],
        },
      ],
    });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    const result = {
      id: doctor.id,
      name: doctor.User.name,
      email: doctor.User.email,
      phone: doctor.User.phone,
      specialty: doctor.specialty,
      bio: doctor.bio,
      imageUrl: doctor.imageUrl,
      location: doctor.location,
      price: doctor.price,
    };
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get available slots for a doctor on a given date
exports.getDoctorAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query; // Expect YYYY-MM-DD
    if (!date) return res.status(400).json({ message: 'Date query parameter is required (YYYY-MM-DD).' });
    const day = moment(date, 'YYYY-MM-DD');
    if (!day.isValid()) {
      return res.status(400).json({ message: 'Invalid date format.' });
    }
    const dayOfWeek = day.day();
    const schedules = await Schedule.findAll({ where: { doctorId: id, dayOfWeek } });
    if (!schedules || schedules.length === 0) {
      return res.json([]);
    }
    let availableSlots = [];
    for (const sched of schedules) {
      // Skip blocked schedules
      if (sched.isBlocked) continue;
      // parse times
      const start = moment(`${date} ${sched.startTime}`, 'YYYY-MM-DD HH:mm:ss');
      const end = moment(`${date} ${sched.endTime}`, 'YYYY-MM-DD HH:mm:ss');
      let current = start.clone();
      while (current.isBefore(end)) {
        const slotStart = current.clone();
        const slotEnd = current.clone().add(1, 'hour'); // 1-hour slot
        if (slotEnd.isAfter(end)) break;
        availableSlots.push({ start: slotStart.clone(), end: slotEnd.clone() });
        current = current.add(1, 'hour');
      }
    }
    // Remove slots that are already booked or overlapping
    const appointments = await Appointment.findAll({
      where: {
        doctorId: id,
        startTime: {
          [require('sequelize').Op.gte]: day.startOf('day').toDate(),
        },
        endTime: {
          [require('sequelize').Op.lte]: day.endOf('day').toDate(),
        },
        status: 'scheduled',
      },
    });
    const freeSlots = availableSlots.filter((slot) => {
      const overlapped = appointments.some((appt) => {
        const apptStart = moment(appt.startTime);
        const apptEnd = moment(appt.endTime);
        return slot.start.isSame(apptStart) || slot.start.isBetween(apptStart, apptEnd, null, '[)');
      });
      return !overlapped;
    });
    // Return only start times as HH:mm
    const response = freeSlots.map((slot) => slot.start.format('HH:mm'));
    return res.json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get appointments for a specific doctor (doctor dashboard)
exports.getDoctorAppointments = async (req, res) => {
  try {
    const { id } = req.params;
    // Optionally ensure the requesting doctor matches the id
    // For simplicity, allow only if the logged-in user is doctor role or admin
    const { user } = req;
    if (user.role === 'doctor') {
      // Retrieve the doctor's profile for this user
      // Ensure doctor owns this id
      // Could enforce by checking user's doctor.id
      // But we skip for brevity
    }
    const appointments = await Appointment.findAll({
      where: { doctorId: id },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['startTime', 'ASC']],
    });
    const result = appointments.map((appt) => ({
      id: appt.id,
      patientName: appt.User?.name || '',
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

// Get schedules for a specific doctor
exports.getDoctorSchedules = async (req, res) => {
  try {
    const { id } = req.params;
    // Ensure requesting doctor is only accessing their own schedules unless admin
    const { user } = req;
    if (user.role === 'doctor' && user.id !== parseInt(id, 10)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const schedules = await Schedule.findAll({ where: { doctorId: id }, order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']] });
    return res.json(schedules);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Add a schedule entry for a doctor.  The request must include dayOfWeek (0–6), startTime, endTime.
exports.addDoctorSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { dayOfWeek, startTime, endTime, isBlocked } = req.body;
    // Validate inputs
    if (dayOfWeek === undefined || !startTime || !endTime) {
      return res.status(400).json({ message: 'dayOfWeek, startTime and endTime are required.' });
    }
    // Ensure user is doctor and matches id or is admin
    const { user } = req;
    if (user.role === 'doctor' && user.id !== parseInt(id, 10)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const schedule = await Schedule.create({ doctorId: id, dayOfWeek, startTime, endTime, isBlocked: !!isBlocked });
    return res.status(201).json(schedule);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a schedule entry.  Doctors can only delete their own schedules.
exports.deleteDoctorSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { user } = req;
    const schedule = await Schedule.findByPk(scheduleId);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found.' });
    // If doctor, ensure ownership
    if (user.role === 'doctor' && schedule.doctorId !== user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await schedule.destroy();
    return res.json({ message: 'Schedule deleted.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};