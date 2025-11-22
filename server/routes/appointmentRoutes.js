const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Get appointments for the logged-in user (patient)
router.get('/', verifyToken, requireRole(['patient']), appointmentController.getMyAppointments);

// Book appointment (patient)
router.post('/', verifyToken, requireRole(['patient']), appointmentController.createAppointment);

// Cancel appointment: patients can cancel their own appointment (>24h). Doctors can cancel their own appointments. Admins can cancel any.
router.delete('/:id', verifyToken, appointmentController.cancelAppointment);

// Reschedule or update appointment
// Patients can request reschedule; doctors and admins can reschedule immediately
router.put('/:id', verifyToken, requireRole(['patient', 'doctor', 'admin']), appointmentController.updateAppointment);

// Mark an appointment as completed (doctor or admin)
router.put('/:id/complete', verifyToken, requireRole(['doctor', 'admin']), appointmentController.completeAppointment);

module.exports = router;