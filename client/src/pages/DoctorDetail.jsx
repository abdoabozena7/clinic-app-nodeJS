import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

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
    async function loadDoctor() {
      try {
        const res = await api.get(`/doctors/${id}`);
        setDoctor(res.data);
      } catch {}
    }
    loadDoctor();
  }, [id]);

  useEffect(() => {
    async function loadAvailability() {
      try {
        const res = await api.get(`/doctors/${id}/availability`, { params: { date } });
        setTimes(res.data);
      } catch {}
    }
    if (date) loadAvailability();
  }, [id, date]);

  const handleBooking = async () => {
    setError('');
    setMessage('');
    if (!user) {
      setError('You must be logged in as a patient to book an appointment.');
      return;
    }
    try {
      await api.post('/appointments', {
        doctorId: id,
        date,
        time: selectedTime,
        reason,
      });
      setMessage('Appointment booked successfully!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      if (err.response?.data?.message) setError(err.response.data.message);
      else setError('An error occurred while booking.');
    }
  };

  if (!doctor) return <p className="pt-20">Loading...</p>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto pt-24 pb-16 px-6"
    >
      <div className="bg-white rounded-2xl shadow-large p-8 flex flex-col md:flex-row gap-10">
        <div className="flex flex-col items-center md:w-1/3">
          <img
            src={doctor.image || 'https://via.placeholder.com/200'}
            alt={doctor.name}
            className="w-40 h-40 rounded-full object-cover shadow-medium mb-4"
          />
          <h1 className="text-2xl font-bold text-dark">{doctor.name}</h1>
          <p className="text-text-light text-sm mt-1">{doctor.specialty}</p>

          <div className="flex items-center gap-1 mt-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={20}
                className={s <= (doctor.rating || 4) ? 'text-yellow-400' : 'text-gray-300'}
                fill={s <= (doctor.rating || 4) ? 'currentColor' : 'none'}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-6">
          <p className="text-dark leading-relaxed">{doctor.bio}</p>

          <div>
            <label className="font-medium">Choose Date</label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
              className="mt-2 w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
            />
          </div>

          {times.length > 0 && (
            <div>
              <label className="font-medium">Available Times</label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="mt-2 w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
              >
                <option value="">Select a time</option>
                {times.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedTime && (
            <div>
              <label className="font-medium">Reason</label>
              <input
                type="text"
                placeholder="Describe your reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-2 w-full border rounded-lg px-3 py-2"
              />
            </div>
          )}

          {error && <p className="text-red-500">{error}</p>}
          {message && <p className="text-green-600">{message}</p>}

          {selectedTime && (
            <button
              onClick={handleBooking}
              className="w-full mt-4 bg-primary text-white py-3 rounded-lg hover:bg-accent transition"
            >
              Book Appointment
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}