import React, { useEffect, useState } from "react";
import api from "../api";

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const res = await api.get("/admin/appointments");
      setAppointments(res.data);
    } catch (err) {}
  };

  return (
    <div className="text-gray-900">

      <h1 className="text-3xl font-bold mb-6">Appointments</h1>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow">
        <table className="min-w-full text-gray-800">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="px-4 py-2 text-left">Patient</th>
              <th className="px-4 py-2 text-left">Doctor</th>
              <th className="px-4 py-2 text-left">Specialty</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {appointments.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="px-4 py-2">{a.patientName}</td>
                <td className="px-4 py-2">{a.doctorName}</td>
                <td className="px-4 py-2">{a.doctorSpecialty}</td>
                <td className="px-4 py-2">
                  {new Date(a.startTime).toLocaleString()}
                </td>
                <td className="px-4 py-2 capitalize">{a.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}