import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const res = await api.get("/admin/patients");
      setPatients(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load patients.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    // 🟡 make sure you later create this route + page
    navigate(`/admin/patients/${id}/edit`);
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this patient?");
    if (!ok) return;

    try {
      await api.delete(`/admin/patients/${id}`);
      setPatients((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete patient.");
    }
  };

  return (
    <div className="text-gray-900">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Patients</h1>

      <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500 mb-3">{error}</p>}

        {patients.length === 0 && !loading ? (
          <p className="text-gray-700">No patients yet.</p>
        ) : (
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-2">{p.name}</td>
                  <td className="px-4 py-2">{p.email}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleEdit(p.id)}
                        className="px-3 py-1 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="px-3 py-1 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
