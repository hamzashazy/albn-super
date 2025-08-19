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
  MoreVertical,
  AlertCircle,
  X
} from "lucide-react";

import ProgramCreate from "./ProgramCreate";
import ProgramEdit from "./ProgramEdit";

const API_BASE_URL = "https://albn-backend.vercel.app/api/program";

const ProgramManagement = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showDropdown, setShowDropdown] = useState(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);

  const [stats, setStats] = useState({ total: 0, active: 0, disabled: 0 });

  // Skeleton Card to render during loading
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="w-1/2 h-6 bg-gray-300 rounded"></div>
        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
      </div>
      <div className="mt-4 space-y-4">
        <div className="w-full h-4 bg-gray-300 rounded"></div>
        <div className="w-5/6 h-4 bg-gray-300 rounded"></div>
        <div className="w-2/3 h-4 bg-gray-300 rounded"></div>
      </div>
    </div>
  );

  // Fetch programs
  const fetchPrograms = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      
      setPrograms(data);

      setStats({
        total: data.length,
        active: data.filter(p => !p.isDeleted).length,
        disabled: data.filter(p => p.isDeleted).length
      });
    } catch {
      setError("Failed to fetch programs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPrograms(); }, []);

  // Soft delete
  const handleDeleteProgram = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");

      setPrograms(prev =>
        prev.map(p => p._id === id ? { ...p, isDeleted: true } : p)
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
      const res = await fetch(`${API_BASE_URL}/restore/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      if (!res.ok) throw new Error("Failed to restore");

      setPrograms(prev =>
        prev.map(p => p._id === id ? { ...p, isDeleted: false } : p)
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

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filterStatus === "all" ||
      (filterStatus === "active" && !program.isDeleted) ||
      (filterStatus === "disabled" && program.isDeleted);
    return matchesSearch && matchesFilter;
  });

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

  // Program Card
  const ProgramCard = ({ program }) => (
    <div
      className={`bg-white rounded-2xl p-8 shadow-lg border border-gray-200 relative transition transform hover:shadow-2xl hover:-translate-y-1 ${
        program.isDeleted ? "opacity-70" : ""
      }`}
    >
      <div className="flex justify-between items-start mb-5">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{program.title}</h3>
          <span
            className={`px-3 py-1 text-sm rounded-full ${
              program.isDeleted
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {program.isDeleted ? "Disabled" : "Active"}
          </span>
        </div>
        <button
          onClick={() =>
            setShowDropdown(showDropdown === program._id ? null : program._id)
          }
        >
          <MoreVertical className="w-6 h-6 text-gray-500" />
        </button>
        {showDropdown === program._id && (
          <div className="absolute right-6 top-14 bg-white rounded-lg shadow-xl border py-3 z-20 w-48 text-lg">
            <button
              onClick={() => {
                setSelectedProgram(program);
                setIsEditOpen(true);
                setShowDropdown(null);
              }}
              className="w-full px-5 py-3 text-left hover:bg-gray-100 flex items-center gap-3"
            >
              <Edit className="w-5 h-5" /> Edit
            </button>
            {program.isDeleted ? (
              <button
                onClick={() => {
                  handleRestoreProgram(program._id);
                  setShowDropdown(null);
                }}
                className="w-full px-5 py-3 text-left hover:bg-gray-100 text-blue-600 flex items-center gap-3"
              >
                <RefreshCcw className="w-5 h-5" /> Restore
              </button>
            ) : (
              <button
                onClick={() => {
                  if (window.confirm("Disable this program?")) {
                    handleDeleteProgram(program._id);
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

      {/* Extra Details */}
      {program.details && (
        <p className="text-gray-600 text-lg mb-4">{program.details}</p>
      )}

      {program.startDate && (
        <p className="text-gray-500 text-md">
          Founded on:{" "}
          {new Date(program.startDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-extrabold text-indigo-700">Program Management</h1>
            <p className="text-xl text-gray-600">Manage system programs and their status</p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-3 px-7 py-4 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition text-lg"
          >
            <Plus className="w-6 h-6" />
            <span className="font-medium">Add New Program</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-10">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <StatsCard icon={Users} label="Total Programs" value={stats.total} color="text-indigo-600" />
          <StatsCard icon={CheckCircle} label="Active Programs" value={stats.active} color="text-green-600" />
          <StatsCard icon={XCircle} label="Disabled Programs" value={stats.disabled} color="text-red-600" />
        </div>

        {/* Search + Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-10 flex flex-col md:flex-row gap-5">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-4 text-gray-400 w-6 h-6" />
            <input
              type="text"
              placeholder="Search by name..."
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
              onClick={fetchPrograms}
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
            <button onClick={() => setError(null)}><X className="w-6 h-6 text-red-600" /></button>
          </div>
        )}

        {/* Loading with Skeleton or Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-20">
            {Array.from({ length: 3 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-20 text-center">
            <Users className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-3xl font-semibold text-gray-700 mb-3">No Programs Found</h3>
            <p className="text-xl text-gray-500">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filter"
                : "Click 'Add New Program' to get started"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPrograms.map(program => (
              <ProgramCard key={program._id} program={program} />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6" onClick={() => setIsCreateOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-10" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Create New Program</h2>
              <button onClick={() => setIsCreateOpen(false)}><X className="w-7 h-7 text-gray-500" /></button>
            </div>
            <ProgramCreate onSuccess={() => { setIsCreateOpen(false); fetchPrograms(); }} />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && selectedProgram && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6" onClick={() => setIsEditOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-10" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Edit Program</h2>
              <button onClick={() => setIsEditOpen(false)}><X className="w-7 h-7 text-gray-500" /></button>
            </div>
            <ProgramEdit
  programId={selectedProgram._id}  // ✅ Pass just the ID
  onClose={() => { setIsEditOpen(false); fetchPrograms(); }}
  onSuccess={() => { setIsEditOpen(false); fetchPrograms(); }}
/>

            
            </div>
        </div>
      )}
    </div>
  );
};

export default ProgramManagement;
