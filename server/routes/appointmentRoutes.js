const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Get appointments for the logged-in user (patient)
router.get('/', verifyToken, requireRole(['patient']), appointmentController.getMyAppointments);

// Book appointment (patient)
router.post('/', verifyToken, requireRole(['patient']), appointmentController.createAppointment);

// Cancel appointment (patient)
router.delete('/:id', verifyToken, appointmentController.cancelAppointment);

module.exports = router;