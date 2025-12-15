import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  BarChart,
  Palette
} from "lucide-react";

export default function AdminSidebar() {
  const { pathname } = useLocation();

  const menuItem = (to, label, Icon) => {
    const active = pathname === to;

    return (
      <Link
        to={to}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition
          ${
            active
              ? "bg-white text-primary font-semibold shadow-md"
              : "text-black hover:bg-white/30"
          }`}
      >
        <Icon size={20} />
        {label}
      </Link>
    );
  };

  return (
    <aside className="w-64 min-h-screen p-6 space-y-5 bg-clinic-gradient shadow-xl rounded-2xl">
      <h2 className="text-2xl font-bold text-white mb-6">Menu</h2>

      {menuItem("/admin", "Dashboard", LayoutDashboard)}
      {menuItem("/admin/doctors", "Doctors", Users)}
      {menuItem("/admin/patients", "Patients", FileText)}
      {menuItem("/admin/appointments", "Appointments", Calendar)}
      {menuItem("/admin/analytics", "Analytics", BarChart)}

      {/* ✅ New: White-label simulator */}
      {menuItem("/admin/white-label-simulator", "Customization", Palette)}
    </aside>
  );
}
