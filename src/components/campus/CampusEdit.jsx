// components/campus/CampusEdit.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "https://albn-backend.vercel.app/api";

const CampusEdit = ({ campusId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    zimedaar: "",
    founding_date: "",
    status: "active", // Optional UI status
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!campusId) {
      setLoading(false);
      return;
    }

    const loadCampus = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/campus/${campusId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFormData({
          name: res.data.name,
          city: res.data.city,
          zimedaar: res.data.zimedaar,
          founding_date: res.data.founding_date
            ? res.data.founding_date.split("T")[0]
            : "",
        });
      } catch (err) {
        setError("Failed to load campus data");
      } finally {
        setLoading(false);
      }
    };

    loadCampus();
  }, [campusId, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name.trim(),
        city: formData.city.trim(),
        zimedaar: formData.zimedaar.trim(),
        founding_date: formData.founding_date,
      };

      await axios.put(`${API_BASE_URL}/campus/${campusId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update campus");
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
          placeholder="Campus Name"
          required
          className="w-full p-4 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-600 shadow-sm transition"
        />

        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleChange}
          placeholder="City"
          required
          className="w-full p-4 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-600 shadow-sm transition"
        />

        <input
          type="text"
          name="zimedaar"
          value={formData.zimedaar}
          onChange={handleChange}
          placeholder="Zimedaar"
          required
          className="w-full p-4 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-600 shadow-sm transition"
        />

        <input
          type="date"
          name="founding_date"
          value={formData.founding_date}
          onChange={handleChange}
          placeholder="Founding Date"
          required
          className="w-full p-4 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-600 shadow-sm transition"
        />

        <button
          type="submit"
          className="w-full py-4 text-xl font-semibold text-white rounded-xl bg-gradient-to-r from-blue-500 to-pink-600 hover:from-pink-500 hover:to-blue-500 shadow-lg transition-transform transform hover:scale-105"
        >
          Update Campus
        </button>
      </form>
    </div>
  );
};

export default CampusEdit;
