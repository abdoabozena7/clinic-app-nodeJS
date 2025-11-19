const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// Multer setup for uploading profile photos.  Uploaded files will be stored in uploads/profile_photos
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'profile_photos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});
const upload = multer({ storage });

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

// Upload or change profile photo.  Expects multipart/form-data with a field named `photo`
router.post('/profile/photo', verifyToken, upload.single('photo'), authController.uploadProfilePhoto);

// Change password.  Requires currentPassword and newPassword fields.
router.put('/profile/password', verifyToken, authController.changePassword);

module.exports = router;