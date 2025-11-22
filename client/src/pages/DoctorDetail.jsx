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

  if (!doctor) return <p className="pt-20 text-center">Loading...</p>;

  // 🌟 كارت زجاجي (blur + borders + shadow)
  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.82)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.9)',
    boxShadow: '0 24px 60px rgba(15, 23, 42, 0.25)',
  };

  const pageStyle = {
    minHeight: '100vh',
    paddingTop: '96px',
    paddingBottom: '64px',
    paddingInline: '1.5rem',
    display: 'flex',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #e0f2fe 0%, #eef2ff 35%, #fdf2ff 100%)',
  };

  const avatarWrapper = {
    position: 'relative',
    marginBottom: '20px',
  };

  const avatarGlow = {
    position: 'absolute',
    inset: '-8px',
    borderRadius: '999px',
    background:
      'radial-gradient(circle at 0% 0%, rgba(59,130,246,0.35), transparent 60%), radial-gradient(circle at 100% 100%, rgba(56,189,248,0.35), transparent 60%)',
    filter: 'blur(12px)',
    zIndex: 0,
  };

  const avatarImg = {
    width: '160px',
    height: '160px',
    borderRadius: '999px',
    objectFit: 'cover',
    border: '4px solid #ffffff',
    boxShadow: '0 18px 45px rgba(15,23,42,0.25)',
    position: 'relative',
    zIndex: 1,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={pageStyle}
    >
      <div style={cardStyle} className="max-w-4xl w-full p-6 md:p-8 flex flex-col md:flex-row gap-10">
        {/* left: doctor info */}
        <div className="flex flex-col items-center md:w-1/3 text-center">
          <div style={avatarWrapper}>
            <div style={avatarGlow} />
            <img
              src={doctor.image || 'https://via.placeholder.com/200'}
              alt={doctor.name}
              style={avatarImg}
            />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{doctor.name}</h1>
          <p
            className="mt-2 text-sm font-medium text-gray-700 px-3 py-1 rounded-full"
            style={{
              background: 'rgba(255,255,255,0.95)',
              border: '1px solid rgba(226,232,240,0.9)',
            }}
          >
            {doctor.specialty}
          </p>

          <div className="flex items-center gap-1 mt-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={20}
                className={s <= (doctor.rating || 4) ? 'text-yellow-400' : 'text-gray-300'}
                fill={s <= (doctor.rating || 4) ? 'currentColor' : 'none'}
              />
            ))}
            <span className="ml-2 text-xs text-gray-600">
              {doctor.rating ? doctor.rating.toFixed(1) : '4.0'} / 5
            </span>
          </div>
        </div>

        {/* right: bio + booking */}
        <div className="flex-1 space-y-6">
          <div
            className="text-sm md:text-base text-gray-800 leading-relaxed"
            style={{
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '18px',
              border: '1px solid rgba(226,232,240,0.9)',
              padding: '12px 16px',
            }}
          >
            {doctor.bio || 'No bio available for this doctor yet.'}
          </div>

          {/* date + time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="font-medium text-sm text-gray-700">Choose Date</label>
              <input
                type="date"
                value={date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-sm text-gray-800"
                style={{
                  borderRadius: '14px',
                  border: '1px solid rgba(209,213,219,0.9)',
                  padding: '8px 10px',
                  background: 'rgba(255,255,255,0.95)',
                  outline: 'none',
                }}
              />
            </div>

            {times.length > 0 && (
              <div className="space-y-2">
                <label className="font-medium text-sm text-gray-700">Available Times</label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full text-sm text-gray-800"
                  style={{
                    borderRadius: '14px',
                    border: '1px solid rgba(209,213,219,0.9)',
                    padding: '8px 10px',
                    background: 'rgba(255,255,255,0.95)',
                    outline: 'none',
                  }}
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
          </div>

          {/* reason */}
          {selectedTime && (
            <div className="space-y-2">
              <label className="font-medium text-sm text-gray-700">Reason</label>
              <input
                type="text"
                placeholder="Describe your reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-sm text-gray-800"
                style={{
                  borderRadius: '14px',
                  border: '1px solid rgba(209,213,219,0.9)',
                  padding: '8px 10px',
                  background: 'rgba(255,255,255,0.95)',
                  outline: 'none',
                }}
              />
            </div>
          )}

          {/* messages */}
          {error && (
            <p
              className="text-sm"
              style={{
                color: '#dc2626',
                background: 'rgba(254,242,242,0.95)',
                borderRadius: '12px',
                padding: '8px 12px',
                border: '1px solid rgba(254,202,202,0.9)',
              }}
            >
              {error}
            </p>
          )}

          {message && (
            <p
              className="text-sm"
              style={{
                color: '#16a34a',
                background: 'rgba(240,253,244,0.95)',
                borderRadius: '12px',
                padding: '8px 12px',
                border: '1px solid rgba(187,247,208,0.9)',
              }}
            >
              {message}
            </p>
          )}

          {/* button */}
          {selectedTime && (
            <button
              onClick={handleBooking}
              className="w-full mt-2 text-sm md:text-base font-semibold"
              style={{
                borderRadius: '16px',
                padding: '12px 16px',
                background:
                  'linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #06b6d4 100%)',
                color: '#ffffff',
                border: 'none',
                boxShadow: '0 16px 40px rgba(37,99,235,0.45)',
                cursor: 'pointer',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.97)';
                e.currentTarget.style.boxShadow = '0 10px 28px rgba(37,99,235,0.35)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 16px 40px rgba(37,99,235,0.45)';
              }}
            >
              Book Appointment
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
