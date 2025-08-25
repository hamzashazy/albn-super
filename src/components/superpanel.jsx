import React, { useState } from "react";
import {
  LayoutDashboard,
  UserPlus,
  Building2,
  BookOpen,
  Users,
  LogOut,
  Menu,
  X,
  Bell,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import AdminManagement from "./admin/AdminManagement.jsx";
import CampusManagement from "./campus/CampusManagement.jsx";
import ProgramManagement from "./program/ProgramManagement.jsx";
import StudentManagement from "./student/StudentManagement.jsx";
import GroupManagement from "./group/GroupManagement.jsx";
import BatchManagement from "./batch/BatchManagement.jsx";
import NotificationManagement from "./notification/NotificationManagement.jsx";

const Superpanel = () => {
  const [activeModule, setActiveModule] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const modules = [
    {
      key: "admin",
      title: "Admins",
      icon: <UserPlus className="w-7 h-7" />,
      component: <AdminManagement />,
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      key: "campus",
      title: "Campuses",
      icon: <Building2 className="w-7 h-7" />,
      component: <CampusManagement />,
      gradient: "from-green-500 to-emerald-600",
    },
    {
      key: "program",
      title: "Programs",
      icon: <BookOpen className="w-7 h-7" />,
      component: <ProgramManagement />,
      gradient: "from-purple-500 to-pink-600",
    },
    {
      key: "batch",
      title: "Batches",
      icon: <Layers className="w-7 h-7" />,
      component: <BatchManagement />,
      gradient: "from-purple-500 to-pink-600",
    },
    {
      key: "student",
      title: "Students",
      icon: <UserPlus className="w-7 h-7" />,
      component: <StudentManagement />,
      gradient: "from-red-500 to-orange-600",
    },
    {
      key: "group",
      title: "Classes",
      icon: <Users className="w-7 h-7" />,
      component: <GroupManagement />,
      gradient: "from-cyan-500 to-blue-600",
    },
    {
      key: "notification",
      title: "Notifications",
      icon: <Bell className="w-7 h-7" />,
      component: <NotificationManagement />,
      gradient: "from-cyan-500 to-blue-600",
    },
  ];

  const renderDashboard = () => (
    <div className="flex flex-col items-center w-full px-6 py-10">
      <h2 className="text-4xl md:text-6xl font-extrabold mb-12 text-gray-900 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent text-center">
        Dashboard
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
        {modules.map((mod) => (
          <motion.div
            key={mod.key}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveModule(mod.key)}
            className={`relative rounded-3xl p-8 cursor-pointer overflow-hidden shadow-2xl transition-transform duration-300 bg-gradient-to-r ${mod.gradient} flex flex-col justify-between`}
          >
            <div className="absolute top-0 left-0 w-full h-full bg-white/10 rotate-12 pointer-events-none rounded-3xl"></div>
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-white/30 rounded-full animate-pulse blur-2xl pointer-events-none"></div>
            <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-white/20 rounded-full animate-ping blur-3xl pointer-events-none"></div>

            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="bg-white/30 backdrop-blur-md p-4 rounded-xl shadow-lg flex items-center justify-center text-white">
                {mod.icon}
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white">
                {mod.title}
              </h3>
            </div>

            <p className="relative z-10 text-white text-opacity-95 text-base md:text-lg leading-relaxed">
              Manage all{" "}
              <span className="font-semibold">{mod.title.toLowerCase()}</span> in
              your institution efficiently and effortlessly.
            </p>

            <div className="absolute top-6 right-6 w-3 h-3 bg-white rounded-full animate-pulse opacity-80"></div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderModule = () => {
    if (activeModule === "dashboard") return renderDashboard();
    const mod = modules.find((m) => m.key === activeModule);
    return <div className="flex-1">{mod?.component}</div>;
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-10">
        <LayoutDashboard className="w-8 h-8 text-indigo-600" />
        <span className="font-bold text-2xl text-indigo-700">Super Panel</span>
      </div>

      <nav className="space-y-3 flex-1 text-lg">
        <button
          onClick={() => {
            setActiveModule("dashboard");
            setSidebarOpen(false);
          }}
          className={`relative flex items-center gap-4 w-full px-4 py-3 rounded-xl transition-all text-lg ${
            activeModule === "dashboard"
              ? "bg-indigo-100 text-indigo-700 font-semibold"
              : "hover:bg-gray-100"
          }`}
        >
          {activeModule === "dashboard" && (
            <span className="absolute left-0 top-0 h-full w-2 bg-indigo-500 rounded-r-lg"></span>
          )}
          <LayoutDashboard className="w-6 h-6 shrink-0" />
          <span>Dashboard</span>
        </button>

        {modules.map((mod) => (
          <button
            key={mod.key}
            onClick={() => {
              setActiveModule(mod.key);
              setSidebarOpen(false);
            }}
            className={`relative flex items-center gap-4 w-full px-4 py-3 rounded-xl transition-all text-lg ${
              activeModule === mod.key
                ? "bg-indigo-100 text-indigo-700 font-semibold"
                : "hover:bg-gray-100"
            }`}
          >
            {activeModule === mod.key && (
              <span className="absolute left-0 top-0 h-full w-2 bg-indigo-500 rounded-r-lg"></span>
            )}
            <span className="shrink-0">{mod.icon}</span>
            <span>{mod.title}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("isLogged");
            window.location.reload();
          }}
          className="flex items-center gap-4 w-full px-6 py-3 rounded-xl text-lg md:text-xl text-white font-semibold bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 shadow-lg transition"
        >
          <LogOut className="w-6 h-6" />
          Logout
        </motion.button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex w-72 bg-white backdrop-blur-sm border-r border-gray-200 shadow-xl p-6 md:sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-white shadow">
        <button onClick={() => setSidebarOpen(true)}>
          <Menu className="w-7 h-7 text-indigo-600" />
        </button>
        <span className="font-bold text-xl text-indigo-700">Alburhan</span>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-y-0 left-0 w-72 bg-white shadow-xl z-50 p-6"
          >
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <X className="w-6 h-6" />
            </button>
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto pt-14 md:pt-0">
        {renderModule()}
      </main>
    </div>
  );
};

export default Superpanel;
