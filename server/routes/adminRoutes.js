const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// All routes below require admin role
router.use(verifyToken, requireRole(['admin']));

// Create doctor
router.post('/doctors', adminController.createDoctor);
// Update doctor
router.put('/doctors/:id', adminController.updateDoctor);
// Delete doctor
router.delete('/doctors/:id', adminController.deleteDoctor);
// Add schedule
router.post('/schedules', adminController.addSchedule);
// Get all appointments
router.get('/appointments', adminController.getAllAppointments);
// Manual booking
router.post('/appointments/manual', adminController.manualBooking);

// Patients management
router.get('/patients', adminController.getPatients);
router.put('/patients/:id', adminController.updatePatient);
router.delete('/patients/:id', adminController.deletePatient);

// Analytics
router.get('/analytics', adminController.getAnalytics);

module.exports = router;