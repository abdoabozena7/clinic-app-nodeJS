import React, { useEffect, useState } from 'react';
import api from '../api';

export default function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await api.get('/admin/patients');
      setPatients(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (patient) => {
    setEditingId(patient.id);
    setForm({ name: patient.name, email: patient.email, phone: patient.phone || '', password: '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: '', email: '', phone: '', password: '' });
  };

  const handleUpdate = async (id) => {
    setError('');
    setMessage('');
    try {
      await api.put(`/admin/patients/${id}`, form);
      setMessage('Patient updated.');
      fetchPatients();
      cancelEdit();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error updating patient.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this patient?')) return;
    setError('');
    setMessage('');
    try {
      await api.delete(`/admin/patients/${id}`);
      setMessage('Patient deleted.');
      setPatients((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error deleting patient.');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Manage Patients</h1>
      {message && <p className="text-green-600 mb-2">{message}</p>}
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded shadow-md">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Phone</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient.id} className="border-t">
                <td className="px-4 py-2">
                  {editingId === patient.id ? (
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="border p-1 rounded w-full"
                    />
                  ) : (
                    patient.name
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingId === patient.id ? (
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="border p-1 rounded w-full"
                    />
                  ) : (
                    patient.email
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingId === patient.id ? (
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="border p-1 rounded w-full"
                    />
                  ) : (
                    patient.phone || '–'
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingId === patient.id ? (
                    <>
                      <button
                        onClick={() => handleUpdate(patient.id)}
                        className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600"
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
                        onClick={() => startEdit(patient)}
                        className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(patient.id)}
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