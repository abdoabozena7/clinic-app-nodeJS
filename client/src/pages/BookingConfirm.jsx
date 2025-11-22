import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../contexts/AuthContext";

export default function BookingConfirm() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // لو مفيش داتا جاية من DoctorProfile
  if (!state || !state.doctor) {
    return (
      <div className="text-center text-white text-xl mt-10">
        No booking information available.
      </div>
    );
  }

  const { doctor, date, time, reason } = state;

  const handleConfirm = async () => {
    try {
      const res = await api.post("/appointments", {
        doctorId: doctor.id,
        date,
        time,
        reason,
      });

      setMessage("Appointment booked successfully!");

      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Error booking appointment.");
    }
  };

  return (
    <div className="p-6 flex justify-center">
      <div className="bg-white text-gray-900 rounded-xl shadow-lg p-6 w-full max-w-lg">

        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Confirm Your Appointment
        </h1>

        <div className="space-y-2 mb-4 text-gray-700">
          <p>
            <strong>Doctor:</strong> {doctor.name} ({doctor.specialty})
          </p>

          {doctor.location && (
            <p>
              <strong>Location:</strong> {doctor.location}
            </p>
          )}

          {doctor.price && (
            <p>
              <strong>Consultation fee:</strong> ${doctor.price}
            </p>
          )}

          <p>
            <strong>Date:</strong> {date}
          </p>

          <p>
            <strong>Time:</strong> {time}
          </p>

          {reason && (
            <p>
              <strong>Reason:</strong> {reason}
            </p>
          )}
        </div>

        {error && <p className="text-red-600 mb-2">{error}</p>}
        {message && <p className="text-green-600 mb-2">{message}</p>}

        <button
          onClick={handleConfirm}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
        >
          Confirm Booking
        </button>
      </div>
    </div>
  );
}