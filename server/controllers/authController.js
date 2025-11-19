const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { User } = require('../models');

// Load environment variables
dotenv.config();

// Register a new patient user
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }

    // Check if user already exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: 'patient',
    });

    return res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Login and generate JWT
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const validPassword = await user.checkPassword(password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const payload = {
      id: user.id,
      role: user.role,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Request a password reset.  Generate a token and set expiration on the user record.
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // To avoid revealing which emails exist, respond with success anyway.
      return res.json({ message: 'If an account with that email exists, a reset email has been sent.' });
    }
    // Generate a secure random token
    const crypto = require('crypto');
    const buffer = crypto.randomBytes(32);
    const token = buffer.toString('hex');
    const expiration = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
    user.resetToken = token;
    user.resetTokenExpiration = expiration;
    await user.save();
    // In a real system we would send an email with the reset link containing the token.
    // For now, just return the token in the response for testing.
    return res.json({ message: 'Password reset requested.', token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Reset the user's password using the token.  The request should include token and new password.
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and newPassword are required.' });
    }
    const user = await User.findOne({ where: { resetToken: token } });
    if (!user || !user.resetTokenExpiration || user.resetTokenExpiration < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }
    // Set new password and clear reset fields.  Hooks will hash password automatically.
    user.password = newPassword;
    user.resetToken = null;
    user.resetTokenExpiration = null;
    await user.save();
    return res.json({ message: 'Password has been reset.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Update profile for currently authenticated user.  Allows changing
// name, email, phone, and optionally password.  If email is changed,
// ensure it isn't already taken by another user.  Password will be
// hashed automatically by model hooks.
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    // If updating email, ensure it is not taken by another user
    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing && existing.id !== userId) {
        return res.status(400).json({ message: 'Email already in use.' });
      }
      user.email = email;
    }
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (password) user.password = password;
    await user.save();
    return res.json({ message: 'Profile updated successfully', user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};