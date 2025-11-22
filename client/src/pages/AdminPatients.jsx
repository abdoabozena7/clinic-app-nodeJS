import React, { useEffect, useState } from "react";
import api from "../api";

export default function AdminPatients() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const res = await api.get("/admin/patients");
      setPatients(res.data);
    } catch (err) {}
  };

  return (
    <div className="text-gray-900 w-full">

      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-6">Patients</h1>

      {/* TABLE CONTAINER */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 backdrop-blur-md">

        {patients.length === 0 ? (
          <p className="text-gray-700">No patients yet.</p>
        ) : (
          <table className="min-w-full text-gray-900">
            <thead>
              <tr className="bg-gray-100 text-gray-800">
                <th className="px-4 py-3 text-left font-semibold">Name</th>
                <th className="px-4 py-3 text-left font-semibold">Email</th>
              </tr>
            </thead>

            <tbody>
              {patients.map((p) => (
                <tr key={p.id} className="border-t border-gray-200">
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3">{p.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>
    </div>
  );
}