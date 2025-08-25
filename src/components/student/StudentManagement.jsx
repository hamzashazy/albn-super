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
  Menu,
  FileSpreadsheet,
  FileText,
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
  const [campusFilter, setCampusFilter] = useState("all");
  const [programFilter, setProgramFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");
  const [showDropdown, setShowDropdown] = useState(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [stats, setStats] = useState({ total: 0, active: 0, disabled: 0 });
  const [campuses, setCampuses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [groups, setGroups] = useState([]);
  const [batches, setBatches] = useState([]);

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

  // Fetch filter data
  const fetchFilterData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [campusRes, programRes, groupRes, batchRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/campus/active`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/program/active`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/group/active`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/batch/active`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setCampuses(Array.isArray(campusRes.data) ? campusRes.data : []);
      setPrograms(Array.isArray(programRes.data) ? programRes.data : []);
      setGroups(Array.isArray(groupRes.data) ? groupRes.data : []);
      setBatches(Array.isArray(batchRes.data) ? batchRes.data : []);
    } catch (e) {
      // ignore silently
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
      student.program?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.batch?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.group?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && !student.isDeleted) ||
      (filterStatus === "disabled" && student.isDeleted);

    const matchesCampus =
      campusFilter === "all" || (typeof student.campus === 'string' ? student.campus === campusFilter : student.campus?._id === campusFilter);
    const matchesProgram =
      programFilter === "all" || (typeof student.program === 'string' ? student.program === programFilter : student.program?._id === programFilter);
    const matchesGroup =
      groupFilter === "all" || (typeof student.group === 'string' ? student.group === groupFilter : student.group?._id === groupFilter);
    const matchesBatch =
      batchFilter === "all" || (typeof student.batch === 'string' ? student.batch === batchFilter : student.batch?._id === batchFilter);

    return matchesSearch && matchesFilter && matchesCampus && matchesProgram && matchesGroup && matchesBatch;
  });

  useEffect(() => {
    fetchStudents();
    fetchFilterData();
  }, []);

  // Export helpers (CSV/PDF) based on current filteredStudents
  const exportStudentsToCSV = () => {
    try {
      const headers = ["Name","Email","Campus","Program","Batch","Group","Status"];
      const rows = filteredStudents.map(s => [
        s.name || "",
        s.email || "",
        s.campus?.name || "",
        s.program?.title || s.program?.name || "",
        s.batch?.name || "",
        s.group?.name || "",
        s.isDeleted ? "Disabled" : "Active",
      ]);
      const escapeCell = (v) => {
        const s = String(v ?? "");
        return /[",\n]/.test(s) ? '"' + s.replace(/"/g,'""') + '"' : s;
      };
      const csv = [headers, ...rows].map(r => r.map(escapeCell).join(',')).join('\n');
      const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'students.csv';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('CSV export failed', e);
      setError('Failed to export CSV');
    }
  };

  const exportStudentsToPDF = () => {
    try {
      const win = window.open('', '_blank');
      if (!win) return;
      const styles = `
        <style>
          body{font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; padding:16px;}
          h1{font-size:18px;margin:0 0 12px 0}
          table{width:100%;border-collapse:collapse}
          th,td{border:1px solid #ddd;padding:8px;font-size:12px;text-align:left}
          th{background:#f3f4f6}
        </style>`;
      const head = `<tr><th>Name</th><th>Email</th><th>Campus</th><th>Program</th><th>Batch</th><th>Group</th><th>Status</th></tr>`;
      const rows = filteredStudents.map(s => `
        <tr>
          <td>${s.name||''}</td>
          <td>${s.email||''}</td>
          <td>${s.campus?.name||''}</td>
          <td>${s.program?.title||s.program?.name||''}</td>
          <td>${s.batch?.name||''}</td>
          <td>${s.group?.name||''}</td>
          <td>${s.isDeleted?'Disabled':'Active'}</td>
        </tr>`).join('');
      win.document.write(`<!doctype html><html><head>${styles}</head><body><h1>Students Export</h1><table>${head}${rows}</table></body></html>`);
      win.document.close(); win.focus(); win.print();
    } catch (e) {
      console.error('PDF export failed', e);
      setError('Failed to export PDF');
    }
  };

  // Stats Card
  const StatsCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-200 hover:shadow-xl transition">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm sm:text-base lg:text-lg text-gray-500">{label}</p>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900">{value}</p>
        </div>
        <Icon className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 ${color}`} />
      </div>
    </div>
  );

    // Student Card
    const StudentCard = ({ student }) => (
      <div
        className={`bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-200 relative transition transform hover:shadow-2xl hover:-translate-y-1 ${
          student.isDeleted ? "opacity-70" : ""
        }`}
      >
        <div className="flex justify-between items-start mb-4 sm:mb-5">
          <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
            <div
              className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl lg:text-2xl shadow-md flex-shrink-0 ${
                student.isDeleted
                  ? "bg-gradient-to-br from-red-400 to-red-600"
                  : "bg-gradient-to-br from-indigo-500 to-indigo-700"
              }`}
            >
              {student.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                {student.name}
              </h3>
              <span
                className={`inline-block px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-full mt-1 ${
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
            type="button"
            className="flex-shrink-0 p-1"
            onClick={(e) => { e.stopPropagation(); 
            setShowDropdown(showDropdown === student._id ? null : student._id); }}
          >
            <MoreVertical className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
          </button>
          {showDropdown === student._id && (
            <div className="absolute right-4 sm:right-6 top-12 sm:top-14 bg-white rounded-lg shadow-xl border py-2 sm:py-3 z-20 w-40 sm:w-48 text-sm sm:text-lg">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setSelectedStudent(student); setIsEditOpen(true); setShowDropdown(null); }}
                className="w-full px-3 sm:px-5 py-2 sm:py-3 text-left hover:bg-gray-100 flex items-center gap-2 sm:gap-3"
              >
                <Edit className="w-4 h-4 sm:w-5 sm:h-5" /> Edit
              </button>
              {student.isDeleted ? (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleRestoreStudent(student._id); setShowDropdown(null); }}
                  className="w-full px-3 sm:px-5 py-2 sm:py-3 text-left hover:bg-gray-100 text-blue-600 flex items-center gap-2 sm:gap-3"
                >
                  <RefreshCcw className="w-4 h-4 sm:w-5 sm:h-5" /> Restore
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); if (window.confirm("Disable this student?")) { handleDeleteStudent(student._id); setShowDropdown(null); } }}
                  className="w-full px-3 sm:px-5 py-2 sm:py-3 text-left hover:bg-gray-100 text-red-600 flex items-center gap-2 sm:gap-3"
                >
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" /> Disable
                </button>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2 sm:space-y-3 text-sm sm:text-base lg:text-lg text-gray-700">
          <div className="flex items-center gap-2 sm:gap-3">
            <Mail className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> 
            <span className="truncate">{student.email}</span>
          </div>
          {student.campus?.name && (
            <div className="flex items-center gap-2 sm:gap-3">
              <Building className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> 
              <span className="truncate">{student.campus.name}</span>
            </div>
          )}
          {student.program?.title && (
            <div className="flex items-center gap-2 sm:gap-3">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> 
              <span className="truncate">{student.program.title}</span>
            </div>
          )}
          {student.batch?.name && (
            <div className="flex items-center gap-2 sm:gap-3">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> 
              <span className="truncate">{student.batch.name}</span>
            </div>
          )}
          {student.group?.name && (
            <div className="flex items-center gap-2 sm:gap-3">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> 
              <span className="truncate">{student.group.name}</span>
            </div>
          )}
        </div>
      </div>
    );

  // Skeleton Loader
  const SkeletonCard = () => (
    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-200 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gray-300 rounded-full"></div>
        <div className="w-1/3 h-4 sm:h-6 bg-gray-300 rounded"></div>
      </div>
      <div className="mt-4 space-y-2 sm:space-y-3">
        <div className="w-full h-3 sm:h-4 bg-gray-300 rounded"></div>
        <div className="w-5/6 h-3 sm:h-4 bg-gray-300 rounded"></div>
        <div className="w-2/3 h-3 sm:h-4 bg-gray-300 rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-indigo-700 truncate">
                Student Management
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 mt-1">
                Manage students and their details
              </p>
            </div>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 lg:px-7 py-3 sm:py-4 rounded-xl text-white  bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition text-sm sm:text-base lg:text-lg w-full sm:w-auto"
            >
              <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="font-medium">Add new Student</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8 lg:mb-10">
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
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 lg:mb-10">
          <div className="space-y-4">
            {/* Row 1: Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-3 sm:top-4 text-gray-400 w-5 h-5 sm:w-6 sm:h-6" />
              <input
                type="text"
                placeholder="Search by name, email, campus,batch or program..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-4 sm:pr-5 py-3 sm:py-4 rounded-lg border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 text-base sm:text-lg lg:text-xl shadow-sm"
              />
            </div>

            {/* Row 2: Filters and Actions */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 sm:flex-none px-3 sm:px-4 lg:px-5 py-3 sm:py-4 rounded-lg border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 text-base sm:text-lg lg:text-xl min-w-[12rem]"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="disabled">Disabled Only</option>
              </select>
              <select
                value={campusFilter}
                onChange={(e) => setCampusFilter(e.target.value)}
                className="flex-1 sm:flex-none px-3 sm:px-4 lg:px-5 py-3 sm:py-4 rounded-lg border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 text-base sm:text-lg lg:text-xl min-w-[12rem]"
              >
                <option value="all">All Campuses</option>
                {campuses.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              <select
                value={programFilter}
                onChange={(e) => setProgramFilter(e.target.value)}
                className="flex-1 sm:flex-none px-3 sm:px-4 lg:px-5 py-3 sm:py-4 rounded-lg border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 text-base sm:text-lg lg:text-xl min-w-[12rem]"
              >
                <option value="all">All Programs</option>
                {programs.map(p => (
                  <option key={p._id} value={p._id}>{p.title || p.name}</option>
                ))}
              </select>
              <select
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                className="flex-1 sm:flex-none px-3 sm:px-4 lg:px-5 py-3 sm:py-4 rounded-lg border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 text-base sm:text-lg lg:text-xl min-w-[12rem]"
              >
                <option value="all">All Groups</option>
                {groups.map(g => (
                  <option key={g._id} value={g._id}>{g.name}</option>
                ))}
              </select>
              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="flex-1 sm:flex-none px-3 sm:px-4 lg:px-5 py-3 sm:py-4 rounded-lg border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 text-base sm:text-lg lg:text-xl min-w-[12rem]"
              >
                <option value="all">All Batches</option>
                {batches.map(b => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
              <div className="ml-auto flex gap-2">
                <button
                  onClick={fetchStudents}
                  className="px-3 sm:px-4 lg:px-5 py-3 sm:py-4 rounded-lg border border-gray-300 hover:bg-gray-100 shadow-sm"
                >
                  <RefreshCcw className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                </button>
                <button
                  onClick={exportStudentsToCSV}
                  className="px-3 sm:px-4 lg:px-5 py-3 sm:py-4 rounded-lg border border-gray-300 hover:bg-gray-100 shadow-sm"
                  title="Export to Excel (CSV)"
                >
                  <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                </button>
                <button
                  onClick={exportStudentsToPDF}
                  className="px-3 sm:px-4 lg:px-5 py-3 sm:py-4 rounded-lg border border-gray-300 hover:bg-gray-100 shadow-sm"
                  title="Export to PDF"
                >
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-5 mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg lg:text-xl text-red-700">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" /> 
              <span>{error}</span>
            </div>
            <button 
              onClick={() => setError(null)}
              className="flex-shrink-0"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
            </button>
          </div>
        )}

        {/* Loading / Empty / Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 py-10 sm:py-20">
            {Array.from({ length: 6 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-8 sm:p-12 lg:p-20 text-center">
            <Users className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto mb-4 sm:mb-6" />
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-700 mb-2 sm:mb-3">
              No Students Found
            </h3>
            <p className="text-base sm:text-lg lg:text-xl text-gray-500">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filter"
                : "Click 'Add New Student' to get started"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {filteredStudents.map((student) => (
              <StudentCard key={student._id} student={student} />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 sm:p-6"
          onClick={() => setIsCreateOpen(false)}
        >
          <div
            className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl p-6 sm:p-8 lg:p-10 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Create New Student
              </h2>
              <button onClick={() => setIsCreateOpen(false)}>
                <X className="w-6 h-6 sm:w-7 sm:h-7 text-gray-500" />
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
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 sm:p-6"
          onClick={() => setIsEditOpen(false)}
        >
          <div
            className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl p-6 sm:p-8 lg:p-10 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Edit Student</h2>
              <button onClick={() => setIsEditOpen(false)}>
                <X className="w-6 h-6 sm:w-7 sm:h-7 text-gray-500" />
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