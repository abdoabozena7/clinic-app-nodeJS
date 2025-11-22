import React, { useEffect, useState } from "react";
import api from "../api";
import {
  Users,
  ClipboardList,
  Clock,
  UserPlus,
  Calendar,
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await api.get("/doctors");
      setDoctors(res.data);
    } catch {}
  };

  const fetchAppointments = async () => {
    try {
      const res = await api.get("/admin/appointments");
      setAppointments(res.data);
    } catch {}
  };

  return (
    <div className="text-gray-900">

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-700">Manage doctors, appointments & system data.</p>
      </motion.div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Doctors */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 flex items-center gap-5">
          <div className="w-14 h-14 flex items-center justify-center bg-blue-600 text-white rounded-xl">
            <Users size={28} />
          </div>

          <div>
            <p className="text-3xl font-bold text-gray-900">{doctors.length}</p>
            <p className="text-gray-700">Doctors</p>
          </div>
        </div>

        {/* Appointments */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 flex items-center gap-5">
          <div className="w-14 h-14 flex items-center justify-center bg-green-600 text-white rounded-xl">
            <ClipboardList size={28} />
          </div>

          <div>
            <p className="text-3xl font-bold text-gray-900">{appointments.length}</p>
            <p className="text-gray-700">Total Appointments</p>
          </div>
        </div>

        {/* Upcoming */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 flex items-center gap-5">
          <div className="w-14 h-14 flex items-center justify-center bg-purple-600 text-white rounded-xl">
            <Clock size={28} />
          </div>

          <div>
            <p className="text-3xl font-bold text-gray-900">
              {appointments.filter((a) => a.status === "scheduled").length}
            </p>
            <p className="text-gray-700">Upcoming</p>
          </div>
        </div>
      </div>

      {/* RECENT DOCTORS */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 mb-4">
          <UserPlus size={20} className="text-blue-600" />
          Recent Doctors
        </h2>

        <div className="bg-white rounded-xl border border-gray-200 shadow p-6">
          {doctors.length === 0 ? (
            <p className="text-gray-700">No doctors found.</p>
          ) : (
            <ul className="space-y-3">
              {doctors.slice(0, 5).map((doc) => (
                <li
                  key={doc.id}
                  className="p-3 bg-gray-50 rounded-lg shadow-sm border border-gray-200"
                >
                  <p className="font-medium text-gray-900">{doc.name}</p>
                  <p className="text-gray-700 text-sm">{doc.specialty}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* LATEST APPOINTMENTS */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 mb-4">
          <Calendar size={20} className="text-green-600" />
          Latest Appointments
        </h2>

        <div className="bg-white rounded-xl border border-gray-200 shadow p-6 overflow-x-auto">
          <table className="min-w-full text-gray-900">
            <thead>
              <tr className="bg-gray-100 text-gray-800">
                <th className="px-4 py-2 text-left">Patient</th>
                <th className="px-4 py-2 text-left">Doctor</th>
                <th className="px-4 py-2 text-left">Specialty</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {appointments.slice(0, 8).map((appt) => (
                <tr key={appt.id} className="border-t border-gray-200">
                  <td className="px-4 py-2">{appt.patientName}</td>
                  <td className="px-4 py-2">{appt.doctorName}</td>
                  <td className="px-4 py-2">{appt.doctorSpecialty}</td>
                  <td className="px-4 py-2">
                    {new Date(appt.startTime).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 capitalize">{appt.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}