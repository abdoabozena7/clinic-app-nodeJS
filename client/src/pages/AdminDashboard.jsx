import React, { useEffect, useState } from 'react';
import api from '../api';

export default function AdminDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', specialty: '', bio: '' });
  const [scheduleForm, setScheduleForm] = useState({ doctorId: '', dayOfWeek: '', startTime: '', endTime: '' });
  const [manualForm, setManualForm] = useState({ doctorId: '', userId: '', date: '', time: '', reason: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/doctors');
      setDoctors(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  const fetchAppointments = async () => {
    try {
      const res = await api.get('/admin/appointments');
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await api.post('/admin/doctors', form);
      setMessage('Doctor created.');
      setForm({ name: '', email: '', phone: '', password: '', specialty: '', bio: '' });
      fetchDoctors();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error creating doctor.');
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await api.post('/admin/schedules', { ...scheduleForm, dayOfWeek: Number(scheduleForm.dayOfWeek) });
      setMessage('Schedule added.');
      setScheduleForm({ doctorId: '', dayOfWeek: '', startTime: '', endTime: '' });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error adding schedule.');
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await api.post('/admin/appointments/manual', manualForm);
      setMessage('Appointment booked manually.');
      setManualForm({ doctorId: '', userId: '', date: '', time: '', reason: '' });
      fetchAppointments();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error booking appointment manually.');
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      {error && <p className="text-red-500">{error}</p>}
      {message && <p className="text-green-600">{message}</p>}

      {/* Doctor creation */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Add Doctor</h2>
        <form onSubmit={handleDoctorSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Specialty"
            value={form.specialty}
            onChange={(e) => setForm({ ...form, specialty: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Bio"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="border p-2 rounded col-span-1 md:col-span-2"
          />
          <button type="submit" className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 col-span-1 md:col-span-2">
            Add Doctor
          </button>
        </form>
      </section>

      {/* Add schedule */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Add Schedule</h2>
        <form onSubmit={handleScheduleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={scheduleForm.doctorId}
            onChange={(e) => setScheduleForm({ ...scheduleForm, doctorId: e.target.value })}
            className="border p-2 rounded"
            required
          >
            <option value="">Select Doctor</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name}
              </option>
            ))}
          </select>
          <select
            value={scheduleForm.dayOfWeek}
            onChange={(e) => setScheduleForm({ ...scheduleForm, dayOfWeek: e.target.value })}
            className="border p-2 rounded"
            required
          >
            <option value="">Day of Week</option>
            <option value="0">Sunday</option>
            <option value="1">Monday</option>
            <option value="2">Tuesday</option>
            <option value="3">Wednesday</option>
            <option value="4">Thursday</option>
            <option value="5">Friday</option>
            <option value="6">Saturday</option>
          </select>
          <input
            type="time"
            value={scheduleForm.startTime}
            onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            type="time"
            value={scheduleForm.endTime}
            onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <button type="submit" className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 col-span-1 md:col-span-2">
            Add Schedule
          </button>
        </form>
      </section>

      {/* Manual booking */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Manual Booking</h2>
        <form onSubmit={handleManualSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={manualForm.doctorId}
            onChange={(e) => setManualForm({ ...manualForm, doctorId: e.target.value })}
            className="border p-2 rounded"
            required
          >
            <option value="">Select Doctor</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Patient User ID"
            value={manualForm.userId}
            onChange={(e) => setManualForm({ ...manualForm, userId: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            type="date"
            value={manualForm.date}
            onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            type="time"
            value={manualForm.time}
            onChange={(e) => setManualForm({ ...manualForm, time: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Reason (optional)"
            value={manualForm.reason}
            onChange={(e) => setManualForm({ ...manualForm, reason: e.target.value })}
            className="border p-2 rounded md:col-span-2"
          />
          <button type="submit" className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 col-span-1 md:col-span-2">
            Book Appointment
          </button>
        </form>
      </section>

      {/* List of all appointments */}
      <section>
        <h2 className="text-xl font-semibold mb-2">All Appointments</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded shadow-md">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Patient</th>
                <th className="px-4 py-2 text-left">Doctor</th>
                <th className="px-4 py-2 text-left">Specialty</th>
                <th className="px-4 py-2 text-left">Date/Time</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr key={appt.id} className="border-t">
                  <td className="px-4 py-2">{appt.patientName}</td>
                  <td className="px-4 py-2">{appt.doctorName}</td>
                  <td className="px-4 py-2">{appt.doctorSpecialty}</td>
                  <td className="px-4 py-2">{new Date(appt.startTime).toLocaleString()}</td>
                  <td className="px-4 py-2 capitalize">{appt.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}