const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// Register patient
router.post('/register', authController.register);
// Login
router.post('/login', authController.login);

// Request a password reset.  Sends a reset token (in production, via email)
router.post('/request-password-reset', authController.requestPasswordReset);
// Reset password using token
router.post('/reset-password', authController.resetPassword);

// Update profile of the currently authenticated user
router.put('/profile', verifyToken, authController.updateProfile);

module.exports = router;