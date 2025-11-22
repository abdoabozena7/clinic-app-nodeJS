import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

// ⭐ نفس صور الدكاترة (رجالة)
const doctorImages = [
  "https://randomuser.me/api/portraits/men/11.jpg",
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/men/45.jpg",
  "https://randomuser.me/api/portraits/men/52.jpg",
  "https://randomuser.me/api/portraits/men/66.jpg",
  "https://randomuser.me/api/portraits/men/73.jpg",
];

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

  // Fetch doctor info
  useEffect(() => {
    async function fetchDoctor() {
      try {
        const res = await api.get(`/doctors/${id}`);
        setDoctor(res.data);
      } catch (err) {
        console.error(err);
        setError("Unable to load doctor");
      }
    }
    fetchDoctor();
  }, [id]);

  // Fetch available times for selected date
  useEffect(() => {
    async function fetchTimes() {
      try {
        const res = await api.get(`/doctors/${id}/availability`, {
          params: { date },
        });
        setTimes(res.data);
      } catch (err) {
        console.log(err);
        setTimes([]);
      }
    }
    fetchTimes();
  }, [id, date]);

  // BOOKING BUTTON
  const handleBook = () => {
    setError("");

    if (!user) return navigate("/register");

    if (!time) {
      setError("Please select a time.");
      return;
    }

    navigate("/confirm", {
      state: {
        doctor,
        date,
        time,
        reason,
      },
    });
  };

  if (!doctor) return <p>Loading doctor...</p>;

  return (
    <div className="space-y-6">

      {/* Doctor Info */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row gap-6">

          {/* ⭐ صورة من random users بدل placeholder */}
          <img
            src={doctorImages[doctor.id % doctorImages.length]}
            alt={doctor.name}
            className="w-48 h-48 object-cover rounded-xl border-4 border-blue-500 shadow-md"
          />

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">{doctor.name}</h1>
            <p className="text-gray-700">{doctor.specialty}</p>
            {doctor.location && <p className="text-gray-700">Location: {doctor.location}</p>}
            {doctor.price && <p className="text-gray-700">Fee: ${doctor.price}</p>}
            {doctor.bio && <p className="text-gray-700 mt-2">{doctor.bio}</p>}
          </div>
        </div>
      </div>

      {/* Booking Card */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Book an appointment</h2>

        <div className="space-y-4">

          {/* Date */}
          <div>
            <label className="font-medium">Select a date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full md:w-64 px-3 py-2 rounded-lg bg-white text-black border focus:outline-none"
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          {/* Time */}
          {times.length > 0 ? (
            <div>
              <label className="font-medium">Select a time</label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full md:w-64 px-3 py-2 rounded-lg bg-white text-black border focus:outline-none"
              >
                <option value="">-- Select time --</option>
                {times.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          ) : (
            <p className="text-gray-600">No available time slots.</p>
          )}

          {/* Reason */}
          {time && (
            <div>
              <label className="font-medium">Reason (optional)</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full md:w-96 px-3 py-2 rounded-lg bg-white text-black border focus:outline-none"
                placeholder="Describe your reason for visit"
              />
            </div>
          )}

          {error && <p className="text-red-500">{error}</p>}

          <button
            onClick={handleBook}
            disabled={!time}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            Continue to Confirm
          </button>
        </div>
      </div>
    </div>
  );
}