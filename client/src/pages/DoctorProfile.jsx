import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

/**
 * DoctorProfile page shows detailed information about a doctor and allows
 * patients to select a date and time to book an appointment.  If the
 * visitor is not logged in, they will be redirected to the register page
 * when attempting to book.  Once a slot is selected, the user is
 * forwarded to the booking confirmation page with the relevant details.
 */
export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [times, setTimes] = useState([]);
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  // Fetch doctor details on mount
  useEffect(() => {
    async function fetchDoctor() {
      try {
        const res = await api.get(`/doctors/${id}`);
        setDoctor(res.data);
      } catch (err) {
        console.error(err);
        setError('Unable to load doctor.');
      }
    }
    fetchDoctor();
  }, [id]);

  // Fetch available times whenever date changes
  useEffect(() => {
    async function fetchTimes() {
      if (!date) return;
      try {
        const res = await api.get(`/doctors/${id}/availability`, { params: { date } });
        setTimes(res.data);
      } catch (err) {
        console.error(err);
        setTimes([]);
      }
    }
    fetchTimes();
  }, [id, date]);

  const handleBook = () => {
    setError('');
    if (!user) {
      // Redirect to register if not logged in
      return navigate('/register');
    }
    if (!time) {
      setError('Please select a time.');
      return;
    }
    // Pass booking details via route state to confirmation page
    navigate('/booking/confirm', {
      state: {
        doctor,
        date,
        time,
        reason,
      },
    });
  };

  if (!doctor) {
    return <p>Loading doctor...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:space-x-6 items-start">
          <img
            src={doctor.imageUrl || 'https://via.placeholder.com/200'}
            alt={doctor.name}
            className="w-48 h-48 object-cover rounded-lg mb-4 md:mb-0"
          />
          <div className="flex-1 space-y-2">
            <h1 className="text-3xl font-bold">{doctor.name}</h1>
            <p className="text-gray-600">{doctor.specialty}</p>
            {doctor.location && <p className="text-gray-600">Location: {doctor.location}</p>}
            {doctor.price && <p className="text-gray-600">Consultation fee: ${doctor.price}</p>}
            {doctor.bio && <p className="mt-2 text-gray-700">{doctor.bio}</p>}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Book an appointment</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="date" className="block font-medium mb-1">
              Select a date
            </label>
            <input
              id="date"
              type="date"
              className="border p-2 rounded w-full md:w-64"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          {times && times.length > 0 ? (
            <div>
              <label className="block font-medium mb-1">Select a time</label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="border p-2 rounded w-full md:w-64"
              >
                <option value="">-- Select time --</option>
                {times.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <p>No available time slots on this date.</p>
          )}
          {time && (
            <div>
              <label className="block font-medium mb-1">Reason (optional)</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="border p-2 rounded w-full md:w-96"
                placeholder="Describe your reason for visit"
              />
            </div>
          )}
          {error && <p className="text-red-500">{error}</p>}
          <button
            onClick={handleBook}
            disabled={!time}
            className="bg-indigo-500 text-white px-6 py-2 rounded hover:bg-indigo-600 transition-colors disabled:opacity-50"
          >
            Continue to Confirm
          </button>
        </div>
      </div>
    </div>
  );
}