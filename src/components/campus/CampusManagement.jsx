// components/campus/CampusManagement.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Edit,
  Trash2,
  RefreshCcw,
  Search,
  Building,
  CheckCircle,
  XCircle,
  MapPin,
  Users,
  MoreVertical,
  UserPlus,
  AlertCircle,
  X,
  CreditCard,
} from "lucide-react";

import CampusCreate from "./CampusCreate";
import CampusEdit from "./CampusEdit";

const API_BASE_URL = "https://albn-backend.vercel.app/api";

const CampusManagement = () => {
  const [campuses, setCampuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showDropdown, setShowDropdown] = useState(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState(null);

  const [stats, setStats] = useState({ total: 0, active: 0, disabled: 0 });
  
  // Add ref for dropdown positioning
  const dropdownRefs = useRef({});

  // Fetch campuses
  const fetchCampuses = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/campus`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCampuses(data);

      const total = data.length;
      const active = data.filter(c => !c.isDeleted).length;
      const disabled = data.filter(c => c.isDeleted).length;
      setStats({ total, active, disabled });
    } catch {
      setError("Failed to fetch campuses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle dropdown toggle with proper event handling
  const handleDropdownToggle = (e, campusId) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropdown(showDropdown === campusId ? null : campusId);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.dropdown-container')) {
        setShowDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

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

  // Disable campus (soft delete)
  const handleDeleteCampus = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/campus/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to disable campus");

      setCampuses(prev =>
        prev.map(c => c._id === id ? { ...c, isDeleted: true } : c)
      );
      setStats(prev => ({
        ...prev,
        active: prev.active - 1,
        disabled: prev.disabled + 1
      }));
    } catch {
      setError("Failed to disable campus");
    } finally {
      setShowDropdown(null);
    }
  };

  // Restore campus
  const handleRestoreCampus = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/campus/restore/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      if (!res.ok) throw new Error("Failed to restore campus");

      setCampuses(prev =>
        prev.map(c => c._id === id ? { ...c, isDeleted: false } : c)
      );
      setStats(prev => ({
        ...prev,
        active: prev.active + 1,
        disabled: prev.disabled - 1
      }));
    } catch {
      setError("Failed to restore campus");
    } finally {
      setShowDropdown(null);
    }
  };

  // Handle edit click
  const handleEditClick = (e, campus) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedCampus(campus);
    setIsEditOpen(true);
    setShowDropdown(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredCampuses = campuses.filter(campus => {
    const matchesSearch =
      campus.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campus.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campus.zimedaar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(formatDate(campus.founding_Date)).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && !campus.isDeleted) ||
      (filterStatus === "disabled" && campus.isDeleted);

    return matchesSearch && matchesFilter;
  });

  useEffect(() => { fetchCampuses(); }, []);

  // Stats Card - Made responsive
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

  // Campus Card - Fixed dropdown positioning
  const CampusCard = ({ campus }) => (
    <div className={`bg-white rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-200 relative transition transform hover:shadow-2xl hover:-translate-y-1 ${
      campus.isDeleted ? "opacity-70" : ""
    }`}>
      <div className="flex justify-between items-start mb-4 sm:mb-5">
        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
          <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl lg:text-2xl shadow-md flex-shrink-0 ${
            campus.isDeleted
              ? "bg-gradient-to-br from-red-400 to-red-600"
              : "bg-gradient-to-br from-indigo-500 to-indigo-700"
          }`}>
            {campus.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{campus.name}</h3>
            <span className={`inline-block px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-full mt-1 ${
              campus.isDeleted ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
            }`}>
              {campus.isDeleted ? "Disabled" : "Active"}
            </span>
          </div>
        </div>
        
        {/* Improved dropdown container */}
        <div className="dropdown-container relative flex-shrink-0">
          <button 
            type="button"
            onClick={(e) => handleDropdownToggle(e, campus._id)}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors duration-150"
          >
            <MoreVertical className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
          </button>
          
          {/* Fixed dropdown positioning */}
          {showDropdown === campus._id && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-30 w-40 sm:w-48 text-sm sm:text-base">
              <button
                type="button"
                onClick={(e) => handleEditClick(e, campus)}
                className="w-full px-3 sm:px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 sm:gap-3 text-gray-700 transition-colors duration-150"
              >
                <Edit className="w-4 h-4 sm:w-5 sm:h-5" /> Edit
              </button>
              {campus.isDeleted ? (
                <button
                  type="button"
                  onClick={(e) => handleRestoreCampus(e, campus._id)}
                  className="w-full px-3 sm:px-4 py-2 text-left hover:bg-gray-100 text-blue-600 flex items-center gap-2 sm:gap-3 transition-colors duration-150"
                >
                  <RefreshCcw className="w-4 h-4 sm:w-5 sm:h-5" /> Restore
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    if (window.confirm("Disable this campus?")) {
                      handleDeleteCampus(e, campus._id);
                    } else {
                      setShowDropdown(null);
                    }
                  }}
                  className="w-full px-3 sm:px-4 py-2 text-left hover:bg-gray-100 text-red-600 flex items-center gap-2 sm:gap-3 transition-colors duration-150"
                >
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" /> Disable
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2 sm:space-y-3 text-sm sm:text-base lg:text-lg text-gray-700">
        {campus.city && (
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> 
            <span className="truncate">{campus.city}</span>
          </div>
        )}
        {campus.zimedaar && (
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> 
            <span className="truncate">{campus.zimedaar}</span>
          </div>
        )}
        
        {campus.founding_date && (
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> 
            <span className="truncate">{formatDate(campus.founding_date)}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100">
      {/* Header - Improved mobile layout */}
      <div className="bg-white border-b shadow-sm md:sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-indigo-700">Campus Management</h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 mt-1">Manage campuses and their details</p>
            </div>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 lg:px-7 py-3 sm:py-4 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition text-sm sm:text-base lg:text-lg w-full sm:w-auto"
            >
              <UserPlus className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="font-medium">Add New Campus</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Stats - Better mobile grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 lg:mb-10">
          <StatsCard icon={Building} label="Total Campuses" value={stats.total} color="text-indigo-600" />
          <StatsCard icon={CheckCircle} label="Active Campuses" value={stats.active} color="text-green-600" />
          <div className="sm:col-span-2 lg:col-span-1">
            <StatsCard icon={XCircle} label="Disabled Campuses" value={stats.disabled} color="text-red-600" />
          </div>
        </div>

        {/* Search + Filter - Stacked on mobile */}
        <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-8 lg:mb-10">
          <div className="flex flex-col gap-4 sm:gap-5">
            <div className="flex-1 relative">
              <Search className="absolute left-3 sm:left-4 top-3 sm:top-4 text-gray-400 w-5 h-5 sm:w-6 sm:h-6" />
              <input
                type="text"
                placeholder="Search by name, city, or zimedaar..."
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
              <button
                onClick={fetchCampuses}
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
        ) : filteredCampuses.length === 0 ? (
          <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-8 sm:p-12 lg:p-20 text-center">
            <Building className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto mb-4 sm:mb-6" />
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-700 mb-2 sm:mb-3">No Campuses Found</h3>
            <p className="text-base sm:text-lg lg:text-xl text-gray-500 max-w-md mx-auto">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filter"
                : "Click 'Add New Campus' to get started"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {filteredCampuses.map(campus => (
              <CampusCard key={campus._id} campus={campus} />
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
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Create New Campus</h2>
              <button 
                onClick={() => setIsCreateOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-md"
              >
                <X className="w-6 h-6 sm:w-7 sm:h-7 text-gray-500" />
              </button>
            </div>
            <CampusCreate onSuccess={() => { setIsCreateOpen(false); fetchCampuses(); }} />
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
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Edit Campus</h2>
              <button 
                onClick={() => setIsEditOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-md"
              >
                <X className="w-6 h-6 sm:w-7 sm:h-7 text-gray-500" />
              </button>
            </div>
            <CampusEdit campusId={selectedCampus?._id} onSuccess={() => { setIsEditOpen(false); fetchCampuses(); }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CampusManagement;