import React, { useEffect, useState } from 'react';
import api from '../api';

/**
 * Notifications page displays all notifications for the current user.  Users
 * can mark individual notifications as read or mark all as read.  Each
 * notification shows its message and the timestamp when it was created.
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
      const sorted = res.data.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
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
      setError(err.response?.data?.message || 'Error marking all notifications.');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      {message && <p className="text-green-600 mb-2">{message}</p>}
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <button
        onClick={markAllRead}
        className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
      >
        Mark all as read
      </button>
      {notifications.length === 0 ? (
        <p>No notifications.</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((notif) => (
            <li
              key={notif.id}
              className={`p-4 rounded shadow flex justify-between items-start ${
                notif.read ? 'bg-gray-100' : 'bg-white'
              }`}
            >
              <div>
                <p className={notif.read ? 'text-gray-600' : 'font-semibold'}>{notif.message}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(notif.createdAt).toLocaleString()}
                </p>
              </div>
              {!notif.read && (
                <button
                  onClick={() => markRead(notif.id)}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  Mark read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}