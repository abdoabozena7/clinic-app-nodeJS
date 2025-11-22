import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  const links = [
    { name: "Home", to: "/" },
    { name: "Doctors", to: "/doctors" },
    { name: "Dashboard", to: "/dashboard" },
    { name: "Notifications", to: "/notifications" },
  ];

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl bg-white/20 backdrop-blur-lg border border-white/40 shadow-lg rounded-2xl px-6 py-3 flex items-center justify-between">
      <Link to="/" className="text-2xl font-bold text-white drop-shadow">
        MediCare
      </Link>

      <div className="flex items-center gap-6">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`text-white font-medium hover:text-gray-200 transition ${
              location.pathname === link.to ? "underline" : ""
            }`}
          >
            {link.name}
          </Link>
        ))}

        {/* زر login */}
        <Link
          to="/login"
          className="px-4 py-2 bg-black rounded-lg text-white hover:bg-gray-900 transition"
        >
          Login
        </Link>
      </div>
    </nav>
  );
}