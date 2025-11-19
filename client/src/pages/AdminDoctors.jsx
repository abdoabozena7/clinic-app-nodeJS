import React, { useEffect, useState } from 'react';
import api from '../api';

/**
 * AdminDoctors provides a simple CRUD interface for managing doctors.  It
 * allows the admin to view all doctors, add new doctors, edit existing
 * doctors (including their user credentials), and delete doctors.  The
 * list is sourced from the public /doctors endpoint for convenience.
 */
export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', specialty: '', price: '', location: '', bio: '' });
  const [newDoctor, setNewDoctor] = useState({ name: '', email: '', phone: '', password: '', specialty: '', price: '', location: '', bio: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/doctors');
      setDoctors(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (doc) => {
    setEditingId(doc.id);
    setForm({ name: doc.name, email: doc.email, phone: doc.phone || '', password: '', specialty: doc.specialty || '', price: doc.price || '', location: doc.location || '', bio: doc.bio || '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: '', email: '', phone: '', password: '', specialty: '', price: '', location: '', bio: '' });
  };

  const handleUpdate = async (id) => {
    setError('');
    setMessage('');
    try {
      await api.put(`/admin/doctors/${id}`, form);
      setMessage('Doctor updated.');
      fetchDoctors();
      cancelEdit();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error updating doctor.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this doctor?')) return;
    setError('');
    setMessage('');
    try {
      await api.delete(`/admin/doctors/${id}`);
      setMessage('Doctor deleted.');
      fetchDoctors();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error deleting doctor.');
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const payload = { ...newDoctor };
      // Price may be empty string; convert to number if provided
      if (payload.price === '') delete payload.price;
      await api.post('/admin/doctors', payload);
      setMessage('Doctor added.');
      setNewDoctor({ name: '', email: '', phone: '', password: '', specialty: '', price: '', location: '', bio: '' });
      fetchDoctors();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error adding doctor.');
    }
  };

  const specialties = Array.from(new Set(doctors.map((d) => d.specialty))).filter(Boolean);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Manage Doctors</h1>
      {message && <p className="text-green-600 mb-2">{message}</p>}
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {/* Add new doctor form */}
      <form onSubmit={handleAdd} className="mb-8 bg-gray-50 p-4 rounded shadow-inner">
        <h2 className="text-xl font-semibold mb-2">Add Doctor</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Name"
            value={newDoctor.name}
            onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={newDoctor.email}
            onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Phone"
            value={newDoctor.phone}
            onChange={(e) => setNewDoctor({ ...newDoctor, phone: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={newDoctor.password}
            onChange={(e) => setNewDoctor({ ...newDoctor, password: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Specialty"
            value={newDoctor.specialty}
            onChange={(e) => setNewDoctor({ ...newDoctor, specialty: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            type="number"
            placeholder="Price"
            value={newDoctor.price}
            onChange={(e) => setNewDoctor({ ...newDoctor, price: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Location"
            value={newDoctor.location}
            onChange={(e) => setNewDoctor({ ...newDoctor, location: e.target.value })}
            className="border p-2 rounded"
          />
          <textarea
            placeholder="Bio"
            value={newDoctor.bio}
            onChange={(e) => setNewDoctor({ ...newDoctor, bio: e.target.value })}
            className="border p-2 rounded"
            rows={3}
          />
        </div>
        <button type="submit" className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Add Doctor
        </button>
      </form>
      {/* Doctors table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded shadow-md">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Specialty</th>
              <th className="px-4 py-2 text-left">Price</th>
              <th className="px-4 py-2 text-left">Location</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doc) => (
              <tr key={doc.id} className="border-t">
                <td className="px-4 py-2">
                  {editingId === doc.id ? (
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="border p-1 rounded w-full"
                    />
                  ) : (
                    doc.name
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingId === doc.id ? (
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="border p-1 rounded w-full"
                    />
                  ) : (
                    doc.email
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingId === doc.id ? (
                    <input
                      type="text"
                      value={form.specialty}
                      onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                      className="border p-1 rounded w-full"
                    />
                  ) : (
                    doc.specialty
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingId === doc.id ? (
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="border p-1 rounded w-full"
                    />
                  ) : (
                    doc.price || '–'
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingId === doc.id ? (
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      className="border p-1 rounded w-full"
                    />
                  ) : (
                    doc.location || '–'
                  )}
                </td>
                <td className="px-4 py-2 space-x-2">
                  {editingId === doc.id ? (
                    <>
                      <button
                        onClick={() => handleUpdate(doc.id)}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(doc)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}