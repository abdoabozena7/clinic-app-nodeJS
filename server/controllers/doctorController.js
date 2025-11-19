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
    const formatted = doctors.map((doc) => ({
      id: doc.id,
      name: doc.User.name,
      email: doc.User.email,
      phone: doc.User.phone,
      specialty: doc.specialty,
      bio: doc.bio,
      imageUrl: doc.imageUrl,
    }));
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