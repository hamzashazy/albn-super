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

  const GroupSkeleton = () => (
  <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 animate-pulse h-48"></div>
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

  // Group Card
  const GroupCard = ({ group }) => (
    <div
      className={`bg-white rounded-2xl p-8 shadow-lg border border-gray-200 relative transition transform hover:shadow-2xl hover:-translate-y-1 ${
        group.isDeleted ? "opacity-70" : ""
      }`}
    >
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center space-x-4">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-md ${
              group.isDeleted
                ? "bg-gradient-to-br from-red-400 to-red-600"
                : "bg-gradient-to-br from-green-500 to-green-700"
            }`}
          >
            {group.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {group.name}
            </h3>
            <span
              className={`px-3 py-1 text-sm rounded-full ${
                group.isDeleted
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
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
        >
          <MoreVertical className="w-6 h-6 text-gray-500" />
        </button>

        {showDropdown === group._id && (
          <div className="absolute right-6 top-14 bg-white rounded-lg shadow-xl border py-3 z-20 w-48 text-lg">
            <button
              onClick={() => {
                setSelectedGroup(group);
                setIsEditOpen(true);
                setShowDropdown(null);
              }}
              className="w-full px-5 py-3 text-left hover:bg-gray-100 flex items-center gap-3"
            >
              <Edit className="w-5 h-5" /> Edit
            </button>
            {group.isDeleted ? (
              <button
                onClick={() => {
                  handleEnable(group._id);
                  setShowDropdown(null);
                }}
                className="w-full px-5 py-3 text-left hover:bg-gray-100 text-blue-600 flex items-center gap-3"
              >
                <RefreshCcw className="w-5 h-5" /> Restore
              </button>
            ) : (
              <button
                onClick={() => {
                  if (window.confirm("Disable this group?")) {
                    handleDisable(group._id);
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

      {/* Murabbi info */}
      {group.murabbi && (
        <div className="text-lg text-gray-700">
          <p>
            <span className="font-medium">Murabbi:</span> {group.murabbi}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-extrabold text-green-700">
              Group Management
            </h1>
            <p className="text-xl text-gray-600">
              Manage groups and their status
            </p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-3 px-7 py-4 rounded-xl text-white bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transition text-lg"
          >
            <Plus className="w-6 h-6" />
            <span className="font-medium">Create Group</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-10">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <StatsCard
            icon={Users}
            label="Total Groups"
            value={stats.total}
            color="text-green-600"
          />
          <StatsCard
            icon={CheckCircle}
            label="Active Groups"
            value={stats.active}
            color="text-blue-600"
          />
          <StatsCard
            icon={XCircle}
            label="Disabled Groups"
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
              placeholder="Search by name or murabbi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-5 py-4 rounded-lg border border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-200 text-xl shadow-sm"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-5 py-4 rounded-lg border border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-200 text-xl"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="disabled">Disabled Only</option>
            </select>
            <button
              onClick={fetchGroups}
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
              <AlertCircle className="w-6 h-6" />
              {error}
            </div>
            <button onClick={() => setError(null)}>
              <X className="w-6 h-6 text-red-600" />
            </button>
          </div>
        )}

        {/* Loading / Empty / Groups */}
        {loading ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {[...Array(6)].map((_, i) => (
      <GroupSkeleton key={i} />
    ))}
  </div>
) : filteredGroups.length === 0 ?
 (
          <div className="bg-white rounded-2xl shadow-lg p-20 text-center">
            <Users className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-3xl font-semibold text-gray-700 mb-3">
              No Groups Found
            </h3>
            <p className="text-xl text-gray-500">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filter"
                : "Click 'Create Group' to add one"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGroups.map((group) => (
              <GroupCard key={group._id} group={group} />
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
                Create New Group
              </h2>
              <button onClick={() => setIsCreateOpen(false)}>
                <X className="w-7 h-7 text-gray-500" />
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

      {/* Edit Modal */}
      {isEditOpen && selectedGroup && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6"
          onClick={() => setIsEditOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Edit Group</h2>
              <button onClick={() => setIsEditOpen(false)}>
                <X className="w-7 h-7 text-gray-500" />
              </button>
            </div>
            <GroupEdit
  groupId={selectedGroup._id}  // ✅ Pass the ID
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
