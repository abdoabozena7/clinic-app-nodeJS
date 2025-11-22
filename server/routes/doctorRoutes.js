// routes/doctorRoutes.js
const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const auth = require('../middleware/auth');

// Public doctor endpoints
router.get('/', doctorController.getDoctors);
router.get('/:id', doctorController.getDoctorById);
router.get('/:id/availability', doctorController.getDoctorAvailability);

// Protected – doctor or admin
router.get('/:id/appointments', auth, doctorController.getDoctorAppointments);

// Schedules – doctor/admin
router.get('/:id/schedules', auth, doctorController.getDoctorSchedules);
router.post('/:id/schedules', auth, doctorController.addDoctorSchedule);
router.delete('/schedules/:scheduleId', auth, doctorController.deleteDoctorSchedule);

module.exports = router;
