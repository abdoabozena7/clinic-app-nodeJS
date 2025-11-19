import React, { useEffect, useState } from 'react';
import api from '../api';

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get('/admin/analytics');
        setStats(res.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Error fetching analytics.');
      }
    }
    fetchStats();
  }, []);

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }
  if (!stats) {
    return <p>Loading analytics...</p>;
  }
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Clinic Analytics</h1>
      <div className="mb-4">
        <p>Total appointments: {stats.total}</p>
        <p>Scheduled: {stats.scheduled}</p>
        <p>Completed: {stats.completed}</p>
        <p>Cancelled: {stats.cancelled}</p>
        <p>Cancellation rate: {(stats.cancellationRate * 100).toFixed(2)}%</p>
      </div>
      <h2 className="text-xl font-semibold mb-2">Appointments per doctor</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded shadow-md">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Doctor</th>
              <th className="px-4 py-2 text-left">Total Appointments</th>
            </tr>
          </thead>
          <tbody>
            {stats.perDoctor.map((d) => (
              <tr key={d.doctorId} className="border-t">
                <td className="px-4 py-2">{d.doctorName}</td>
                <td className="px-4 py-2">{d.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}