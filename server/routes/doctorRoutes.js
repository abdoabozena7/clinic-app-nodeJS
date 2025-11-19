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

// Schedule management for doctors
// Get schedules for a doctor (doctor can view their own schedule)
router.get('/:id/schedules', verifyToken, requireRole(['doctor']), doctorController.getDoctorSchedules);
// Add a new availability entry for a doctor
router.post('/:id/schedules', verifyToken, requireRole(['doctor']), doctorController.addDoctorSchedule);
// Delete a schedule entry
router.delete('/schedules/:scheduleId', verifyToken, requireRole(['doctor']), doctorController.deleteDoctorSchedule);

module.exports = router;