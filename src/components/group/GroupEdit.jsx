// components/group/GroupEdit.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "https://albn-backend.vercel.app/api";

const GroupEdit = ({ groupId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    murabbi: "",
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!groupId) {
      setError("No group ID provided");
      setLoading(false);
      return;
    }

    const loadGroup = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/group/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFormData({
          name: res.data.name || "",
          murabbi: res.data.murabbi || "",
        });
      } catch {
        setError("Failed to load group data");
      } finally {
        setLoading(false);
      }
    };

    loadGroup();
  }, [groupId, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupId) return; // safety check

    try {
      await axios.put(`${API_BASE_URL}/group/${groupId}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (onSuccess) onSuccess(); // refresh parent data
      if (onClose) onClose();     // close modal
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update group");
    }
  };

  if (loading)
    return <p className="text-center py-10 text-gray-500">Loading...</p>;

  return (
    <div className="p-8 max-w-xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-200">
      {error && (
        <p className="text-red-600 text-center mb-4 font-medium">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Group Name"
          required
          className="w-full p-4 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-600 shadow-sm transition"
        />

        <input
          type="text"
          name="murabbi"
          value={formData.murabbi}
          onChange={handleChange}
          placeholder="Murabbi"
          required
          className="w-full p-4 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-600 shadow-sm transition"
        />

        <button
          type="submit"
          className="w-full py-4 text-xl font-semibold text-white rounded-xl bg-gradient-to-r from-blue-500 to-pink-600 hover:from-pink-500 hover:to-blue-500 shadow-lg transition-transform transform hover:scale-105"
        >
          Update Group
        </button>
      </form>
    </div>
  );
};

export default GroupEdit;
