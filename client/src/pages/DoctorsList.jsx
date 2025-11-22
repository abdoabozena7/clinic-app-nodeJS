import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { motion } from "framer-motion";

const doctorImages = [
  "https://randomuser.me/api/portraits/men/11.jpg",
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/men/40.jpg",
  "https://randomuser.me/api/portraits/men/52.jpg",
  "https://randomuser.me/api/portraits/men/66.jpg",
  "https://randomuser.me/api/portraits/men/73.jpg",
];

export default function DoctorsList() {
  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const res = await api.get("/doctors");
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
      const [min, max] = selectedPrice.split("-").map(Number);
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
  <div className="min-h-screen pt-32 pb-20 px-6"
    style={{
      background: "linear-gradient(135deg, #3EDAC4 0%, #3BA7E0 100%)",
    }}
  >
    <h1 className="text-4xl font-bold text-white drop-shadow mb-10">
      Find a Doctor
    </h1>

    {/* Filters */}
    <div className="backdrop-blur-xl bg-white/30 rounded-3xl shadow-2xl border border-white/40 p-6 
                    flex flex-col md:flex-row gap-6 mb-10">

      <div className="flex flex-col">
        <label className="text-white font-semibold mb-1">Specialty</label>
        <select
          value={selectedSpecialty}
          onChange={(e) => setSelectedSpecialty(e.target.value)}
          className="px-3 py-2 rounded-xl bg-white/70 border border-white/60"
        >
          <option value="">All</option>
          {specialties.map((spec) => (
            <option key={spec} value={spec}>{spec}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-white font-semibold mb-1">Price</label>
        <select
          value={selectedPrice}
          onChange={(e) => setSelectedPrice(e.target.value)}
          className="px-3 py-2 rounded-xl bg-white/70 border border-white/60"
        >
          <option value="">All</option>
          <option value="0-100">0–100</option>
          <option value="100-200">100–200</option>
          <option value="200-300">200–300</option>
          <option value="300-1000">300+</option>
        </select>
      </div>

      <div className="flex-1 flex flex-col">
        <label className="text-white font-semibold mb-1">Search</label>
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 bg-white/70 border border-white/60 rounded-xl"
        />
      </div>
    </div>

    {/* Doctors Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
      {filtered.map((doc) => (
        <motion.div
          key={doc.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="backdrop-blur-xl bg-white/40 border border-white/50 rounded-3xl shadow-2xl 
                     p-8 flex flex-col items-center text-center"
        >
          <img
            src={doctorImages[doc.id % doctorImages.length]}
            alt={doc.name}
            className="w-32 h-32 rounded-full border-4 border-white shadow-xl mb-4"
          />

          <h2 className="text-xl font-semibold text-white">{doc.name}</h2>
          <p className="text-white/90">{doc.specialty}</p>
          <p className="text-white/90">Location: {doc.location || "N/A"}</p>
          <p className="text-white/90 mb-2">Consultation: ${doc.price}</p>

          <p className="mb-4">
            {doc.availableToday ? (
              <span className="text-green-300 font-bold">Available today</span>
            ) : (
              <span className="text-white/70">No slots today</span>
            )}
          </p>

          <Link
            to={`/doctor/${doc.id}`}
            className="px-6 py-2 bg-white/90 text-blue-700 font-semibold rounded-2xl shadow hover:bg-white transition"
          >
            View Profile
          </Link>
        </motion.div>
      ))}
    </div>
  </div>
);

}
