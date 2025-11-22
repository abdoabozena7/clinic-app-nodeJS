import React, { useEffect, useState } from "react";
import api from "../api";

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const res = await api.get("/doctors");
      setDoctors(res.data);
    } catch (err) {}
  };

  return (
    <div className="text-gray-900 w-full">

      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-6 text-gray-900">
        Doctors
      </h1>

      {/* TABLE CONTAINER */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 backdrop-blur-md">

        <table className="min-w-full text-gray-900">
          <thead>
            <tr className="bg-gray-100 text-gray-800">
              <th className="px-4 py-3 text-left font-semibold">Name</th>
              <th className="px-4 py-3 text-left font-semibold">Specialty</th>
              <th className="px-4 py-3 text-left font-semibold">Price</th>
            </tr>
          </thead>

          <tbody>
            {doctors.map((doc) => (
              <tr key={doc.id} className="border-t border-gray-200">
                <td className="px-4 py-3">{doc.name}</td>
                <td className="px-4 py-3">{doc.specialty}</td>
                <td className="px-4 py-3">${doc.price}</td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
}