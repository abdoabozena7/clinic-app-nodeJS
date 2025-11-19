import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

/**
 * BookingConfirm shows the final details of an appointment before it is
 * submitted to the backend.  It uses the location state passed from
 * DoctorProfile to display the selected doctor, date, time and price.
 */
export default function BookingConfirm() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!state || !state.doctor) {
    return <p>No booking information available.</p>;
  }
  const { doctor, date, time, reason } = state;

  const handleConfirm = async () => {
    setError('');
    setMessage('');
    try {
      const res = await api.post('/appointments', {
        doctorId: doctor.id,
        date,
        time,
        reason,
      });
      setMessage('Appointment booked successfully!');
      // Redirect to dashboard after a brief pause
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error booking appointment.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Confirm Your Appointment</h1>
      <div className="space-y-2 mb-4">
        <p>
          <strong>Doctor:</strong> {doctor.name} ({doctor.specialty})
        </p>
        {doctor.location && (
          <p>
            <strong>Location:</strong> {doctor.location}
          </p>
        )}
        {doctor.price && (
          <p>
            <strong>Consultation fee:</strong> ${doctor.price}
          </p>
        )}
        <p>
          <strong>Date:</strong> {date}
        </p>
        <p>
          <strong>Time:</strong> {time}
        </p>
        {reason && (
          <p>
            <strong>Reason:</strong> {reason}
          </p>
        )}
      </div>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {message && <p className="text-green-600 mb-2">{message}</p>}
      <button
        onClick={handleConfirm}
        className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition-colors"
      >
        Confirm Booking
      </button>
    </div>
  );
}