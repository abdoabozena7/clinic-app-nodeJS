import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

export default function AdminPatientEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPatient() {
      try {
        // 🔹 GET current patient data
        const res = await api.get(`/admin/patients/${id}`);
        setForm({
          name: res.data.name || "",
          email: res.data.email || "",
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load patient data.");
      } finally {
        setLoading(false);
      }
    }
    loadPatient();
  }, [id]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // 🔹 Update patient
      await api.put(`/admin/patients/${id}`, form);
      navigate("/admin/patients");
    } catch (err) {
      console.error(err);
      setError("Failed to update patient.");
    }
  };

  if (loading) return <p className="text-white">Loading patient...</p>;

  return (
    <div className="max-w-xl mx-auto bg-white/90 rounded-2xl shadow-lg p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Edit Patient</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={() => navigate("/admin/patients")}
            className="px-4 py-2 rounded-lg border"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:opacity-90"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
