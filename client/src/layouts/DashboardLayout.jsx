import React from "react";
import { Outlet } from "react-router-dom";
import PatientSidebar from "../components/PatientSidebar";
import DoctorSidebar from "../components/DoctorSidebar";
import AdminSidebar from "../components/AdminSidebar";
import { useAuth } from "../contexts/AuthContext";

export default function DashboardLayout() {
  const { user } = useAuth();

  // اختار السيّدبار حسب دور المستخدم
  const renderSidebar = () => {
    if (!user) return null;
    if (user.role === "admin") return <AdminSidebar />;
    if (user.role === "doctor") return <DoctorSidebar />;
    return <PatientSidebar />;
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-teal-500 to-teal-400">

      {/* Sidebar */}
      <div className="w-64">
        {renderSidebar()}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}