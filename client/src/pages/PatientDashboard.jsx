import React, { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../contexts/AuthContext";
import { Calendar, Clock, User, XCircle, RotateCcw, HeartPulse } from "lucide-react";
import { motion } from "framer-motion";

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [rescheduleId, setRescheduleId] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  useEffect(() => {
    async function loadAppointments() {
      try {
        const res = await api.get("/appointments");
        setAppointments(res.data);
      } catch {}
    }
    loadAppointments();
  }, []);

  // Check if patient can cancel
  const canCancel = (appt) => {
    const now = new Date();
    const start = new Date(appt.startTime);
    const diff = (start - now) / (1000 * 60 * 60);
    return diff >= 24 && appt.status === "scheduled";
  };

  // Cancel appointment
  const handleCancel = async (id) => {
    setError("");
    setMessage("");
    try {
      await api.delete(`/appointments/${id}`);
      setMessage("Appointment cancelled successfully.");
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "cancelled" } : a))
      );
    } catch (err) {
      setError(err.response?.data?.message || "Unable to cancel appointment.");
    }
  };

  // Reschedule appointment
  const handleReschedule = async (id) => {
    setError("");
    setMessage("");
    try {
      await api.put(`/appointments/${id}`, { date: newDate, time: newTime });
      const res = await api.get("/appointments");
      setAppointments(res.data);
      setMessage("Appointment rescheduled successfully.");
      setRescheduleId(null);
      setNewDate("");
      setNewTime("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to reschedule appointment.");
    }
  };

  return (
    <div className="pt-6 px-4 pb-20">

      {/* TITLE */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-3xl font-bold text-white drop-shadow flex items-center gap-3">
          <HeartPulse size={28} />
          My Appointments
        </h1>
        <p className="text-white/80 mt-1">
          Manage your upcoming and past appointments.
        </p>
      </motion.div>

      {/* MESSAGES */}
      {error && <p className="text-red-300 bg-red-500/20 p-3 rounded-xl mb-4">{error}</p>}
      {message && <p className="text-green-300 bg-green-600/20 p-3 rounded-xl mb-4">{message}</p>}

      {/* No appointments */}
      {appointments.length === 0 && (
        <p className="text-white/80 bg-white/20 backdrop-blur p-4 rounded-xl inline-block mt-6">
          You have no appointments.
        </p>
      )}

      {/* APPOINTMENTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {appointments.map((appt, index) => (
          <motion.div
            key={appt.id}
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/40"
          >
            {/* Doctor info */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-teal-400 flex items-center justify-center shadow text-white">
                <User size={28} />
              </div>

              <div>
                <p className="text-lg font-semibold text-gray-900">{appt.doctorName}</p>
                <p className="text-sm text-gray-600">{appt.doctorSpecialty}</p>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center gap-3 text-sm text-gray-700 mb-2">
              <Calendar className="text-blue-500" size={18} />
              {new Date(appt.startTime).toLocaleDateString()}
            </div>

            {/* Time */}
            <div className="flex items-center gap-3 text-sm text-gray-700 mb-4">
              <Clock className="text-blue-500" size={18} />
              {new Date(appt.startTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>

            {/* Status */}
            <p className="text-sm font-medium text-gray-600 mb-4">
              Status:
              <span className="capitalize ml-1 text-blue-700">{appt.status}</span>
            </p>

            {/* ACTION BUTTONS */}
            <div className="flex gap-3">
              {canCancel(appt) ? (
                <>
                  <button
                    onClick={() => handleCancel(appt.id)}
                    className="flex items-center gap-1 bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition"
                  >
                    <XCircle size={16} /> Cancel
                  </button>

                  <button
                    onClick={() => setRescheduleId(appt.id)}
                    className="flex items-center gap-1 bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-600 transition"
                  >
                    <RotateCcw size={16} /> Reschedule
                  </button>
                </>
              ) : (
                <span className="text-gray-400 text-sm">
                  No actions available
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* RESCHEDULE FORM */}
      {rescheduleId && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-12 bg-white/90 backdrop-blur-md shadow-xl p-6 rounded-2xl border border-white/40 max-w-md mx-auto"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Reschedule Appointment
          </h2>

          <div className="space-y-4">
            {/* New date */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                New Date
              </label>
              <input
                type="date"
                value={newDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:border-blue-500"
              />
            </div>

            {/* New time */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                New Time
              </label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:border-blue-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => handleReschedule(rescheduleId)}
                disabled={!newDate || !newTime}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                Confirm
              </button>

              <button
                onClick={() => {
                  setRescheduleId(null);
                  setNewDate("");
                  setNewTime("");
                }}
                className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}