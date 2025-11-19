const express = require('express');
const router = express.Router();
const rescheduleController = require('../controllers/rescheduleController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Approve a reschedule request.  Only doctors or admins can approve.
router.post('/:id/approve', verifyToken, requireRole(['doctor', 'admin']), rescheduleController.approveRequest);

// Reject a reschedule request.  Only doctors or admins can reject.
router.post('/:id/reject', verifyToken, requireRole(['doctor', 'admin']), rescheduleController.rejectRequest);

module.exports = router;