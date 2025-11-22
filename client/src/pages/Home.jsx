import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { motion } from 'framer-motion';

// ⭐ نفس صور الدكاترة اللي بتستخدميها في DoctorsList
const doctorImages = [
  "https://randomuser.me/api/portraits/men/11.jpg",
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/men/45.jpg",
  "https://randomuser.me/api/portraits/men/52.jpg",
  "https://randomuser.me/api/portraits/men/66.jpg",
  "https://randomuser.me/api/portraits/men/73.jpg",
];

export default function Home() {
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.get('/doctors');
        const specs = Array.from(new Set(res.data.map((d) => d.specialty)));
        setSpecialties(specs);

        // ⭐ عرض أول 3 دكاترة فقط
        setDoctors(res.data.slice(0, 3));
      } catch (error) {
        console.log(error);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-16 pt-20">

      {/* 🌟 Hero Section */}
      <section className="w-full bg-transparent text-white text-center py-20">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold mb-4 drop-shadow-lg"
        >
          Your Health, Our Priority
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg opacity-90 max-w-xl mx-auto mb-8 drop-shadow-md"
        >
          Book appointments with trusted specialists and get the care you deserve.
        </motion.p>

        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Link
            to="/doctors"
            className="px-8 py-3 bg-white text-gray-800 font-semibold rounded-full shadow-lg hover:bg-gray-200 transition"
          >
            Find a Doctor
          </Link>
        </motion.div>
      </section>

      {/* 🌟 Specialties Section */}
      <section className="text-center">
        <h2 className="text-3xl font-bold text-white mb-6 drop-shadow">
          Specialties
        </h2>

        <div className="flex flex-wrap justify-center gap-4">
          {specialties.map((spec) => (
            <div
              key={spec}
              className="px-5 py-3 bg-white/30 backdrop-blur-sm text-white rounded-xl shadow-soft hover:shadow-md transition font-medium"
            >
              {spec}
            </div>
          ))}
        </div>
      </section>

      {/* 🌟 Top Doctors Section */}
      <section className="text-center">
        <h2 className="text-3xl font-bold text-white mb-8 drop-shadow">
          Top Doctors
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {doctors.map((doc) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition"
            >
              {/* ⭐ صورة الدكتور من نفس المصفوفة */}
              <img
                src={doctorImages[doc.id % doctorImages.length]}
                alt={doc.name}
                className="w-28 h-28 mx-auto rounded-full object-cover mb-4 border-4 border-blue-500 shadow"
              />

              <h3 className="text-xl font-semibold text-gray-800">
                {doc.name}
              </h3>
              <p className="text-sm text-gray-600 mb-3">{doc.specialty}</p>

              <Link
                to={`/doctor/${doc.id}`}
                className="text-blue-600 font-medium hover:text-blue-800 transition"
              >
                View Profile
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 🌟 Final CTA */}
      <section className="text-center pb-10">
        <p className="text-lg text-white mb-4 drop-shadow">
          Start your health journey today.
        </p>

        <Link
          to="/doctors"
          className="px-8 py-3 bg-white text-gray-800 font-semibold rounded-full shadow-lg hover:bg-gray-200 transition"
        >
          Browse Doctors
        </Link>
      </section>

    </div>
  );
}