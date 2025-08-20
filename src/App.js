import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Superlogin from "./components/login/superlogin.jsx";
import Superpanel from "./components/superpanel.jsx";
import { FaHome } from "react-icons/fa";
import AdminManagement from "./components/admin/AdminManagement.jsx";
import AdminCreate from "./components/admin/AdminCreate.jsx";
import AdminEdit from "./components/admin/AdminEdit.jsx";
import CampusCreate from "./components/campus/CampusCreate.jsx";
import CampusManagement from "./components/campus/CampusManagement.jsx";
import CampusEdit from "./components/campus/CampusEdit.jsx";
import ProgramCreate from "./components/program/ProgramCreate.jsx";
import ProgramManagement from "./components/program/ProgramManagement.jsx";
import ProgramEdit from "./components/program/ProgramEdit.jsx";
import StudentManagement from "./components/student/StudentManagement.jsx";
import StudentCreate from "./components/student/StudentCreate.jsx";
import StudentEdit from "./components/student/StudentEdit.jsx";
import GroupCreate from "./components/group/GroupCreate.jsx";
import GroupManagement from "./components/group/GroupManagement.jsx";
import GroupEdit from "./components/group/GroupEdit.jsx";

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
      <Route path="/admin/create" element={<ProtectedRoute1><AdminCreate /></ProtectedRoute1>} />
      <Route path="/admin/edit/:id" element={<ProtectedRoute1><AdminEdit /></ProtectedRoute1>} />
      <Route path="/campus" element={<ProtectedRoute1><CampusManagement /></ProtectedRoute1>} />
      <Route path="/campus/create" element={<ProtectedRoute1><CampusCreate /></ProtectedRoute1>} />
      <Route path="/campus/edit/:id" element={<ProtectedRoute1><CampusEdit /></ProtectedRoute1>} />
      <Route path="/program" element={<ProtectedRoute1><ProgramManagement /></ProtectedRoute1>} />
      <Route path="/program/create" element={<ProtectedRoute1><ProgramCreate /></ProtectedRoute1>} />
      <Route path="/program/edit/:id" element={<ProtectedRoute1><ProgramEdit /></ProtectedRoute1>} />
      <Route path="/student" element={<ProtectedRoute1><StudentManagement /></ProtectedRoute1>} />
      <Route path="/student/create" element={<ProtectedRoute1><StudentCreate /></ProtectedRoute1>} />
      <Route path="/student/edit/:id" element={<ProtectedRoute1><StudentEdit /></ProtectedRoute1>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
      <Route path="/group" element={<ProtectedRoute1><GroupManagement /></ProtectedRoute1>} />
      <Route path="/group/create" element={<ProtectedRoute1><GroupCreate /></ProtectedRoute1>} />
      <Route path="/group/edit/:id" element={<ProtectedRoute1><GroupEdit /></ProtectedRoute1>} />

    </Routes>
  );
}
