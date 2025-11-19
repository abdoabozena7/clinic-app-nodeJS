import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { motion } from 'framer-motion';

export default function DoctorsList() {
  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
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
    let result = doctors;
    if (selectedSpecialty) {
      result = result.filter((doc) => doc.specialty === selectedSpecialty);
    }
    if (selectedPrice) {
      const [min, max] = selectedPrice.split('-').map(Number);
      result = result.filter((doc) => {
        const price = parseFloat(doc.price || 0);
        return price >= min && price <= max;
      });
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((doc) => doc.name.toLowerCase().includes(term));
    }
    setFiltered(result);
  }, [selectedSpecialty, selectedPrice, searchTerm, doctors]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Find a Doctor</h1>
      {/* Filters */}
      <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 mb-4">
        <div>
          <label className="mr-2">Specialty:</label>
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
        <div>
          <label className="mr-2">Price range:</label>
          <select
            value={selectedPrice}
            onChange={(e) => setSelectedPrice(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">All</option>
            <option value="0-100">0–100</option>
            <option value="100-200">100–200</option>
            <option value="200-300">200–300</option>
            <option value="300-1000">300+</option>
          </select>
        </div>
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>
      </div>
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
              <img
                src={doc.imageUrl || 'https://via.placeholder.com/150'}
                alt={doc.name}
                className="w-full h-32 object-cover rounded-md mb-2"
              />
              <h2 className="text-xl font-semibold mb-1">{doc.name}</h2>
              <p className="text-sm text-gray-600 mb-1">{doc.specialty}</p>
              <p className="text-sm text-gray-600 mb-1">Location: {doc.location || 'N/A'}</p>
              <p className="text-sm text-gray-600 mb-2">Consultation fee: ${doc.price || 'N/A'}</p>
              <p className="text-sm mb-2">
                {doc.availableToday ? (
                  <span className="text-green-600 font-semibold">Available today</span>
                ) : (
                  <span className="text-gray-500">No slots today</span>
                )}
              </p>
              <div className="flex justify-between items-center">
                <Link
                  to={`/doctor/${doc.id}`}
                  className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  View Profile
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}