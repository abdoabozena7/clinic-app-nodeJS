import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import api from '../api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    if (user) {
      // Fetch unread notifications count
      api
        .get('/notifications')
        .then((res) => {
          const unread = res.data.filter((n) => !n.read).length;
          setNotifCount(unread);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 shadow-md">
      <div className="container mx-auto flex flex-col items-center md:flex-row md:justify-between">
        <Link to="/" className="font-bold text-2xl hover:text-gray-200 transition-colors mb-2 md:mb-0">
          Medical Center
        </Link>
        <div className="flex items-center space-x-4">
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
              <Link to="/doctors" className="hover:text-gray-200 transition-colors">
                Doctors
              </Link>
              <Link to="/dashboard" className="hover:text-gray-200 transition-colors">
                My Appointments
              </Link>
              <Link to="/profile" className="hover:text-gray-200 transition-colors">
                Profile
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
              <Link to="/schedule" className="hover:text-gray-200 transition-colors">
                My Schedule
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
              <Link to="/admin/doctors" className="hover:text-gray-200 transition-colors">
                Doctors
              </Link>
              <Link to="/admin/appointments" className="hover:text-gray-200 transition-colors">
                Appointments
              </Link>
              <Link to="/admin/patients" className="hover:text-gray-200 transition-colors">
                Patients
              </Link>
              <Link to="/admin/analytics" className="hover:text-gray-200 transition-colors">
                Analytics
              </Link>
              <button onClick={handleLogout} className="hover:text-gray-200 transition-colors">
                Logout
              </button>
            </>
          )}
          {/* Notification bell for any logged-in user */}
          {user && (
            <button
              onClick={() => navigate('/notifications')}
              className="relative focus:outline-none"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {notifCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
                  {notifCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}