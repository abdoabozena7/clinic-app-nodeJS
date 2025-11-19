-- SQL schema and seed data for the Medical Center Reservation System

-- Create the database and select it
CREATE DATABASE IF NOT EXISTS clinic_db;
USE clinic_db;

-- Users table: stores patients, doctors and admins
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  password VARCHAR(255) NOT NULL,
  role ENUM('patient','doctor','admin') NOT NULL DEFAULT 'patient',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Doctors table: extended info for users with role = 'doctor'
CREATE TABLE IF NOT EXISTS doctors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  specialty VARCHAR(255) NOT NULL,
  bio TEXT,
  imageUrl VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Schedules table: defines working hours for each doctor per day of week
CREATE TABLE IF NOT EXISTS schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  doctorId INT NOT NULL,
  dayOfWeek INT NOT NULL,
  startTime TIME NOT NULL,
  endTime TIME NOT NULL,
  isBlocked BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (doctorId) REFERENCES doctors(id) ON DELETE CASCADE
);

-- Appointments table: stores booked appointments
CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  doctorId INT NOT NULL,
  userId INT NOT NULL,
  startTime DATETIME NOT NULL,
  endTime DATETIME NOT NULL,
  reason VARCHAR(255),
  status ENUM('scheduled','completed','cancelled') DEFAULT 'scheduled',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (doctorId) REFERENCES doctors(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert initial users: one admin, three doctors, and one patient
INSERT INTO users (name, email, phone, password, role) VALUES
  ('Admin User', 'admin@example.com', '01000000000', 'admin123', 'admin'),
  ('Dr. Alice', 'alice@example.com', '01000000001', 'doctor123', 'doctor'),
  ('Dr. Bob', 'bob@example.com', '01000000002', 'doctor123', 'doctor'),
  ('Dr. Charlie', 'charlie@example.com', '01000000003', 'doctor123', 'doctor'),
  ('John Doe', 'john@example.com', '01000000004', 'patient123', 'patient');

-- Insert doctor profiles referencing the corresponding users
INSERT INTO doctors (userId, specialty, bio, imageUrl) VALUES
  (2, 'Cardiology', 'Experienced cardiologist.', ''),
  (3, 'Pediatrics', 'Expert pediatrician.', ''),
  (4, 'Dermatology', 'Skin specialist.', '');

-- Insert schedules for doctors
-- Doctor 1: Dr. Alice works Monday–Friday, 9 AM–5 PM
INSERT INTO schedules (doctorId, dayOfWeek, startTime, endTime) VALUES
  (1, 1, '09:00:00', '17:00:00'),
  (1, 2, '09:00:00', '17:00:00'),
  (1, 3, '09:00:00', '17:00:00'),
  (1, 4, '09:00:00', '17:00:00'),
  (1, 5, '09:00:00', '17:00:00');

-- Doctor 2: Dr. Bob works Monday, Wednesday & Friday, 10 AM–4 PM
INSERT INTO schedules (doctorId, dayOfWeek, startTime, endTime) VALUES
  (2, 1, '10:00:00', '16:00:00'),
  (2, 3, '10:00:00', '16:00:00'),
  (2, 5, '10:00:00', '16:00:00');

-- Doctor 3: Dr. Charlie works Tuesday & Thursday, 8 AM–2 PM
INSERT INTO schedules (doctorId, dayOfWeek, startTime, endTime) VALUES
  (3, 2, '08:00:00', '14:00:00'),
  (3, 4, '08:00:00', '14:00:00');

-- Insert sample appointments for testing (booked by John Doe)
INSERT INTO appointments (doctorId, userId, startTime, endTime, reason, status) VALUES
  (1, 5, '2025-11-18 10:00:00', '2025-11-18 11:00:00', 'Routine check', 'scheduled'),
  (1, 5, '2025-11-19 11:00:00', '2025-11-19 12:00:00', 'Follow up', 'scheduled'),
  (2, 5, '2025-11-20 14:00:00', '2025-11-20 15:00:00', 'Consultation', 'scheduled'),
  (3, 5, '2025-11-21 09:00:00', '2025-11-21 10:00:00', 'Skin issue', 'scheduled'),
  (2, 5, '2025-11-22 10:00:00', '2025-11-22 11:00:00', 'Vaccination', 'scheduled');