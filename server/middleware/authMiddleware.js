const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { User } = require('../models');

// Load env variables
dotenv.config();

// Middleware to verify JWT token
exports.verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    req.user = { id: user.id, role: user.role, name: user.name };
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

// Middleware to restrict access by role
exports.requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    next();
  };
};