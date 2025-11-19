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
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Handle changes for profile fields
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };
  // Handle changes for password fields
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  // Update profile (name, email, phone)
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await api.put('/auth/profile', profileForm);
      setMessage(res.data.message);
      // Update auth context with new user info using existing token
      login({ user: res.data.user, token });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error updating profile.');
    }
  };

  // Change password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    try {
      const body = {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      };
      const res = await api.put('/auth/profile/password', body);
      setMessage(res.data.message);
      // Clear fields
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error changing password.');
    }
  };

  // Upload profile photo
  const handlePhotoSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!photoFile) {
      setError('Please select a photo to upload.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('photo', photoFile);
      const res = await api.post('/auth/profile/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage(res.data.message);
      // Update user info in auth context with new profilePhoto
      const updatedUser = { ...user, profilePhoto: res.data.profilePhoto };
      login({ user: updatedUser, token });
      setPhotoFile(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error uploading photo.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6 space-y-8">
      <h1 className="text-2xl font-bold">My Profile</h1>
      {message && <p className="text-green-600">{message}</p>}
      {error && <p className="text-red-500">{error}</p>}
      {/* Profile photo section */}
      <div className="flex items-center space-x-4">
        {user?.profilePhoto ? (
          <img src={user.profilePhoto} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
            No Photo
          </div>
        )}
        <form onSubmit={handlePhotoSubmit} className="flex flex-col space-y-2">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
            className="border p-1 rounded"
          />
          <button type="submit" className="bg-gray-800 text-white px-4 py-1 rounded hover:bg-gray-900">
            Change Photo
          </button>
        </form>
      </div>
      {/* Profile details form */}
      <form onSubmit={handleProfileSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={profileForm.name}
            onChange={handleProfileChange}
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
            value={profileForm.email}
            onChange={handleProfileChange}
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
            value={profileForm.phone}
            onChange={handleProfileChange}
            className="border p-2 rounded w-full"
          />
        </div>
        <button type="submit" className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-900">
          Save Profile
        </button>
      </form>
      {/* Password change form */}
      <form onSubmit={handlePasswordSubmit} className="space-y-4">
        <h2 className="text-xl font-semibold">Change Password</h2>
        <div>
          <label className="block font-medium mb-1" htmlFor="currentPassword">
            Current Password
          </label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            value={passwordForm.currentPassword}
            onChange={handlePasswordChange}
            className="border p-2 rounded w-full"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1" htmlFor="newPassword">
            New Password
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            value={passwordForm.newPassword}
            onChange={handlePasswordChange}
            className="border p-2 rounded w-full"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1" htmlFor="confirmPassword">
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={handlePasswordChange}
            className="border p-2 rounded w-full"
            required
          />
        </div>
        <button type="submit" className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-900">
          Change Password
        </button>
      </form>
    </div>
  );
}