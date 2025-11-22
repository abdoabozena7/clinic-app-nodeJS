// src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Bell, User } from "lucide-react";
import api from "../api";

function NavLink({ to, label, isActive }) {
  return (
    <Link
      to={to}
      className={`text-sm font-medium transition ${
        isActive
          ? "text-white underline underline-offset-4 decoration-2"
          : "text-white/90 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    api
      .get("/notifications")
      .then((res) => {
        const unread = res.data.filter((n) => !n.read).length;
        setNotifCount(unread);
      })
      .catch(() => {});
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (to) => location.pathname === to;

  return (
    <nav
      className="
        fixed top-4 left-1/2 -translate-x-1/2 z-50
        w-[90%] max-w-6xl
        bg-white/15 backdrop-blur-xl border border-white/40
        shadow-lg rounded-2xl px-6 py-2
        flex items-center justify-between
      "
    >
      {/* Logo */}
      <Link
        to="/"
        className="text-2xl font-bold text-white drop-shadow-sm tracking-tight"
      >
        MediCare
      </Link>

      <div className="flex items-center gap-6">

        {/* If NOT logged in */}
        {!user && (
          <>
            <NavLink to="/" label="Home" isActive={isActive("/")} />
            <NavLink
              to="/doctors"
              label="Doctors"
              isActive={isActive("/doctors")}
            />

            <Link
              to="/login"
              className="px-4 py-2 rounded-full text-sm font-semibold bg-white text-teal-600 hover:bg-gray-100 transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-full text-sm font-semibold border border-white/70 text-white hover:bg-white/10 transition"
            >
              Register
            </Link>
          </>
        )}

        {/* PATIENT NAV */}
        {user && user.role === "patient" && (
          <>
            <NavLink to="/" label="Home" isActive={isActive("/")} />
            <NavLink
              to="/doctors"
              label="Doctors"
              isActive={isActive("/doctors")}
            />
            <NavLink
              to="/dashboard"
              label="Dashboard"
              isActive={isActive("/dashboard")}
            />
            <NavLink
              to="/appointments"
              label="My Appointments"
              isActive={isActive("/appointments")}
            />
          </>
        )}

        {/* DOCTOR NAV */}
        {user && user.role === "doctor" && (
          <>
            <NavLink
              to="/doctor-dashboard"
              label="Dashboard"
              isActive={isActive("/doctor-dashboard")}
            />
          </>
        )}

        {/* ADMIN NAV */}
        {user && user.role === "admin" && (
          <>
            <NavLink
              to="/admin"
              label="Admin Dashboard"
              isActive={isActive("/admin")}
            />
            <NavLink
              to="/admin/doctors"
              label="Doctors"
              isActive={isActive("/admin/doctors")}
            />
            <NavLink
              to="/admin/appointments"
              label="Appointments"
              isActive={isActive("/admin/appointments")}
            />
            <NavLink
              to="/admin/patients"
              label="Patients"
              isActive={isActive("/admin/patients")}
            />
            <NavLink
              to="/admin/analytics"
              label="Analytics"
              isActive={isActive("/admin/analytics")}
            />
          </>
        )}

        {/* Notification + Logout for any logged-in user */}
        {user && (
          <div className="flex items-center gap-5">
            <button
              onClick={() => navigate("/notifications")}
              className="relative text-white hover:text-gray-100 transition"
              title="Notifications"
            >
              <Bell size={20} />
              {notifCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-xs rounded-full px-1">
                  {notifCount}
                </span>
              )}
            </button>

            <button
              onClick={() => navigate("/profile")}
              className="relative text-white hover:text-gray-100 transition"
              title="Profile"
            >
              <User size={20} />
            </button>

            <button
              onClick={handleLogout}
              className="ml-4 px-3 py-1.5 rounded-full text-sm font-semibold border border-white/70 text-white hover:bg-white/10 transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
