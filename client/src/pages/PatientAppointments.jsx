import React, { useEffect, useState } from "react";
import api from "../api";
import { Calendar, Clock, User } from "lucide-react";

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const res = await api.get("/appointments/mine");
      setAppointments(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold text-black mb-6">My Appointments</h1>

      {/* No appointments */}
      {appointments.length === 0 && (
        <p className="text-white bg-black/20 p-4 rounded-xl inline-block backdrop-blur-md">
          You have no appointments yet.
        </p>
      )}

      {/* Appointments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {appointments.map((a) => (
          <div
            key={a.id}
            className="bg-white/80 backdrop-blur-md rounded-xl p-5 shadow border border-white/40"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center">
                <User size={26} />
              </div>

              <div>
                <p className="text-lg font-semibold text-gray-900">{a.doctorName}</p>
                <p className="text-sm text-gray-500">{a.doctorSpecialty}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-2 text-gray-700">
              <Calendar size={18} />
              {new Date(a.startTime).toLocaleDateString()}
            </div>

            <div className="flex items-center gap-3 mb-2 text-gray-700">
              <Clock size={18} />
              {new Date(a.startTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>

            <p className="text-sm mt-2 text-gray-700">
              Status: <span className="capitalize text-blue-600">{a.status}</span>
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}