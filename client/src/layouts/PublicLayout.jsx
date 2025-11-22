// src/layouts/PublicLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-clinic-gradient">
      <Navbar />
      <div className="pt-24 px-4 pb-10 max-w-6xl mx-auto">
        <Outlet />
      </div>
    </div>
  );
}
