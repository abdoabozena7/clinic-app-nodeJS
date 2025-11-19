const { RescheduleRequest, Appointment, Notification, Doctor, User } = require('../models');
const moment = require('moment');

/**
 * Approve a pending reschedule request.  Only doctors assigned to the appointment or admins can approve.
 * Updates the appointment times and marks the request as approved.  Notifications are sent to the
 * patient, doctor and admins.
 */
exports.approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await RescheduleRequest.findByPk(id);
    if (!request || request.status !== 'pending') {
      return res.status(404).json({ message: 'Reschedule request not found or already processed.' });
    }
    const userId = req.user.id;
    const role = req.user.role;
    // Ensure only doctor assigned to appointment or admin can approve
    if (role === 'doctor') {
      // Doctor must match the request's doctorId
      const doctor = await Doctor.findOne({ where: { userId }, include: [User] });
      if (!doctor || doctor.id !== request.doctorId) {
        return res.status(403).json({ message: 'You are not authorized to approve this request.' });
      }
    } else if (role !== 'admin') {
      return res.status(403).json({ message: 'Only doctors or admins can approve reschedule requests.' });
    }
    const appointment = await Appointment.findByPk(request.appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Associated appointment not found.' });
    }
    // Update appointment time and status
    appointment.startTime = request.newStartTime;
    appointment.endTime = request.newEndTime;
    appointment.status = 'scheduled';
    await appointment.save();
    // Update request status
    request.status = 'approved';
    request.decidedByUserId = userId;
    await request.save();
    // Send notifications
    try {
      const whenStr = moment(request.newStartTime).format('YYYY-MM-DD HH:mm');
      const patient = await User.findByPk(request.userId);
      const doctorUser = await User.findByPk(request.doctorId, { include: [Doctor] });
      // Notify patient
      await Notification.create({ userId: patient.id, message: `Your reschedule request for appointment #${appointment.id} has been approved. New time: ${whenStr}.` });
      // Notify doctor
      const doctor = await Doctor.findByPk(request.doctorId, { include: [User] });
      if (doctor && doctor.User) {
        await Notification.create({ userId: doctor.User.id, message: `Reschedule request for appointment #${appointment.id} approved.` });
      }
      // Notify admins
      const admins = await User.findAll({ where: { role: 'admin' } });
      await Notification.bulkCreate(admins.map((a) => ({ userId: a.id, message: `Reschedule request for appointment #${appointment.id} approved by ${role}.` })));
    } catch (err) {
      console.error('Notification error:', err);
    }
    return res.json({ message: 'Reschedule request approved.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Reject a pending reschedule request.  Only doctors assigned to the appointment or admins can reject.
 * Sets the appointment status back to scheduled and marks the request as rejected.  Optionally accepts
 * a rejection reason, which will be included in the notification to the patient.
 */
exports.rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const request = await RescheduleRequest.findByPk(id);
    if (!request || request.status !== 'pending') {
      return res.status(404).json({ message: 'Reschedule request not found or already processed.' });
    }
    const userId = req.user.id;
    const role = req.user.role;
    // Ensure only doctor or admin can reject
    if (role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId }, include: [User] });
      if (!doctor || doctor.id !== request.doctorId) {
        return res.status(403).json({ message: 'You are not authorized to reject this request.' });
      }
    } else if (role !== 'admin') {
      return res.status(403).json({ message: 'Only doctors or admins can reject reschedule requests.' });
    }
    const appointment = await Appointment.findByPk(request.appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Associated appointment not found.' });
    }
    // Reset appointment status to scheduled (times remain unchanged)
    appointment.status = 'scheduled';
    await appointment.save();
    // Update request status
    request.status = 'rejected';
    request.decidedByUserId = userId;
    await request.save();
    // Send notifications
    try {
      const patient = await User.findByPk(request.userId);
      const doctor = await Doctor.findByPk(request.doctorId, { include: [User] });
      const msgReason = reason ? ` Reason: ${reason}` : '';
      await Notification.create({ userId: patient.id, message: `Your reschedule request for appointment #${appointment.id} was rejected.${msgReason}` });
      if (doctor && doctor.User) {
        await Notification.create({ userId: doctor.User.id, message: `Reschedule request for appointment #${appointment.id} has been rejected.${msgReason}` });
      }
      const admins = await User.findAll({ where: { role: 'admin' } });
      await Notification.bulkCreate(admins.map((a) => ({ userId: a.id, message: `Reschedule request for appointment #${appointment.id} rejected by ${role}.` })));
    } catch (err) {
      console.error('Notification error:', err);
    }
    return res.json({ message: 'Reschedule request rejected.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};