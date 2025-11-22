import React, { useEffect, useState } from "react";
import api from "../api";

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get("/admin/analytics");
        setStats(res.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Error fetching analytics.");
      }
    }
    fetchStats();
  }, []);

  if (error)
    return (
      <p className="text-red-500 bg-red-50 border border-red-200 p-3 rounded-xl">
        {error}
      </p>
    );

  if (!stats)
    return (
      <p className="text-gray-600 text-lg bg-white/60 p-4 rounded-xl shadow">
        Loading analytics...
      </p>
    );

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-sky-50 via-white to-indigo-50">
      {/* PAGE TITLE */}
      <h1 className="text-3xl font-bold mb-6 text-slate-900 drop-shadow-sm">
        📊 Clinic Analytics
      </h1>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="glass-card p-6 rounded-2xl shadow-xl border border-white/40">
          <p className="text-sm text-slate-600">Total Appointments</p>
          <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
        </div>

        <div className="glass-card p-6 rounded-2xl shadow-xl border border-white/40">
          <p className="text-sm text-slate-600">Scheduled</p>
          <p className="text-3xl font-bold text-blue-600">{stats.scheduled}</p>
        </div>

        <div className="glass-card p-6 rounded-2xl shadow-xl border border-white/40">
          <p className="text-sm text-slate-600">Completed</p>
          <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
        </div>

        <div className="glass-card p-6 rounded-2xl shadow-xl border border-white/40">
          <p className="text-sm text-slate-600">Cancelled</p>
          <p className="text-3xl font-bold text-red-600">{stats.cancelled}</p>
          <p className="text-xs mt-1 text-slate-500">
            Rate: {(stats.cancellationRate * 100).toFixed(2)}%
          </p>
        </div>
      </div>

      {/* PER-DOCTOR TABLE */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-2xl rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-slate-900">
          👨‍⚕️ Appointments Per Doctor
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full rounded-xl overflow-hidden shadow-lg">
            <thead>
              <tr className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white">
                <th className="px-4 py-3 text-left">Doctor</th>
                <th className="px-4 py-3 text-left">Total Appointments</th>
              </tr>
            </thead>
            <tbody className="bg-white/70 backdrop-blur">
              {stats.perDoctor.map((d, i) => (
                <tr
                  key={d.doctorId}
                  className={`border-t ${
                    i % 2 === 0 ? "bg-white/40" : "bg-white/20"
                  }`}
                >
                  <td className="px-4 py-3 text-slate-800">{d.doctorName}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {d.count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* GLASS CARD CSS */}
      <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
      `}</style>
    </div>
  );
}
