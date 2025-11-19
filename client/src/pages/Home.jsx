import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { motion } from 'framer-motion';

export default function Home() {
  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

  useEffect(() => {
    // Fetch doctors on mount
    async function fetchDoctors() {
      try {
        const res = await api.get('/doctors');
        setDoctors(res.data);
        setFiltered(res.data);
        const specs = Array.from(new Set(res.data.map((d) => d.specialty)));
        setSpecialties(specs);
      } catch (err) {
        console.error(err);
      }
    }
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedSpecialty) {
      setFiltered(doctors.filter((doc) => doc.specialty === selectedSpecialty));
    } else {
      setFiltered(doctors);
    }
  }, [selectedSpecialty, doctors]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Find a Doctor</h1>
      {specialties.length > 0 && (
        <div className="mb-4">
          <label className="mr-2">Filter by specialty:</label>
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">All</option>
            {specialties.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((doc) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{doc.name}</h2>
              <p className="text-sm text-gray-600 mb-1">{doc.specialty}</p>
              <p className="text-sm text-gray-700 mb-2">{doc.bio && doc.bio.slice(0, 80)}...</p>
              <Link
                to={`/doctor/${doc.id}`}
                className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Book Now
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}