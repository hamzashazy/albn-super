// components/student/StudentManagement.jsx
import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  RefreshCcw,
  Search,
  Users,
  CheckCircle,
  XCircle,
  Mail,
  Building,
  GraduationCap,
  BookOpen,
  MoreVertical,
  UserPlus,
  AlertCircle,
  X,
} from "lucide-react";
import axios from "axios";

import StudentCreate from "./StudentCreate";
import StudentEdit from "./StudentEdit";

const API_BASE_URL = "https://albn-backend.vercel.app/api";

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showDropdown, setShowDropdown] = useState(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [stats, setStats] = useState({ total: 0, active: 0, disabled: 0 });

  // Fetch students
  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/student`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data;
      setStudents(data);

      const total = data.length;
      const active = data.filter((s) => !s.isDeleted).length;
      const disabled = data.filter((s) => s.isDeleted).length;
      setStats({ total, active, disabled });
    } catch {
      setError("Failed to fetch students.");
    } finally {
      setLoading(false);
    }
  };

  // Disable student
  const handleDeleteStudent = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/student/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStudents((prev) =>
        prev.map((s) => (s._id === id ? { ...s, isDeleted: true } : s))
      );
      setStats((prev) => ({
        ...prev,
        active: prev.active - 1,
        disabled: prev.disabled + 1,
      }));
    } catch {
      setError("Failed to disable student");
    }
  };

  // Restore student
  const handleRestoreStudent = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/student/restore/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStudents((prev) =>
        prev.map((s) => (s._id === id ? { ...s, isDeleted: false } : s))
      );
      setStats((prev) => ({
        ...prev,
        active: prev.active + 1,
        disabled: prev.disabled - 1,
      }));
    } catch {
      setError("Failed to enable student");
    }
  };

  // Filtering
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.campus?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.program?.title?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && !student.isDeleted) ||
      (filterStatus === "disabled" && student.isDeleted);

    return matchesSearch && matchesFilter;
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  // Stats Card
  const StatsCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-lg text-gray-500">{label}</p>
          <p className="text-4xl font-extrabold text-gray-900">{value}</p>
        </div>
        <Icon className={`w-12 h-12 ${color}`} />
      </div>
    </div>
  );

  // Student Card
  const StudentCard = ({ student }) => (
    <div
      className={`bg-white rounded-2xl p-8 shadow-lg border border-gray-200 relative transition transform hover:shadow-2xl hover:-translate-y-1 ${
        student.isDeleted ? "opacity-70" : ""
      }`}
    >
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center space-x-4">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-md ${
              student.isDeleted
                ? "bg-gradient-to-br from-red-400 to-red-600"
                : "bg-gradient-to-br from-indigo-500 to-indigo-700"
            }`}
          >
            {student.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {student.name}
            </h3>
            <span
              className={`px-3 py-1 text-sm rounded-full ${
                student.isDeleted
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {student.isDeleted ? "Disabled" : "Active"}
            </span>
          </div>
        </div>
        <button
          onClick={() =>
            setShowDropdown(showDropdown === student._id ? null : student._id)
          }
        >
          <MoreVertical className="w-6 h-6 text-gray-500" />
        </button>
        {showDropdown === student._id && (
          <div className="absolute right-6 top-14 bg-white rounded-lg shadow-xl border py-3 z-20 w-48 text-lg">
            <button
              onClick={() => {
                setSelectedStudent(student);
                setIsEditOpen(true);
                setShowDropdown(null);
              }}
              className="w-full px-5 py-3 text-left hover:bg-gray-100 flex items-center gap-3"
            >
              <Edit className="w-5 h-5" /> Edit
            </button>
            {student.isDeleted ? (
              <button
                onClick={() => {
                  handleRestoreStudent(student._id);
                  setShowDropdown(null);
                }}
                className="w-full px-5 py-3 text-left hover:bg-gray-100 text-blue-600 flex items-center gap-3"
              >
                <RefreshCcw className="w-5 h-5" /> Restore
              </button>
            ) : (
              <button
                onClick={() => {
                  if (window.confirm("Disable this student?")) {
                    handleDeleteStudent(student._id);
                    setShowDropdown(null);
                  }
                }}
                className="w-full px-5 py-3 text-left hover:bg-gray-100 text-red-600 flex items-center gap-3"
              >
                <Trash2 className="w-5 h-5" /> Disable
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3 text-lg text-gray-700">
        <div className="flex items-center gap-3">
          <Mail className="w-5 h-5" /> {student.email}
        </div>
        {student.campus?.name && (
          <div className="flex items-center gap-3">
            <Building className="w-5 h-5" /> {student.campus.name}
          </div>
        )}
        {student.program?.title && (
          <div className="flex items-center gap-3">
            <GraduationCap className="w-5 h-5" /> {student.program.title}
          </div>
        )}
        {student.group?.name && (
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5" /> {student.group.name}
          </div>
        )}
      </div>
    </div>
  );

  // Skeleton Loader
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
        <div className="w-1/3 h-6 bg-gray-300 rounded"></div>
      </div>
      <div className="mt-4 space-y-3">
        <div className="w-full h-4 bg-gray-300 rounded"></div>
        <div className="w-5/6 h-4 bg-gray-300 rounded"></div>
        <div className="w-2/3 h-4 bg-gray-300 rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-extrabold text-indigo-700">
              Student Management
            </h1>
            <p className="text-xl text-gray-600">
              Manage students and their details
            </p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-3 px-7 py-4 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition text-lg"
          >
            <UserPlus className="w-6 h-6" />
            <span className="font-medium">Add New Student</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-10">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <StatsCard
            icon={Users}
            label="Total Students"
            value={stats.total}
            color="text-indigo-600"
          />
          <StatsCard
            icon={CheckCircle}
            label="Active Students"
            value={stats.active}
            color="text-green-600"
          />
          <StatsCard
            icon={XCircle}
            label="Disabled Students"
            value={stats.disabled}
            color="text-red-600"
          />
        </div>

        {/* Search + Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-10 flex flex-col md:flex-row gap-5">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-4 text-gray-400 w-6 h-6" />
            <input
              type="text"
              placeholder="Search by name, email, campus, or program..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-5 py-4 rounded-lg border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 text-xl shadow-sm"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-5 py-4 rounded-lg border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 text-xl"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="disabled">Disabled Only</option>
            </select>
            <button
              onClick={fetchStudents}
              className="px-5 py-4 rounded-lg border border-gray-300 hover:bg-gray-100 shadow-sm"
            >
              <RefreshCcw className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-5 mb-8 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3 text-xl text-red-700">
              <AlertCircle className="w-6 h-6" /> {error}
            </div>
            <button onClick={() => setError(null)}>
              <X className="w-6 h-6 text-red-600" />
            </button>
          </div>
        )}

        {/* Loading / Empty / Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-20">
            {Array.from({ length: 3 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-20 text-center">
            <Users className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-3xl font-semibold text-gray-700 mb-3">
              No Students Found
            </h3>
            <p className="text-xl text-gray-500">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filter"
                : "Click 'Add New Student' to get started"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStudents.map((student) => (
              <StudentCard key={student._id} student={student} />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6"
          onClick={() => setIsCreateOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                Create New Student
              </h2>
              <button onClick={() => setIsCreateOpen(false)}>
                <X className="w-7 h-7 text-gray-500" />
              </button>
            </div>
            <StudentCreate
              onSuccess={() => {
                setIsCreateOpen(false);
                fetchStudents();
              }}
            />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6"
          onClick={() => setIsEditOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Edit Student</h2>
              <button onClick={() => setIsEditOpen(false)}>
                <X className="w-7 h-7 text-gray-500" />
              </button>
            </div>
            <StudentEdit
              studentId={selectedStudent?._id}
              onSuccess={() => {
                setIsEditOpen(false);
                fetchStudents();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
