import React, { useState } from 'react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

/**
 * UserProfile allows the logged‑in user to edit their personal details
 * (name, email, phone) and optionally change their password.  After
 * saving, the AuthContext will be updated so the latest info is
 * reflected throughout the app.
 */
export default function UserProfile() {
  const { user, token, login } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const body = { name: form.name, email: form.email, phone: form.phone };
      if (form.password) body.password = form.password;
      const res = await api.put('/auth/profile', body);
      setMessage(res.data.message);
      // Update auth context with new user info using existing token
      login({ user: res.data.user, token });
      setForm((prev) => ({ ...prev, password: '' }));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error updating profile.');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      {message && <p className="text-green-600 mb-2">{message}</p>}
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1" htmlFor="phone">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="text"
            value={form.phone}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <label className="block font-medium mb-1" htmlFor="password">
            New Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            placeholder="Leave blank to keep current password"
          />
        </div>
        <button
          type="submit"
          className="bg-indigo-500 text-white px-6 py-2 rounded hover:bg-indigo-600 transition-colors"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}