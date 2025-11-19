const { EmergencyRequest, Schedule, Appointment, Notification, Doctor, User } = require('../models');
const moment = require('moment');

// Patient requests an emergency appointment
exports.createEmergencyRequest = async (req, res) => {
  try {
    const { doctorId, date, time, reason } = req.body;
    const userId = req.user.id;
    if (!doctorId || !date || !time) {
      return res.status(400).json({ message: 'doctorId, date and time are required.' });
    }
    // Create request
    const request = await EmergencyRequest.create({ doctorId, userId, date, time, reason });
    // Notify doctor and admin
    // Find admin user(s) – simplest: all users with role admin
    const admins = await User.findAll({ where: { role: 'admin' } });
    const doctor = await Doctor.findByPk(doctorId, { include: [User] });
    const message = `Emergency appointment requested by user #${userId} for ${date} ${time}`;
    // Create notifications
    await Notification.bulkCreate([
      // Notify doctor
      { userId: doctor.User.id, message },
      // Notify all admins
      ...admins.map((a) => ({ userId: a.id, message })),
    ]);
    return res.status(201).json({ message: 'Emergency request submitted.', request });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Doctor responds to an emergency request
exports.doctorRespond = async (req, res) => {
  try {
    const { id } = req.params;
    const { accept } = req.body; // boolean
    const userId = req.user.id;
    const request = await EmergencyRequest.findByPk(id);
    if (!request) return res.status(404).json({ message: 'Request not found.' });
    // Ensure this doctor owns the request
    const doctor = await Doctor.findOne({ where: { userId } });
    if (!doctor || doctor.id !== request.doctorId) {
      return res.status(403).json({ message: 'Not your request.' });
    }
    if (request.rejected) return res.status(400).json({ message: 'Request already rejected.' });
    if (request.acceptedByDoctor) return res.status(400).json({ message: 'Request already responded by doctor.' });
    if (accept) {
      request.acceptedByDoctor = true;
      await request.save();
      await Notification.create({ userId: request.userId, message: 'Doctor approved your emergency request. Await admin approval.' });
    } else {
      request.rejected = true;
      await request.save();
      await Notification.create({ userId: request.userId, message: 'Doctor rejected your emergency request.' });
    }
    return res.json({ message: 'Response recorded.', request });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Admin responds to an emergency request
exports.adminRespond = async (req, res) => {
  try {
    const { id } = req.params;
    const { accept } = req.body; // boolean
    const request = await EmergencyRequest.findByPk(id);
    if (!request) return res.status(404).json({ message: 'Request not found.' });
    if (request.rejected) return res.status(400).json({ message: 'Request already rejected.' });
    if (request.acceptedByAdmin) return res.status(400).json({ message: 'Request already responded by admin.' });
    if (accept) {
      request.acceptedByAdmin = true;
      await request.save();
      await Notification.create({ userId: request.userId, message: 'Admin approved your emergency request.' });
      // If doctor has already accepted, we can schedule the appointment automatically
      if (request.acceptedByDoctor) {
        // Create appointment if free slot available
        const start = moment(`${request.date} ${request.time}`, 'YYYY-MM-DD HH:mm:ss');
        const end = start.clone().add(1, 'hour');
        // Check for overlapping appointments
        const overlapping = await Appointment.findOne({
          where: {
            doctorId: request.doctorId,
            status: 'scheduled',
            [require('sequelize').Op.and]: [
              { startTime: { [require('sequelize').Op.lt]: end.toDate() } },
              { endTime: { [require('sequelize').Op.gt]: start.toDate() } },
            ],
          },
        });
        if (!overlapping) {
          await Appointment.create({
            doctorId: request.doctorId,
            userId: request.userId,
            startTime: start.toDate(),
            endTime: end.toDate(),
            reason: request.reason || 'Emergency',
            status: 'scheduled',
          });
          await Notification.create({ userId: request.userId, message: 'Your emergency appointment has been scheduled.' });
        }
      }
    } else {
      request.rejected = true;
      await request.save();
      await Notification.create({ userId: request.userId, message: 'Admin rejected your emergency request.' });
    }
    return res.json({ message: 'Response recorded.', request });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};