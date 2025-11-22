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
              <Link to="/profile" className="hover:text-gray-200 transition-colors">
                Profile
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
              <Link to="/profile" className="hover:text-gray-200 transition-colors">
                Profile
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