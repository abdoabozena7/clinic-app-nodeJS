const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/authMiddleware');

// All notification routes require authentication
router.use(verifyToken);

// Get notifications for the logged-in user
router.get('/', notificationController.getNotifications);

// Mark a single notification as read.  Accept both PUT and POST for flexibility
router.put('/:id/read', notificationController.markAsRead);
router.post('/:id/read', notificationController.markAsRead);

// Mark all notifications as read.  Accept both PUT and POST
router.put('/read-all', notificationController.markAllAsRead);
router.post('/read-all', notificationController.markAllAsRead);

module.exports = router;