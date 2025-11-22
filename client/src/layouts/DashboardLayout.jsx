// src/layouts/DashboardLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

import Navbar from "../components/Navbar";
import AdminSidebar from "../components/AdminSidebar";
import DoctorSidebar from "../components/DoctorSidebar";
import PatientSidebar from "../components/PatientSidebar";

export default function DashboardLayout() {
  const { user } = useAuth();

  const renderSidebar = () => {
    if (!user) return null;
    if (user.role === "admin") return <AdminSidebar />;
    if (user.role === "doctor") return <DoctorSidebar />;
    if (user.role === "patient") return <PatientSidebar />;
    return null;
  };

  return (
    <div className="min-h-screen bg-clinic-gradient">
      <Navbar />

      <div className="pt-24 px-6 pb-8 flex gap-6 max-w-7xl mx-auto">
        {/* SIDEBAR (hidden on mobile) */}
        <div className="w-64 hidden md:block">{renderSidebar()}</div>

        {/* MAIN CONTENT CARD */}
        <div className="flex-1 bg-white/90 rounded-2xl shadow-xl p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
