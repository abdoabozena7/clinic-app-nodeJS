const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Get all doctors
router.get('/', doctorController.getDoctors);

// Get doctor by id
router.get('/:id', doctorController.getDoctorById);

// Get availability
router.get('/:id/availability', doctorController.getDoctorAvailability);

// Doctor dashboard: get appointments for doctor
router.get('/:id/appointments', verifyToken, requireRole(['doctor','admin']), doctorController.getDoctorAppointments);

module.exports = router;