import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function PublicNavbar() {
  const { user } = useAuth();

  // تحديد اللينك المناسب حسب الدور
  const dashboardLink = user
    ? user.role === "admin"
      ? "/admin"
      : user.role === "doctor"
      ? "/doctor-dashboard"
      : "/dashboard"
    : "/login";

  return (
    <div className="fixed top-0 left-0 w-full bg-white/30 backdrop-blur-md shadow-sm z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-white drop-shadow">
          MediCare
        </Link>

        {/* Menu */}
        <div className="flex items-center gap-6 text-white font-medium drop-shadow">
          <Link to="/">Home</Link>
          <Link to="/doctors">Doctors</Link>

          {user ? (
            <Link to={dashboardLink}>Dashboard</Link>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}