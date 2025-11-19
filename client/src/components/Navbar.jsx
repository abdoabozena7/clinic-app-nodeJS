import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="font-bold text-xl hover:text-gray-200 transition-colors">
          Medical Center
        </Link>
        <div className="space-x-4">
          {!user && (
            <>
              <Link to="/login" className="hover:text-gray-200 transition-colors">
                Login
              </Link>
              <Link to="/register" className="hover:text-gray-200 transition-colors">
                Register
              </Link>
            </>
          )}
          {user && user.role === 'patient' && (
            <>
              <Link to="/" className="hover:text-gray-200 transition-colors">
                Doctors
              </Link>
              <Link to="/dashboard" className="hover:text-gray-200 transition-colors">
                My Appointments
              </Link>
              <button onClick={handleLogout} className="hover:text-gray-200 transition-colors">
                Logout
              </button>
            </>
          )}
          {user && user.role === 'doctor' && (
            <>
              <Link to="/doctor" className="hover:text-gray-200 transition-colors">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="hover:text-gray-200 transition-colors">
                Logout
              </button>
            </>
          )}
          {user && user.role === 'admin' && (
            <>
              <Link to="/admin" className="hover:text-gray-200 transition-colors">
                Admin
              </Link>
              <button onClick={handleLogout} className="hover:text-gray-200 transition-colors">
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}