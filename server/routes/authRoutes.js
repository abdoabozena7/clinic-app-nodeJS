const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register patient
router.post('/register', authController.register);
// Login
router.post('/login', authController.login);

// Request a password reset.  Sends a reset token (in production, via email)
router.post('/request-password-reset', authController.requestPasswordReset);
// Reset password using token
router.post('/reset-password', authController.resetPassword);

module.exports = router;