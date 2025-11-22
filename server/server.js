const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/database');
const { User, Doctor, Schedule, Appointment } = require('./models');
const { Notification } = require('./models');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const rescheduleRoutes = require('./routes/rescheduleRoutes');

app.get('/', (req, res) => {
  res.json({ message: 'Medical Center Reservation System API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/reschedule-requests', rescheduleRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// Start the server after syncing the database
const PORT = process.env.PORT || 5000;
sequelize
  // Use alter:true to automatically update tables to match model definitions (e.g., add resetToken columns)
  .sync({ alter: true })
  .then(() => {
    console.log('Database synchronized');
    // Only start listening if not running in a test environment
    if (process.env.NODE_ENV !== 'test') {
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    }
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

// Export app for testing purposes
module.exports = app;