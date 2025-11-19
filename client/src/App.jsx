import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import DoctorsList from './pages/DoctorsList';
/*
 * Lazy‑load some of the more complex pages.  This helps keep the initial
 * bundle smaller and defers loading until the user actually navigates to
 * these routes.  React.lazy dynamically imports the component and
 * Suspense will fallback to a loader while the module is being fetched.
 */
import { lazy, Suspense } from 'react';

// Lazy loaded pages – these files will be generated in this refactor
const DoctorProfile = lazy(() => import('./pages/DoctorProfile'));
const BookingConfirm = lazy(() => import('./pages/BookingConfirm'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const DoctorSchedule = lazy(() => import('./pages/DoctorSchedule'));
const AdminDoctors = lazy(() => import('./pages/AdminDoctors'));
const AdminAppointments = lazy(() => import('./pages/AdminAppointments'));
const Notifications = lazy(() => import('./pages/Notifications'));
import Login from './pages/Login';
import Register from './pages/Register';
import DoctorDetail from './pages/DoctorDetail';
import PatientDashboard from './pages/PatientDashboard';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import NotFound from './pages/NotFound';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminPatients from './pages/AdminPatients';
import AdminAnalytics from './pages/AdminAnalytics';

// ProtectedRoute component
const ProtectedRoute = ({ roles, children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        {/*
         * Wrap routes in Suspense so lazy‑loaded pages display a fallback while loading.
         */}
        <Suspense fallback={<div>Loading...</div>}>
          <div className="container mx-auto px-4 py-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Public doctor list and detail */}
              <Route path="/doctors" element={<DoctorsList />} />
              <Route path="/doctor/:id" element={<DoctorProfile />} />
              <Route path="/booking/confirm" element={<BookingConfirm />} />

              {/* Protected routes for patients */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute roles={["patient"]}>
                    <PatientDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Shared profile page for any logged in user */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute roles={["patient", "doctor", "admin"]}>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />

              {/* Doctor schedule management */}
              <Route
                path="/schedule"
                element={
                  <ProtectedRoute roles={["doctor"]}>
                    <DoctorSchedule />
                  </ProtectedRoute>
                }
              />

              {/* Admin dashboards */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/doctors"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <AdminDoctors />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/appointments"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <AdminAppointments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/patients"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <AdminPatients />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <AdminAnalytics />
                  </ProtectedRoute>
                }
              />

              {/* Doctor dashboard (view their appointments) */}
              <Route
                path="/doctor"
                element={
                  <ProtectedRoute roles={["doctor"]}>
                    <DoctorDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Notifications for all roles */}
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute roles={["patient", "doctor", "admin"]}>
                    <Notifications />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}