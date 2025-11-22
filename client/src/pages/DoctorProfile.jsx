// src/pages/DoctorProfile.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../contexts/AuthContext";

// Same doctor images as Home / DoctorsList
const doctorImages = [
  "https://randomuser.me/api/portraits/men/11.jpg",
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/men/40.jpg",
  "https://randomuser.me/api/portraits/men/52.jpg",
  "https://randomuser.me/api/portraits/men/66.jpg",
  "https://randomuser.me/api/portraits/men/73.jpg",
];

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState(() =>
    new Date().toISOString().split("T")[0]
  );
  const [times, setTimes] = useState([]);
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  // Load doctor info
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

  // Load available times
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

    // SEND DATA TO CONFIRM PAGE
    navigate("/confirm", {
      state: {
        doctor,
        date,
        time,
        reason,
      },
    });
  };

  if (!doctor) return <p className="pt-24 text-center text-gray-500">Loading doctor...</p>;

  const imgSrc =
    doctorImages[doctor.id % doctorImages.length] || doctorImages[0];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 bg-gradient-to-b from-sky-50 via-slate-50 to-sky-100">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Doctor info */}
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-tr from-sky-200/60 via-teal-100/40 to-indigo-200/60 blur-2xl -z-10 rounded-[32px]" />
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-[28px] shadow-2xl shadow-slate-200 p-6 sm:p-8">
            <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-center md:items-start">
              <div className="relative">
                <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-tr from-sky-300/60 to-indigo-300/60 blur-xl" />
                <img
                  src={imgSrc}
                  alt={doctor.name}
                  className="w-40 h-40 md:w-48 md:h-48 object-cover rounded-3xl border-4 border-white shadow-xl shadow-slate-300"
                />
              </div>

              <div className="space-y-3 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                  {doctor.name}
                </h1>
                <p className="inline-flex items-center justify-center md:justify-start px-4 py-1.5 rounded-full bg-white/80 border border-slate-200/80 text-sm font-medium text-slate-700">
                  {doctor.specialty}
                </p>

                {doctor.location && (
                  <p className="text-sm md:text-base text-slate-700">
                    <span className="font-semibold">Location:</span>{" "}
                    {doctor.location}
                  </p>
                )}
                {doctor.price && (
                  <p className="text-sm md:text-base text-slate-700">
                    <span className="font-semibold">Fee:</span> ${doctor.price}
                  </p>
                )}
                {doctor.bio && (
                  <p className="text-sm md:text-base text-slate-800 mt-2 leading-relaxed bg-white/70 border border-slate-200/70 rounded-2xl px-4 py-3">
                    {doctor.bio}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Booking Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/80 rounded-[26px] shadow-2xl shadow-slate-200 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold mb-4 text-slate-900">
            Book an appointment
          </h2>

          <div className="space-y-5">
            {/* Date */}
            <div className="space-y-1.5">
              <label className="font-medium text-sm text-slate-800 block">
                Select a date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full md:w-64 px-3 py-2 rounded-xl bg-white/90 text-slate-900 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 text-sm shadow-sm"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            {/* Time */}
            {times.length > 0 ? (
              <div className="space-y-1.5">
                <label className="font-medium text-sm text-slate-800 block">
                  Select a time
                </label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full md:w-64 px-3 py-2 rounded-xl bg-white/90 text-slate-900 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 text-sm shadow-sm"
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
              <p className="text-slate-600 text-sm">
                No available time slots for this date.
              </p>
            )}

            {/* Reason */}
            {time && (
              <div className="space-y-1.5">
                <label className="font-medium text-sm text-slate-800 block">
                  Reason (optional)
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full md:w-96 px-3 py-2 rounded-xl bg-white/90 text-slate-900 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 text-sm shadow-sm"
                  placeholder="Describe your reason for visit"
                />
              </div>
            )}

            {error && (
              <p className="text-sm text-red-500 bg-red-50/80 border border-red-100 rounded-xl px-4 py-2">
                {error}
              </p>
            )}

            <button
              onClick={handleBook}
              disabled={!time}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm md:text-base font-semibold shadow-lg shadow-indigo-400/40 disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-150 hover:-translate-y-0.5"
            >
              Continue to Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
