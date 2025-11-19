import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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