// components/group/GroupManagement.jsx
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
  X,
} from "lucide-react";
import GroupCreate from "./GroupCreate";
import GroupEdit from "./GroupEdit";

const API_BASE_URL = "https://albn-backend.vercel.app/api/group";

const GroupManagement = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showDropdown, setShowDropdown] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [stats, setStats] = useState({ total: 0, active: 0, disabled: 0 });

  // Fetch groups
  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch groups");
      const data = await res.json();
      setGroups(data);
      const total = data.length;
      const active = data.filter((g) => !g.isDeleted).length;
      const disabled = data.filter((g) => g.isDeleted).length;
      setStats({ total, active, disabled });
    } catch {
      setError("Failed to fetch groups. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Group Skeleton - Made responsive
  const GroupSkeleton = () => (
    <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-200 animate-pulse h-40 sm:h-44 lg:h-48">
      <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-5">
        <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gray-300 rounded-full"></div>
        <div className="flex-1">
          <div className="w-3/4 h-4 sm:h-5 lg:h-6 bg-gray-300 rounded mb-2"></div>
          <div className="w-1/2 h-3 sm:h-4 bg-gray-300 rounded"></div>
        </div>
      </div>
      <div className="space-y-2 sm:space-y-3">
        <div className="w-full h-3 sm:h-4 bg-gray-300 rounded"></div>
        <div className="w-2/3 h-3 sm:h-4 bg-gray-300 rounded"></div>
      </div>
    </div>
  );

  // Disable (soft delete)
  const handleDisable = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to disable group");
      setGroups((prev) =>
        prev.map((g) => (g._id === id ? { ...g, isDeleted: true } : g))
      );
      setStats((prev) => ({
        ...prev,
        active: prev.active - 1,
        disabled: prev.disabled + 1,
      }));
    } catch {
      setError("Failed to disable group");
    }
  };

  // Restore
  const handleEnable = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/restore/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to enable group");
      setGroups((prev) =>
        prev.map((g) => (g._id === id ? { ...g, isDeleted: false } : g))
      );
      setStats((prev) => ({
        ...prev,
        active: prev.active + 1,
        disabled: prev.disabled - 1,
      }));
    } catch {
      setError("Failed to enable group");
    }
  };

  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      group.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.murabbi?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && !group.isDeleted) ||
      (filterStatus === "disabled" && group.isDeleted);

    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    fetchGroups();
  }, []);

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

  // Group Card - Improved mobile layout
  const GroupCard = ({ group }) => (
    <div
      className={`bg-white rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-200 relative transition transform hover:shadow-2xl hover:-translate-y-1 ${
        group.isDeleted ? "opacity-70" : ""
      }`}
    >
      <div className="flex justify-between items-start mb-4 sm:mb-5">
        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
          <div
            className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl lg:text-2xl shadow-md flex-shrink-0 ${
              group.isDeleted
                ? "bg-gradient-to-br from-red-400 to-red-600"
                : "bg-gradient-to-br from-indigo-500 to-indigo-700"
            }`}
          >
            {group.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
              {group.name}
            </h3>
            <span
              className={`inline-block px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-full mt-1 ${
                group.isDeleted
                  ? "bg-red-100 text-red-700"
                  : "bg-indigo-100 text-indigo-700"
              }`}
            >
              {group.isDeleted ? "Disabled" : "Active"}
            </span>
          </div>
        </div>

        {/* Dropdown */}
        <button
          onClick={() =>
            setShowDropdown(showDropdown === group._id ? null : group._id)
          }
          className="p-1 hover:bg-gray-100 rounded-md flex-shrink-0"
        >
          <MoreVertical className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
        </button>

        {showDropdown === group._id && (
          <div className="absolute right-2 sm:right-6 top-12 sm:top-14 bg-white rounded-lg shadow-xl border py-2 sm:py-3 z-20 w-40 sm:w-48 text-sm sm:text-lg">
            <button
              onClick={() => {
                setSelectedGroup(group);
                setIsEditOpen(true);
                setShowDropdown(null);
              }}
              className="w-full px-3 sm:px-5 py-2 sm:py-3 text-left hover:bg-gray-100 flex items-center gap-2 sm:gap-3"
            >
              <Edit className="w-4 h-4 sm:w-5 sm:h-5" /> Edit
            </button>
            {group.isDeleted ? (
              <button
                onClick={() => {
                  handleEnable(group._id);
                  setShowDropdown(null);
                }}
                className="w-full px-3 sm:px-5 py-2 sm:py-3 text-left hover:bg-gray-100 text-blue-600 flex items-center gap-2 sm:gap-3"
              >
                <RefreshCcw className="w-4 h-4 sm:w-5 sm:h-5" /> Restore
              </button>
            ) : (
              <button
                onClick={() => {
                  if (window.confirm("Disable this group?")) {
                    handleDisable(group._id);
                    setShowDropdown(null);
                  }
                }}
                className="w-full px-3 sm:px-5 py-2 sm:py-3 text-left hover:bg-gray-100 text-red-600 flex items-center gap-2 sm:gap-3"
              >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" /> Disable
              </button>
            )}
          </div>
        )}
      </div>

      {/* Murabbi info */}
      {group.murabbi && (
        <div className="text-sm sm:text-base lg:text-lg text-gray-700">
          <p className="truncate">
            <span className="font-medium">Murabbi:</span> {group.murabbi}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100">
      {/* Header - Improved mobile layout */}
      <div className="bg-white border-b shadow-sm md:sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-indigo-700">
                Group Management
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 mt-1">
                Manage groups and their status
              </p>
            </div>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 lg:px-7 py-3 sm:py-4 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition text-sm sm:text-base lg:text-lg w-full sm:w-auto"
            >
              <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="font-medium">Create Group</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Stats - Better mobile grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 lg:mb-10">
          <StatsCard
            icon={Users}
            label="Total Groups"
            value={stats.total}
            color="text-indigo-600"
          />
          <StatsCard
            icon={CheckCircle}
            label="Active Groups"
            value={stats.active}
            color="text-blue-600"
          />
          <div className="sm:col-span-2 lg:col-span-1">
            <StatsCard
              icon={XCircle}
              label="Disabled Groups"
              value={stats.disabled}
              color="text-red-600"
            />
          </div>
        </div>

        {/* Search + Filter - Stacked on mobile */}
        <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-8 lg:mb-10">
          <div className="flex flex-col gap-4 sm:gap-5">
            <div className="flex-1 relative">
              <Search className="absolute left-3 sm:left-4 top-3 sm:top-4 text-gray-400 w-5 h-5 sm:w-6 sm:h-6" />
              <input
                type="text"
                placeholder="Search by name or murabbi..."
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
                onClick={fetchGroups}
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

        {/* Loading / Empty / Groups - Better mobile grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[...Array(6)].map((_, i) => (
              <GroupSkeleton key={i} />
            ))}
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-8 sm:p-12 lg:p-20 text-center">
            <Users className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto mb-4 sm:mb-6" />
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-700 mb-2 sm:mb-3">
              No Groups Found
            </h3>
            <p className="text-base sm:text-lg lg:text-xl text-gray-500 max-w-md mx-auto">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filter"
                : "Click 'Create Group' to add one"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {filteredGroups.map((group) => (
              <GroupCard key={group._id} group={group} />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal - Better mobile handling */}
      {isCreateOpen && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 sm:p-6"
          onClick={() => setIsCreateOpen(false)}
        >
          <div
            className="bg-white rounded-xl lg:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 lg:p-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Create New Group
              </h2>
              <button 
                onClick={() => setIsCreateOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-md"
              >
                <X className="w-6 h-6 sm:w-7 sm:h-7 text-gray-500" />
              </button>
            </div>
            <GroupCreate
              onClose={() => {
                setIsCreateOpen(false);
                fetchGroups();
              }}
            />
          </div>
        </div>
      )}

      {/* Edit Modal - Better mobile handling */}
      {isEditOpen && selectedGroup && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 sm:p-6"
          onClick={() => setIsEditOpen(false)}
        >
          <div
            className="bg-white rounded-xl lg:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 lg:p-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Edit Group</h2>
              <button 
                onClick={() => setIsEditOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-md"
              >
                <X className="w-6 h-6 sm:w-7 sm:h-7 text-gray-500" />
              </button>
            </div>
            <GroupEdit
              groupId={selectedGroup._id}
              onClose={() => {
                setIsEditOpen(false);
                fetchGroups();
              }}
              onSuccess={() => {
                setIsEditOpen(false);
                fetchGroups();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupManagement;