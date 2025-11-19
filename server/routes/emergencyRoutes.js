const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// All endpoints require authentication
router.use(verifyToken);

// Patient requests an emergency appointment
router.post('/', requireRole(['patient']), emergencyController.createEmergencyRequest);

// Doctor responds (accept/reject)
router.put('/:id/doctor', requireRole(['doctor']), emergencyController.doctorRespond);

// Admin responds (accept/reject)
router.put('/:id/admin', requireRole(['admin']), emergencyController.adminRespond);

module.exports = router;