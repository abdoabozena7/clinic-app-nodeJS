import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);

  const [newDoctor, setNewDoctor] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    specialty: "",
    price: "",
    location: "",
    bio: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const res = await api.get("/doctors"); // public list
      setDoctors(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this doctor?");
    if (!ok) return;
    setMessage("");
    setError("");

    try {
      await api.delete(`/admin/doctors/${id}`); // admin delete
      setDoctors((prev) => prev.filter((d) => d.id !== id));
      setMessage("Doctor deleted.");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to delete doctor.");
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const payload = { ...newDoctor };
      if (payload.price === "") delete payload.price;

      await api.post("/admin/doctors", payload);
      setMessage("Doctor added successfully.");
      setNewDoctor({
        name: "",
        email: "",
        phone: "",
        password: "",
        specialty: "",
        price: "",
        location: "",
        bio: "",
      });
      loadDoctors();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to add doctor.");
    }
  };

  return (
    <div className="text-gray-900 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Doctors</h1>

      {message && (
        <p className="text-green-600 bg-green-50 border border-green-200 px-4 py-2 rounded-xl">
          {message}
        </p>
      )}
      {error && (
        <p className="text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-xl">
          {error}
        </p>
      )}

      {/* Add Doctor Form */}
      <form
        onSubmit={handleAdd}
        className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 space-y-4"
      >
        <h2 className="text-xl font-semibold mb-2">Add New Doctor</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Name"
            value={newDoctor.name}
            onChange={(e) =>
              setNewDoctor({ ...newDoctor, name: e.target.value })
            }
            className="border p-2 rounded-md"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={newDoctor.email}
            onChange={(e) =>
              setNewDoctor({ ...newDoctor, email: e.target.value })
            }
            className="border p-2 rounded-md"
            required
          />
          <input
            type="text"
            placeholder="Phone"
            value={newDoctor.phone}
            onChange={(e) =>
              setNewDoctor({ ...newDoctor, phone: e.target.value })
            }
            className="border p-2 rounded-md"
          />
          <input
            type="password"
            placeholder="Password"
            value={newDoctor.password}
            onChange={(e) =>
              setNewDoctor({ ...newDoctor, password: e.target.value })
            }
            className="border p-2 rounded-md"
            required
          />
          <input
            type="text"
            placeholder="Specialty"
            value={newDoctor.specialty}
            onChange={(e) =>
              setNewDoctor({ ...newDoctor, specialty: e.target.value })
            }
            className="border p-2 rounded-md"
            required
          />
          <input
            type="number"
            placeholder="Price"
            value={newDoctor.price}
            onChange={(e) =>
              setNewDoctor({ ...newDoctor, price: e.target.value })
            }
            className="border p-2 rounded-md"
          />
          <input
            type="text"
            placeholder="Location"
            value={newDoctor.location}
            onChange={(e) =>
              setNewDoctor({ ...newDoctor, location: e.target.value })
            }
            className="border p-2 rounded-md"
          />
          <textarea
            placeholder="Bio"
            value={newDoctor.bio}
            onChange={(e) =>
              setNewDoctor({ ...newDoctor, bio: e.target.value })
            }
            className="border p-2 rounded-md md:col-span-2"
            rows={3}
          />
        </div>
        <button
          type="submit"
          className="mt-2 bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition"
        >
          Add Doctor
        </button>
      </form>

      {/* Doctors table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Specialty
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Price
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {doctors.map((doc, index) => (
              <tr
                key={doc.id}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="px-6 py-3 border-t border-gray-100">
                  {doc.name}
                </td>
                <td className="px-6 py-3 border-t border-gray-100">
                  {doc.specialty}
                </td>
                <td className="px-6 py-3 border-t border-gray-100">
                  ${doc.price}
                </td>
                <td className="px-6 py-3 border-t border-gray-100">
                  <div className="flex justify-end gap-3">
                    <Link
                      to={`/admin/doctors/${doc.id}/edit`}
                      className="px-3 py-1 text-sm rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="px-3 py-1 text-sm rounded-full bg-red-500 text-white hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {doctors.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-4 text-center text-gray-500"
                >
                  No doctors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
