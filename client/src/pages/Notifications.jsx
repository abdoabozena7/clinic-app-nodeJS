import React, { useEffect, useState } from 'react';
import api from '../api';

/**
 * Notifications page displays all notifications for the current user. Users
 * can mark individual notifications as read or mark all as read.
 */
export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      // sort newest first
      const sorted = res.data
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotifications(sorted);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error fetching notifications.');
    }
  };

  const markRead = async (id) => {
    setError('');
    setMessage('');
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error updating notification.');
    }
  };

  const markAllRead = async () => {
    setError('');
    setMessage('');
    try {
      await api.post('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setMessage('All notifications marked as read.');
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 'Error marking all notifications.'
      );
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h1 className="text-3xl font-bold text-slate-900 drop-shadow-sm">
            Notifications
          </h1>

          {notifications.length > 0 && (
            <button
              onClick={markAllRead}
              className="px-4 py-2 rounded-full bg-indigo-600 text-white text-sm font-semibold shadow-md shadow-indigo-300/60 hover:bg-indigo-700 transition"
            >
              Mark all as read
            </button>
          )}
        </div>

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

        {notifications.length === 0 ? (
          <div className="glass-card rounded-2xl border border-white/70 shadow-xl p-6 text-center text-slate-600">
            No notifications.
          </div>
        ) : (
          <ul className="space-y-4">
            {notifications.map((notif) => (
              <li
                key={notif.id}
                className={`glass-card rounded-2xl border border-white/70 shadow-lg p-4 sm:p-5 flex justify-between gap-4 items-start ${
                  notif.read ? 'opacity-80' : ''
                }`}
              >
                <div className="flex-1">
                  <p
                    className={
                      notif.read
                        ? 'text-slate-600'
                        : 'font-semibold text-slate-900'
                    }
                  >
                    {notif.message}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                  <span
                    className={`inline-flex mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                      notif.read
                        ? 'bg-slate-100 text-slate-500'
                        : 'bg-indigo-50 text-indigo-600'
                    }`}
                  >
                    {notif.read ? 'Read' : 'New'}
                  </span>
                </div>

                {!notif.read && (
                  <button
                    onClick={() => markRead(notif.id)}
                    className="whitespace-nowrap px-3 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-semibold shadow-md shadow-emerald-300/60 hover:bg-emerald-700 transition"
                  >
                    Mark read
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* glass helper */}
      <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.82);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }
      `}</style>
    </div>
  );
}
