import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

/**
 * DoctorSchedule allows doctors to view, add and remove their available
 * schedule slots.
 */
export default function DoctorSchedule() {
  const { user } = useAuth();
  const [doctorId, setDoctorId] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [form, setForm] = useState({ dayOfWeek: '', startTime: '', endTime: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch the doctor's ID once user is available
  useEffect(() => {
    async function findDoctor() {
      try {
        const res = await api.get('/doctors');
        const doc = res.data.find((d) => d.email === user.email);
        if (doc) setDoctorId(doc.id);
      } catch (err) {
        console.error(err);
      }
    }
    if (user) findDoctor();
  }, [user]);

  // Fetch schedules whenever doctorId changes
  useEffect(() => {
    async function loadSchedules() {
      if (!doctorId) return;
      try {
        const res = await api.get(`/doctors/${doctorId}/schedules`);
        setSchedules(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    loadSchedules();
  }, [doctorId]);

  const handleDelete = async (scheduleId) => {
    if (!doctorId) return;
    setError('');
    try {
      await api.delete(`/doctors/schedules/${scheduleId}`);
      setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error deleting schedule.');
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!doctorId) return;
    setError('');
    setMessage('');
    const { dayOfWeek, startTime, endTime } = form;
    if (dayOfWeek === '' || !startTime || !endTime) {
      setError('All fields are required.');
      return;
    }
    try {
      const res = await api.post(`/doctors/${doctorId}/schedules`, {
        dayOfWeek: parseInt(dayOfWeek, 10),
        startTime,
        endTime,
      });
      setSchedules((prev) => [...prev, res.data]);
      setForm({ dayOfWeek: '', startTime: '', endTime: '' });
      setMessage('Schedule added.');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error adding schedule.');
    }
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 drop-shadow-sm">
              My Schedule
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage your weekly availability and time slots.
            </p>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-xl">
            {error}
          </p>
        )}
        {message && (
          <p className="text-sm text-green-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl">
            {message}
          </p>
        )}

        {/* Add schedule form */}
        <div className="glass-card rounded-2xl border border-white/70 shadow-xl p-5">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">
            Add New Slot
          </h2>
          <form
            onSubmit={handleAdd}
            className="flex flex-col md:flex-row gap-3 md:items-center"
          >
            <select
              value={form.dayOfWeek}
              onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
              className="border border-slate-200 bg-white/90 rounded-xl px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
            >
              <option value="">Day of week</option>
              {dayNames.map((name, idx) => (
                <option key={idx} value={idx}>
                  {name}
                </option>
              ))}
            </select>

            <input
              type="time"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              className="border border-slate-200 bg-white/90 rounded-xl px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
            />

            <input
              type="time"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              className="border border-slate-200 bg-white/90 rounded-xl px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
            />

            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-2xl text-sm font-semibold shadow-md shadow-indigo-300/60 transition"
            >
              Add Slot
            </button>
          </form>
        </div>

        {/* Existing schedule list */}
        <div className="glass-card rounded-2xl border border-white/70 shadow-xl p-5">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">
            Current Schedule
          </h2>

          {schedules.length === 0 ? (
            <p className="text-slate-500 text-sm">
              No schedule entries yet. Add your first time slot above.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-sm">
                    <th className="px-4 py-3 text-left">Day</th>
                    <th className="px-4 py-3 text-left">Start</th>
                    <th className="px-4 py-3 text-left">End</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white/70 text-sm">
                  {schedules
                    .slice()
                    .sort(
                      (a, b) =>
                        a.dayOfWeek - b.dayOfWeek ||
                        a.startTime.localeCompare(b.startTime)
                    )
                    .map((sched, i) => (
                      <tr
                        key={sched.id}
                        className={`border-t border-slate-100 ${
                          i % 2 === 0 ? 'bg-white/80' : 'bg-slate-50/70'
                        }`}
                      >
                        <td className="px-4 py-2">
                          {dayNames[sched.dayOfWeek]}
                        </td>
                        <td className="px-4 py-2">{sched.startTime}</td>
                        <td className="px-4 py-2">{sched.endTime}</td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => handleDelete(sched.id)}
                            className="px-3 py-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white text-xs font-semibold shadow-sm shadow-red-300/70 transition"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* glass helper */}
      <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.82);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }
      `}</style>
    </div>
  );
}
