import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // State for rescheduling
  const [rescheduleId, setRescheduleId] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  useEffect(() => {
    async function fetchAppointments() {
      try {
        const res = await api.get('/appointments');
        setAppointments(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    setError('');
    setMessage('');
    try {
      await api.delete(`/appointments/${id}`);
      setMessage('Appointment cancelled successfully.');
      setAppointments((prev) => prev.map((appt) => (appt.id === id ? { ...appt, status: 'cancelled' } : appt)));
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Unable to cancel appointment.');
      }
    }
  };

  const canCancel = (appt) => {
    const now = new Date();
    const startTime = new Date(appt.startTime);
    const diff = (startTime - now) / (1000 * 60 * 60); // hours
    return diff >= 24 && appt.status === 'scheduled';
  };

  const handleReschedule = async (id) => {
    setError('');
    setMessage('');
    try {
      await api.put(`/appointments/${id}`, { date: newDate, time: newTime });
      setMessage('Appointment rescheduled successfully.');
      // update appointments list by fetching again
      const res = await api.get('/appointments');
      setAppointments(res.data);
      // reset form
      setRescheduleId(null);
      setNewDate('');
      setNewTime('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Unable to reschedule appointment.');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Appointments</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {message && <p className="text-green-600 mb-2">{message}</p>}
      {appointments.length === 0 ? (
        <p>You have no appointments.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded shadow-md">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Doctor</th>
                <th className="px-4 py-2 text-left">Specialty</th>
                <th className="px-4 py-2 text-left">Date/Time</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr key={appt.id} className="border-t">
                  <td className="px-4 py-2">{appt.doctorName}</td>
                  <td className="px-4 py-2">{appt.doctorSpecialty}</td>
                  <td className="px-4 py-2">
                    {new Date(appt.startTime).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 capitalize">{appt.status}</td>
                  <td className="px-4 py-2">
                    {canCancel(appt) ? (
                      <button
                        onClick={() => handleCancel(appt.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Cancel
                      </button>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                    {/* Reschedule button for appointments that can be cancelled (same rule: >24h) */}
                    {canCancel(appt) && (
                      <button
                        onClick={() => {
                          setRescheduleId(appt.id);
                          setNewDate('');
                          setNewTime('');
                        }}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 ml-2"
                      >
                        Reschedule
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Reschedule form */}
      {rescheduleId && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h2 className="text-lg font-semibold mb-2">Reschedule Appointment</h2>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
            <div>
              <label className="block text-sm mb-1">New Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="border p-2 rounded"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">New Time</label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="border p-2 rounded"
                required
              />
            </div>
            <div className="flex space-x-2 mt-4 sm:mt-6">
              <button
                onClick={() => handleReschedule(rescheduleId)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                disabled={!newDate || !newTime}
              >
                Confirm
              </button>
              <button
                onClick={() => {
                  setRescheduleId(null);
                  setNewDate('');
                  setNewTime('');
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}