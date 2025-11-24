// routes/doctorRoutes.js
const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// ---------- Public doctor endpoints ----------
router.get('/', doctorController.getDoctors);
router.get('/:id', doctorController.getDoctorById);
router.get('/:id/availability', doctorController.getDoctorAvailability);

// ---------- Protected (doctor OR admin) ----------
router.get(
  '/:id/appointments',
  verifyToken,
  requireRole(['doctor', 'admin']),
  doctorController.getDoctorAppointments
);

router.get(
  '/:id/schedules',
  verifyToken,
  requireRole(['doctor', 'admin']),
  doctorController.getDoctorSchedules
);

router.post(
  '/:id/schedules',
  verifyToken,
  requireRole(['doctor', 'admin']),
  doctorController.addDoctorSchedule
);

router.delete(
  '/schedules/:scheduleId',
  verifyToken,
  requireRole(['doctor', 'admin']),
  doctorController.deleteDoctorSchedule
);

module.exports = router;
