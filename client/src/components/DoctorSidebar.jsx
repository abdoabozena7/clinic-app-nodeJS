import { Link, useLocation } from "react-router-dom";
import { Calendar, Home, Bell } from "lucide-react";

export default function DoctorSidebar() {
  const { pathname } = useLocation();

  const link = (to, label, Icon) => (
    <Link
      to={to}
      className={`flex items-center gap-3 p-3 rounded-lg transition ${
        pathname === to ? "bg-white text-primary font-semibold" : "text-white hover:bg-white/20"
      }`}
    >
      <Icon size={20} /> {label}
    </Link>
  );

  return (
    <aside className="w-64 bg-primary text-white p-6 space-y-4 min-h-screen">
      <h2 className="text-xl font-bold mb-6">Doctor</h2>
      {link("/doctor-dashboard", "Dashboard", Home)}
      {link("/doctor/schedule", "Schedule", Calendar)}
      {link("/notifications", "Notifications", Bell)}
    </aside>
  );
}