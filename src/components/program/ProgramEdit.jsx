// components/program/ProgramEdit.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "https://albn-backend.vercel.app/api";

const ProgramEdit = ({ programId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    details: "",
    startDate: "",
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!programId) {
      setLoading(false);
      return;
    }

    const loadProgram = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/program/${programId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFormData({
          title: res.data.title || "",
          details: res.data.details || "",
          startDate: res.data.startDate ? res.data.startDate.split("T")[0] : "",
        });
      } catch {
        setError("Failed to load program data");
      } finally {
        setLoading(false);
      }
    };

    loadProgram();
  }, [programId, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE_URL}/program/${programId}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (onSuccess) onSuccess(); // close modal & refresh parent data
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update program");
    }
  };

  if (loading)
    return (
      <p className="text-center py-10 text-gray-500">Loading...</p>
    );

  return (
    <div className="p-8 max-w-xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-200">
      {error && (
        <p className="text-red-600 text-center mb-4 font-medium">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Program Title"
          required
          className="w-full p-4 text-lg rounded-xl border border-gray-300 
          focus:outline-none focus:ring-2 focus:ring-indigo-400 
          focus:border-indigo-600 shadow-sm transition"
        />

        <textarea
          name="details"
          value={formData.details}
          onChange={handleChange}
          placeholder="Program Details"
          required
          rows={4}
          className="w-full p-4 text-lg rounded-xl border border-gray-300 
          focus:outline-none focus:ring-2 focus:ring-indigo-400 
          focus:border-indigo-600 shadow-sm transition"
        />

        <input
          type="date"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          required
          className="w-full p-4 text-lg rounded-xl border border-gray-300 
          focus:outline-none focus:ring-2 focus:ring-indigo-400 
          focus:border-indigo-600 shadow-sm transition"
        />

        <button
          type="submit"
          className="w-full py-4 text-xl font-semibold text-white 
          rounded-xl bg-gradient-to-r from-blue-500 to-pink-600 
          hover:from-pink-500 hover:to-blue-500 shadow-lg 
          transition-transform transform hover:scale-105"
        >
          Update Program
        </button>
      </form>
    </div>
  );
};

export default ProgramEdit;
