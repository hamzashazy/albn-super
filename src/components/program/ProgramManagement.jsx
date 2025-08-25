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
  Info,
  Building,
  CreditCard,
  MoreVertical,
  UserPlus,
  AlertCircle,
  X
} from "lucide-react";

import ProgramCreate from "./ProgramCreate";
import ProgramEdit from "./ProgramEdit";

const API_BASE_URL = "https://albn-backend.vercel.app/api";

const ProgramManagement = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [campusFilter, setCampusFilter] = useState("all");
  const [showDropdown, setShowDropdown] = useState(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);

  const [stats, setStats] = useState({ total: 0, active: 0, disabled: 0 });
  const [campuses, setCampuses] = useState([]);

  // Fetch programs
  const fetchPrograms = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/program`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPrograms(data);

      const total = data.length;
      const active = data.filter(a => !a.isDeleted).length;
      const disabled = data.filter(a => a.isDeleted).length;
      setStats({ total, active, disabled });
    } catch {
      setError("Failed to fetch programs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch campuses for filter dropdown
  const fetchCampuses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/campus/active`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setCampuses(Array.isArray(data) ? data : []);
      }
    } catch {}
  };

  // Soft delete
  const handleDeleteProgram = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/program/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");

      setPrograms(prev =>
        prev.map(a => a._id === id ? { ...a, isDeleted: true } : a)
      );
      setStats(prev => ({
        ...prev,
        active: prev.active - 1,
        disabled: prev.disabled + 1
      }));
    } catch {
      setError("Failed to disable program");
    }
  };

  // Restore
  const handleRestoreProgram = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/program/restore/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      if (!res.ok) throw new Error("Failed to restore");

      setPrograms(prev =>
        prev.map(a => a._id === id ? { ...a, isDeleted: false } : a)
      );
      setStats(prev => ({
        ...prev,
        active: prev.active + 1,
        disabled: prev.disabled - 1
      }));
    } catch {
      setError("Failed to enable program");
    }
  };


  const formatDate = (dateString) => {
      if (!dateString) return "";
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    };

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = 
      program.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.campus?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(formatDate(program.startDate)).toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = 
      filterStatus === "all" ||
      (filterStatus === "active" && !program.isDeleted) ||
      (filterStatus === "disabled" && program.isDeleted);

    const matchesCampus =
      campusFilter === "all" || (typeof program.campus === 'string' ? program.campus === campusFilter : program.campus?._id === campusFilter);

    return matchesSearch && matchesFilter && matchesCampus;
  });

  useEffect(() => { fetchPrograms(); fetchCampuses(); }, []);

  // Stats Card - Made more responsive
  const StatsCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-200 hover:shadow-xl transition">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm sm:text-base lg:text-lg text-gray-500">{label}</p>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900">{value}</p>
        </div>
        <Icon className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 ${color}`} />
      </div>
    </div>
  );

  // Program Card - Improved mobile layout
  const ProgramCard = ({ program }) => (
    <div className={`bg-white rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-200 relative transition transform hover:shadow-2xl hover:-translate-y-1 ${
      program.isDeleted ? "opacity-70" : ""
    }`}>
      <div className="flex justify-between items-start mb-4 sm:mb-5">
        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
          <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl lg:text-2xl shadow-md flex-shrink-0 ${
            program.isDeleted
              ? "bg-gradient-to-br from-red-400 to-red-600"
              : "bg-gradient-to-br from-indigo-500 to-indigo-700"
          }`}>
            {program.title?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{program.title}</h3>
            <span className={`inline-block px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-full mt-1 ${
              program.isDeleted ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
            }`}>
              {program.isDeleted ? "Disabled" : "Active"}
            </span>
          </div>
        </div>
        <button 
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowDropdown(showDropdown === program._id ? null : program._id); }}
          className="p-1 hover:bg-gray-100 rounded-md flex-shrink-0"
        >
          <MoreVertical className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
        </button>
        {showDropdown === program._id && (
          <div className="absolute right-2 sm:right-6 top-12 sm:top-14 bg-white rounded-lg shadow-xl border py-2 sm:py-3 z-20 w-40 sm:w-48 text-sm sm:text-lg">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedProgram(program); setIsEditOpen(true); setShowDropdown(null); }}
              className="w-full px-3 sm:px-5 py-2 sm:py-3 text-left hover:bg-gray-100 flex items-center gap-2 sm:gap-3"
            >
              <Edit className="w-4 h-4 sm:w-5 sm:h-5" /> Edit
            </button>
            {program.isDeleted ? (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRestoreProgram(program._id); setShowDropdown(null); }}
                className="w-full px-3 sm:px-5 py-2 sm:py-3 text-left hover:bg-gray-100 text-blue-600 flex items-center gap-2 sm:gap-3"
              >
                <RefreshCcw className="w-4 h-4 sm:w-5 sm:h-5" /> Restore
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (window.confirm("Disable this program?")) { handleDeleteProgram(program._id); setShowDropdown(null); }}}
                className="w-full px-3 sm:px-5 py-2 sm:py-3 text-left hover:bg-gray-100 text-red-600 flex items-center gap-2 sm:gap-3"
              >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" /> Disable
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2 sm:space-y-3 text-sm sm:text-base lg:text-lg text-gray-700">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Info className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> 
          <span className="truncate">{program.details}</span>
        </div>
        {program.campus?.name && (
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Building className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> 
            <span className="truncate">{program.campus.name}</span>
          </div>
        )}
        {program.startDate && (
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> 
            <span className="truncate">{formatDate(program.startDate)}</span>
          </div>
        )}

      </div>
    </div>
  );

  // Skeleton Card - Made responsive
  const SkeletonCard = () => (
    <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-200 animate-pulse">
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
      {/* Header - Improved mobile layout */}
      <div className="bg-white border-b shadow-sm md:md:sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-indigo-700">Program Management</h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 mt-1">Manage system programistrators and their permissions</p>
            </div>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 lg:px-7 py-3 sm:py-4 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition text-sm sm:text-base lg:text-lg w-full sm:w-auto"
            >
              <UserPlus className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="font-medium">Add New Program</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Stats - Better mobile grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 lg:mb-10">
          <StatsCard icon={Users} label="Total Programs" value={stats.total} color="text-indigo-600" />
          <StatsCard icon={CheckCircle} label="Active Programs" value={stats.active} color="text-green-600" />
          <div className="sm:col-span-2 lg:col-span-1">
            <StatsCard icon={XCircle} label="Disabled Programs" value={stats.disabled} color="text-red-600" />
          </div>
        </div>

        {/* Search + Filter - Stacked on mobile */}
        <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-8 lg:mb-10">
          <div className="flex flex-col gap-4 sm:gap-5">
            <div className="flex-1 relative">
              <Search className="absolute left-3 sm:left-4 top-3 sm:top-4 text-gray-400 w-5 h-5 sm:w-6 sm:h-6" />
              <input
                type="text"
                placeholder="Search by title, details, campus, or Start Date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-4 sm:pr-5 py-3 sm:py-4 rounded-lg border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 text-base sm:text-lg lg:text-xl shadow-sm"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 sm:flex-none px-4 sm:px-5 py-3 sm:py-4 rounded-lg border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 text-base sm:text-lg lg:text-xl"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="disabled">Disabled Only</option>
              </select>
              <select
                value={campusFilter}
                onChange={(e) => setCampusFilter(e.target.value)}
                className="flex-1 sm:flex-none px-4 sm:px-5 py-3 sm:py-4 rounded-lg border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 text-base sm:text-lg lg:text-xl"
              >
                <option value="all">All Campuses</option>
                {campuses.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              <button
                onClick={fetchPrograms}
                className="px-4 sm:px-5 py-3 sm:py-4 rounded-lg border border-gray-300 hover:bg-gray-100 shadow-sm flex items-center justify-center"
              >
                <RefreshCcw className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Error - Better mobile layout */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-5 mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3 text-base sm:text-lg lg:text-xl text-red-700">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" /> 
              <span className="break-words">{error}</span>
            </div>
            <button 
              onClick={() => setError(null)}
              className="self-end sm:self-center p-1 hover:bg-red-100 rounded"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
            </button>
          </div>
        )}

        {/* Loading with animation - Better mobile grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 py-10 sm:py-20">
            {Array.from({ length: 6 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-8 sm:p-12 lg:p-20 text-center">
            <Users className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto mb-4 sm:mb-6" />
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-700 mb-2 sm:mb-3">No Programs Found</h3>
            <p className="text-base sm:text-lg lg:text-xl text-gray-500 max-w-md mx-auto">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filter"
                : "Click 'Add New Program' to get started"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {filteredPrograms.map(program => (
              <ProgramCard key={program._id} program={program} />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal - Better mobile handling */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 sm:p-6" onClick={() => setIsCreateOpen(false)}>
          <div 
            className="bg-white rounded-xl lg:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 lg:p-10" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Create New Program</h2>
              <button 
                onClick={() => setIsCreateOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-md"
              >
                <X className="w-6 h-6 sm:w-7 sm:h-7 text-gray-500" />
              </button>
            </div>
            <ProgramCreate onSuccess={() => { setIsCreateOpen(false); fetchPrograms(); }} />
          </div>
        </div>
      )}

      {/* Edit Modal - Better mobile handling */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 sm:p-6" onClick={() => setIsEditOpen(false)}>
          <div 
            className="bg-white rounded-xl lg:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 lg:p-10" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Edit Program</h2>
              <button 
                onClick={() => setIsEditOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-md"
              >
                <X className="w-6 h-6 sm:w-7 sm:h-7 text-gray-500" />
              </button>
            </div>
            <ProgramEdit programId={selectedProgram?._id} onSuccess={() => { setIsEditOpen(false); fetchPrograms(); }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramManagement;