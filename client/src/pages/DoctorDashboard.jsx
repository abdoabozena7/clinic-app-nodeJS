import React, { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../contexts/AuthContext";
import { User, Calendar, Clock, FileText, Stethoscope } from "lucide-react";
import { motion } from "framer-motion";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [doctorId, setDoctorId] = useState(null);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    async function loadDoctor() {
      try {
        const res = await api.get("/doctors");
        const doc = res.data.find((d) => d.email === user.email);
        if (doc) setDoctorId(doc.id);
      } catch (err) {
        console.log(err);
      }
    }
    loadDoctor();
  }, [user]);

  useEffect(() => {
    async function loadAppointments() {
      if (!doctorId) return;
      try {
        const res = await api.get(`/doctors/${doctorId}/appointments`);
        setAppointments(res.data);
      } catch (err) {
        console.log(err);
      }
    }
    loadAppointments();
  }, [doctorId]);

  return (
    <div className="pt-6 px-4 pb-10">

      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-3xl font-bold text-white drop-shadow-lg flex items-center gap-3">
          <Stethoscope size={32} />
          Welcome, Doctor
        </h1>
        <p className="text-white/80 mt-1">
          Here are your upcoming appointments.
        </p>
      </motion.div>

      {/* No Appointments */}
      {appointments.length === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white/90 text-lg mt-10 bg-white/20 backdrop-blur-lg px-5 py-3 rounded-xl inline-block"
        >
          You have no appointments scheduled.
        </motion.p>
      )}

      {/* Appointments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
        {appointments.map((appt, index) => (
          <motion.div
            key={appt.id}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/40"
          >
            {/* Patient Info */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-400 to-teal-400 flex items-center justify-center shadow-md">
                <User className="text-white" size={28} />
              </div>

              <div>
                <p className="text-lg font-semibold text-gray-800">
                  {appt.patientName}
                </p>
                <p className="text-sm text-gray-500">Patient</p>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center gap-3 text-sm text-gray-700 mb-2">
              <Calendar size={18} className="text-blue-500" />
              {new Date(appt.startTime).toLocaleDateString()}
            </div>

            {/* Time */}
            <div className="flex items-center gap-3 text-sm text-gray-700 mb-2">
              <Clock size={18} className="text-blue-500" />
              {new Date(appt.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>

            {/* Reason */}
            <div className="flex items-center gap-3 text-sm text-gray-700 mb-4">
              <FileText size={18} className="text-blue-500" />
              {appt.reason || "No reason provided"}
            </div>

            {/* Status */}
            <p className="text-sm font-medium text-gray-600">
              Status:{" "}
              <span className="capitalize text-blue-700">
                {appt.status}
              </span>
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}