import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

/**
 * DoctorSchedule allows doctors to view, add and remove their available
 * schedule slots.  It fetches the doctor's ID by matching the logged in
 * user's email to the doctor list.  Schedules are grouped by day of
 * week and displayed in order.  Doctors can add new time ranges for
 * specific days and delete existing ones.
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
    <div>
      <h1 className="text-2xl font-bold mb-4">My Schedule</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {message && <p className="text-green-600 mb-2">{message}</p>}
      {/* Add schedule form */}
      <form onSubmit={handleAdd} className="mb-6 space-x-4 flex flex-col md:flex-row items-center">
        <select
          value={form.dayOfWeek}
          onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
          className="border p-2 rounded mb-2 md:mb-0"
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
          className="border p-2 rounded mb-2 md:mb-0"
        />
        <input
          type="time"
          value={form.endTime}
          onChange={(e) => setForm({ ...form, endTime: e.target.value })}
          className="border p-2 rounded mb-2 md:mb-0"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Add Slot
        </button>
      </form>
      {/* Existing schedule list */}
      {schedules.length === 0 ? (
        <p>No schedule entries yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded shadow-md">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Day</th>
                <th className="px-4 py-2 text-left">Start</th>
                <th className="px-4 py-2 text-left">End</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules
                .slice()
                .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime))
                .map((sched) => (
                  <tr key={sched.id} className="border-t">
                    <td className="px-4 py-2">{dayNames[sched.dayOfWeek]}</td>
                    <td className="px-4 py-2">{sched.startTime}</td>
                    <td className="px-4 py-2">{sched.endTime}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleDelete(sched.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
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
  );
}