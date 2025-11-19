import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [doctorId, setDoctorId] = useState(null);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    async function fetchDoctor() {
      // Find doctor profile for current user
      try {
        const res = await api.get('/doctors');
        const doc = res.data.find((d) => d.email === user.email);
        if (doc) {
          setDoctorId(doc.id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchDoctor();
  }, [user]);

  useEffect(() => {
    async function fetchAppointments() {
      if (!doctorId) return;
      try {
        const res = await api.get(`/doctors/${doctorId}/appointments`);
        setAppointments(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchAppointments();
  }, [doctorId]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Doctor Dashboard</h1>
      {appointments.length === 0 ? (
        <p>You have no appointments.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded shadow-md">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Patient</th>
                <th className="px-4 py-2 text-left">Date/Time</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Reason</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr key={appt.id} className="border-t">
                  <td className="px-4 py-2">{appt.patientName}</td>
                  <td className="px-4 py-2">{new Date(appt.startTime).toLocaleString()}</td>
                  <td className="px-4 py-2 capitalize">{appt.status}</td>
                  <td className="px-4 py-2">{appt.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}