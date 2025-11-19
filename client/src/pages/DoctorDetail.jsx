import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

export default function DoctorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [times, setTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDoctor() {
      try {
        const res = await api.get(`/doctors/${id}`);
        setDoctor(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchDoctor();
  }, [id]);

  useEffect(() => {
    async function fetchAvailability() {
      try {
        if (!date) return;
        const res = await api.get(`/doctors/${id}/availability`, { params: { date } });
        setTimes(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchAvailability();
  }, [id, date]);

  const handleBooking = async () => {
    setError('');
    setMessage('');
    if (!user) {
      setError('You must be logged in as a patient to book an appointment.');
      return;
    }
    try {
      const res = await api.post('/appointments', {
        doctorId: id,
        date,
        time: selectedTime,
        reason,
      });
      setMessage('Appointment booked successfully!');
      // Redirect to dashboard after a delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('An error occurred while booking.');
      }
    }
  };

  return (
    <div>
      {doctor ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-2xl font-bold mb-2">{doctor.name}</h1>
          <p className="text-gray-600 mb-1">{doctor.specialty}</p>
          <p className="mb-4">{doctor.bio}</p>
          <div className="mb-4">
            <label htmlFor="date" className="block mb-1 font-medium">
              Select a date
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border p-2 rounded"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          {times.length > 0 && (
            <div className="mb-4">
              <label className="block mb-1 font-medium">Select a time</label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="">-- Select time --</option>
                {times.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}
          {selectedTime && (
            <div className="mb-4">
              <label className="block mb-1 font-medium">Reason (optional)</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="border p-2 rounded w-full"
                placeholder="Describe your reason for visit"
              />
            </div>
          )}
          {error && <p className="text-red-500 mb-2">{error}</p>}
          {message && <p className="text-green-600 mb-2">{message}</p>}
          {selectedTime && (
            <button
              onClick={handleBooking}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors"
            >
              Book Appointment
            </button>
          )}
        </motion.div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}