import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";

const DashboardLayout = () => {
  const token = localStorage.getItem("app-token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen w-full bg-zinc-950 text-zinc-100">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
