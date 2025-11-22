import React, { useState } from "react";
import api from "../api";
import { useAuth } from "../contexts/AuthContext";

/**
 * UserProfile page with:
 * - Profile photo upload
 * - Update user info
 * - Change password section
 * Styled similar to your screenshot.
 */
export default function UserProfile() {
  const { user, token, login } = useAuth();

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(user?.imageUrl || "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Handle normal profile field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Password changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle photo selection
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Save profile changes
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const body = {
        name: form.name,
        email: form.email,
        phone: form.phone,
      };

      // If uploading a photo → send multipart
      let res;
      if (photo) {
        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("email", form.email);
        formData.append("phone", form.phone);
        formData.append("image", photo);

        res = await api.put("/auth/profile/photo", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await api.put("/auth/profile", body);
      }

      login({ user: res.data.user, token });
      setMessage("Profile updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Error updating profile");
    }
  };

  // Handle password update
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    try {
      const res = await api.put("/auth/change-password", passwordForm);
      setMessage(res.data.message);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Error updating password");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white rounded-lg shadow-lg p-8">

      <h1 className="text-3xl font-bold mb-6 text-gray-900">My Profile</h1>

      {/* Messages */}
      {message && <p className="text-green-600 mb-4">{message}</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* Profile Photo */}
      <div className="flex flex-col items-center mb-8">
        <img
          src={preview || "https://via.placeholder.com/100"}
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover border shadow mb-3"
        />

        <label className="cursor-pointer bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700">
          Choose Photo
          <input type="file" className="hidden" onChange={handlePhotoChange} />
        </label>
      </div>

      {/* Profile Edit Form */}
      <form onSubmit={handleProfileSubmit} className="space-y-6 mb-10">

        <div>
          <label className="block font-medium mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="border p-2 rounded-md w-full transition focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Phone</label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="border p-2 rounded-md w-full transition focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition"
        >
          Save Profile
        </button>
      </form>

      {/* Password Section */}
      <h2 className="text-xl font-semibold mb-4">Change Password</h2>

      <form onSubmit={handlePasswordSubmit} className="space-y-4">

        <div>
          <label className="block font-medium mb-1">Current Password</label>
          <input
            type="password"
            name="currentPassword"
            value={passwordForm.currentPassword}
            onChange={handlePasswordChange}
            className="border p-2 rounded w-full"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">New Password</label>
          <input
            type="password"
            name="newPassword"
            value={passwordForm.newPassword}
            onChange={handlePasswordChange}
            className="border p-2 rounded w-full"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Confirm New Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={passwordForm.confirmPassword}
            onChange={handlePasswordChange}
            className="border p-2 rounded w-full"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-gray-900 text-white px-6 py-2 rounded hover:bg-gray-700 transition"
        >
          Change Password
        </button>
      </form>
    </div>
  );
}