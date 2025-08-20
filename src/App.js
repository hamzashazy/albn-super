import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Superlogin from "./components/login/superlogin.jsx";
import Superpanel from "./components/superpanel.jsx";
import AdminManagement from "./components/admin/AdminManagement.jsx";
import CampusManagement from "./components/campus/CampusManagement.jsx";
import ProgramManagement from "./components/program/ProgramManagement.jsx";
import StudentManagement from "./components/student/StudentManagement.jsx";
import GroupManagement from "./components/group/GroupManagement.jsx";

//import AppRouter from "./AppRouter.js";
// import Home_V1 from "./components/homev4.js";
// const ProtectedRoute = ({ children }) => {
//   const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
//   return isLoggedIn ? children : <Navigate to="/" />;
// };
const ProtectedRoute1 = ({ children }) => {
  const isLogged = localStorage.getItem("isLogged") === "true";
  return isLogged ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Superlogin />} />
      <Route path="/dashboard" element={<ProtectedRoute1><Superpanel /></ProtectedRoute1>} />
      <Route path="/admin" element={<ProtectedRoute1><AdminManagement /></ProtectedRoute1>} />
      <Route path="/campus" element={<ProtectedRoute1><CampusManagement /></ProtectedRoute1>} />
      <Route path="/program" element={<ProtectedRoute1><ProgramManagement /></ProtectedRoute1>} />
      <Route path="/student" element={<ProtectedRoute1><StudentManagement /></ProtectedRoute1>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
      <Route path="/group" element={<ProtectedRoute1><GroupManagement /></ProtectedRoute1>} />

    </Routes>
  );
}
