import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

export default function AdminDoctorEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    specialty: "",
    price: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load doctor data
  useEffect(() => {
    async function fetchDoctor() {
      try {
        const res = await api.get(`/doctors/${id}`);
        setForm({
          name: res.data.name || "",
          specialty: res.data.specialty || "",
          price: res.data.price || "",
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load doctor.");
      } finally {
        setLoading(false);
      }
    }

    fetchDoctor();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await api.put(`/doctors/${id}`, {
        name: form.name,
        specialty: form.specialty,
        price: form.price,
      });

      navigate("/admin/doctors");
    } catch (err) {
      console.error(err);
      setError("Failed to update doctor.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-white">Loading doctor...</p>;
  }

  return (
    <div className="text-gray-900 max-w-xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Edit Doctor</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 space-y-4"
      >
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg bg-white text-black focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Specialty</label>
          <input
            name="specialty"
            value={form.specialty}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg bg-white text-black focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Price</label>
          <input
            name="price"
            type="number"
            step="0.01"
            value={form.price}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg bg-white text-black focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={() => navigate("/admin/doctors")}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
