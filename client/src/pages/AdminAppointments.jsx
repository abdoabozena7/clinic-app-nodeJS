import React, { useEffect, useState } from 'react';
import api from '../api';

/**
 * AdminAppointments lists all appointments in the system and allows the
 * administrator to filter by doctor, date or status.  Admins can
 * reschedule appointments by choosing a new date and time, or cancel
 * appointments outright.  The component uses modal‑like inline forms for
 * rescheduling to keep the UI simple.
 */
export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filter, setFilter] = useState({ doctor: '', date: '', status: '' });
  const [reschedulingId, setReschedulingId] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({ date: '', time: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/admin/appointments');
      setAppointments(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Apply filters whenever filter or appointments change
  useEffect(() => {
    let result = appointments;
    if (filter.doctor) {
      const term = filter.doctor.toLowerCase();
      result = result.filter((a) => a.doctorName.toLowerCase().includes(term));
    }
    if (filter.date) {
      result = result.filter((a) => a.startTime.startsWith(filter.date));
    }
    if (filter.status) {
      result = result.filter((a) => a.status === filter.status);
    }
    setFiltered(result);
  }, [filter, appointments]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    setError('');
    setMessage('');
    try {
      await api.delete(`/admin/appointments/${id}`);
      setMessage('Appointment cancelled.');
      fetchAppointments();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error cancelling appointment.');
    }
  };

  const openReschedule = (appt) => {
    setReschedulingId(appt.id);
    // Prefill date/time with current appointment time
    const start = new Date(appt.startTime);
    const dateStr = start.toISOString().split('T')[0];
    const timeStr = start.toTimeString().slice(0, 5);
    setRescheduleForm({ date: dateStr, time: timeStr });
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!reschedulingId) return;
    setError('');
    setMessage('');
    try {
      await api.put(`/admin/appointments/${reschedulingId}`, {
        date: rescheduleForm.date,
        time: rescheduleForm.time,
      });
      setMessage('Appointment rescheduled.');
      setReschedulingId(null);
      fetchAppointments();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error rescheduling appointment.');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Manage Appointments</h1>
      {message && <p className="text-green-600 mb-2">{message}</p>}
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {/* Filters */}
      <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 mb-4">
        <input
          type="text"
          placeholder="Filter by doctor name..."
          value={filter.doctor}
          onChange={(e) => setFilter({ ...filter, doctor: e.target.value })}
          className="border p-2 rounded flex-1"
        />
        <input
          type="date"
          value={filter.date}
          onChange={(e) => setFilter({ ...filter, date: e.target.value })}
          className="border p-2 rounded"
        />
        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="">All statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      {/* Appointments table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded shadow-md">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Patient</th>
              <th className="px-4 py-2 text-left">Doctor</th>
              <th className="px-4 py-2 text-left">Specialty</th>
              <th className="px-4 py-2 text-left">Date/Time</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Reason</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((appt) => (
              <tr key={appt.id} className="border-t">
                <td className="px-4 py-2">{appt.patientName}</td>
                <td className="px-4 py-2">{appt.doctorName}</td>
                <td className="px-4 py-2">{appt.doctorSpecialty}</td>
                <td className="px-4 py-2">{new Date(appt.startTime).toLocaleString()}</td>
                <td className="px-4 py-2 capitalize">{appt.status}</td>
                <td className="px-4 py-2">{appt.reason}</td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => openReschedule(appt)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={() => handleCancel(appt.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Reschedule modal */}
      {reschedulingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-xl w-full max-w-sm">
            <h2 className="text-xl font-semibold mb-4">Reschedule Appointment</h2>
            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <input
                type="date"
                value={rescheduleForm.date}
                onChange={(e) => setRescheduleForm({ ...rescheduleForm, date: e.target.value })}
                className="border p-2 rounded w-full"
                required
              />
              <input
                type="time"
                value={rescheduleForm.time}
                onChange={(e) => setRescheduleForm({ ...rescheduleForm, time: e.target.value })}
                className="border p-2 rounded w-full"
                required
              />
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setReschedulingId(null)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}