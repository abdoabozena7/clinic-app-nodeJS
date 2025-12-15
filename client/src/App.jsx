import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";

import Home from "./pages/Home";
import DoctorsList from "./pages/DoctorsList";
import DoctorProfile from "./pages/DoctorProfile";

import Login from "./pages/Login";
import Register from "./pages/Register";

import PatientDashboard from "./pages/PatientDashboard";
import PatientAppointments from "./pages/PatientAppointments";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorSchedule from "./pages/DoctorSchedule";

import AdminDashboard from "./pages/AdminDashboard";
import AdminDoctors from "./pages/AdminDoctors";
import AdminAppointments from "./pages/AdminAppointments";
import AdminPatients from "./pages/AdminPatients";
import AdminAnalytics from "./pages/AdminAnalytics";

import Notifications from "./pages/Notifications";
import BookingConfirm from "./pages/BookingConfirm";

import AdminDoctorEdit from "./pages/AdminDoctorEdit";
import AdminPatientEdit from "./pages/AdminPatientEdit";
import UserProfile from "./pages/UserProfile";

import WhiteLabelSimulator from "./pages/WhiteLabelSimulator";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ---------- PUBLIC PAGES ---------- */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/doctors" element={<DoctorsList />} />

            {/* important: keep these public */}
            <Route path="/doctor/:id" element={<DoctorProfile />} />
            <Route path="/confirm" element={<BookingConfirm />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* ---------- DASHBOARD (Protected) ---------- */}
          <Route element={<DashboardLayout />}>
            {/* Patient */}
            <Route path="/dashboard" element={<PatientDashboard />} />
            <Route path="/appointments" element={<PatientAppointments />} />

            {/* Doctor */}
            <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor/schedule" element={<DoctorSchedule />} />

            {/* Admin */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/doctors" element={<AdminDoctors />} />
            <Route path="/admin/doctors/:id/edit" element={<AdminDoctorEdit />} />
            <Route path="/admin/patients" element={<AdminPatients />} />
            <Route path="/admin/patients/:id/edit" element={<AdminPatientEdit />} />
            <Route path="/admin/appointments" element={<AdminAppointments />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />

            {/* ✅ White-label simulator page */}
            <Route
              path="/admin/white-label-simulator"
              element={<WhiteLabelSimulator />}
            />

            {/* Notifications + Profile */}
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<UserProfile />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
