import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Home() {
  const [specialties, setSpecialties] = useState([]);

  useEffect(() => {
    async function fetchSpecialties() {
      try {
        const res = await api.get('/doctors');
        const specs = Array.from(new Set(res.data.map((d) => d.specialty)));
        setSpecialties(specs);
      } catch (err) {
        console.error(err);
      }
    }
    fetchSpecialties();
  }, []);

  return (
    <div className="space-y-10">
      {/* Welcome section */}
      <section className="text-center py-12 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg shadow-md">
        <h1 className="text-4xl font-bold mb-4">Welcome to the Medical Center</h1>
        <p className="text-lg mb-6">Book appointments with top specialists quickly and easily.</p>
        <Link
          to="/doctors"
          className="inline-block bg-white text-indigo-600 font-semibold px-6 py-3 rounded-full hover:bg-gray-100 transition-colors"
        >
          Find a Doctor
        </Link>
      </section>
      {/* Specialties list */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-center">Specialties</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {specialties.map((spec) => (
            <span
              key={spec}
              className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm shadow"
            >
              {spec}
            </span>
          ))}
        </div>
      </section>
      {/* Call to action for login/register */}
      <section className="text-center">
        <p className="text-lg mb-4">Ready to book your appointment?</p>
        <div className="space-x-4">
          <Link
            to="/login"
            className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-colors"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600 transition-colors"
          >
            Register
          </Link>
        </div>
      </section>
    </div>
  );
}