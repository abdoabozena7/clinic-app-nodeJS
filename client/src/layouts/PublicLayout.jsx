import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-clinic-gradient text-white">
      <Navbar />

      {/* محتوى الصفحات */}
      <div className="pt-24 px-6">
        <Outlet />
      </div>
    </div>
  );
}