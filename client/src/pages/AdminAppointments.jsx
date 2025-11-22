import React, { useEffect, useState } from "react";
import api from "../api";

/**
 * AdminAppointments with filters, reschedule & cancel actions
 * + modern glass UI.
 */
export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filter, setFilter] = useState({ doctor: "", date: "", status: "" });
  const [reschedulingId, setReschedulingId] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({ date: "", time: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await api.get("/admin/appointments");
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
    if (!window.confirm("Cancel this appointment?")) return;
    setError("");
    setMessage("");
    try {
      await api.delete(`/admin/appointments/${id}`);
      setMessage("Appointment cancelled.");
      fetchAppointments();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Error cancelling appointment."
      );
    }
  };

  const openReschedule = (appt) => {
    setReschedulingId(appt.id);
    const start = new Date(appt.startTime);
    const dateStr = start.toISOString().split("T")[0];
    const timeStr = start.toTimeString().slice(0, 5);
    setRescheduleForm({ date: dateStr, time: timeStr });
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!reschedulingId) return;
    setError("");
    setMessage("");
    try {
      await api.put(`/admin/appointments/${reschedulingId}`, {
        date: rescheduleForm.date,
        time: rescheduleForm.time,
      });
      setMessage("Appointment rescheduled.");
      setReschedulingId(null);
      fetchAppointments();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Error rescheduling appointment."
      );
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-sky-50 via-white to-indigo-50 text-slate-900">
      <h1 className="text-3xl font-bold mb-4 drop-shadow-sm">
        📅 Manage Appointments
      </h1>

      {message && (
        <p className="text-sm text-green-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl mb-3">
          {message}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-xl mb-3">
          {error}
        </p>
      )}

      {/* Filters */}
      <div className="glass-card rounded-2xl shadow-xl border border-white/50 p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3 text-slate-900">
          Filters
        </h2>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Filter by doctor name..."
            value={filter.doctor}
            onChange={(e) =>
              setFilter({ ...filter, doctor: e.target.value })
            }
            className="flex-1 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
          />
          <input
            type="date"
            value={filter.date}
            onChange={(e) => setFilter({ ...filter, date: e.target.value })}
            className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
          />
          <select
            value={filter.status}
            onChange={(e) =>
              setFilter({ ...filter, status: e.target.value })
            }
            className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
          >
            <option value="">All statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Appointments table */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/70 rounded-2xl shadow-2xl p-4 md:p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-sm">
                <th className="px-4 py-3 text-left">Patient</th>
                <th className="px-4 py-3 text-left">Doctor</th>
                <th className="px-4 py-3 text-left">Specialty</th>
                <th className="px-4 py-3 text-left">Date/Time</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Reason</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm bg-white/60">
              {filtered.map((appt, i) => (
                <tr
                  key={appt.id}
                  className={`border-t border-slate-100 ${
                    i % 2 === 0 ? "bg-white/70" : "bg-slate-50/70"
                  }`}
                >
                  <td className="px-4 py-2">{appt.patientName}</td>
                  <td className="px-4 py-2">{appt.doctorName}</td>
                  <td className="px-4 py-2">{appt.doctorSpecialty}</td>
                  <td className="px-4 py-2">
                    {new Date(appt.startTime).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 capitalize">{appt.status}</td>
                  <td className="px-4 py-2">{appt.reason}</td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => openReschedule(appt)}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-300/50 transition"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => handleCancel(appt.id)}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-300/50 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-6 text-center text-slate-500"
                  >
                    No appointments found for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reschedule modal */}
      {reschedulingId && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50">
          <div className="glass-card w-full max-w-sm rounded-2xl border border-white/60 shadow-2xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-900">
              Reschedule Appointment
            </h2>
            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <input
                type="date"
                value={rescheduleForm.date}
                onChange={(e) =>
                  setRescheduleForm({
                    ...rescheduleForm,
                    date: e.target.value,
                  })
                }
                className="border border-slate-200 rounded-xl w-full px-3 py-2 text-sm bg-white/90 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
                required
              />
              <input
                type="time"
                value={rescheduleForm.time}
                onChange={(e) =>
                  setRescheduleForm({
                    ...rescheduleForm,
                    time: e.target.value,
                  })
                }
                className="border border-slate-200 rounded-xl w-full px-3 py-2 text-sm bg-white/90 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
                required
              />
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReschedulingId(null)}
                  className="px-4 py-2 rounded-full text-sm font-medium bg-slate-200 hover:bg-slate-300 text-slate-800 transition"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-300/60 transition"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Glass helper class */}
      <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.78);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }
      `}</style>
    </div>
  );
}
