import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "https://albn-backend.vercel.app/api";

const AdminEdit = ({ adminId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    campus: "",
    cnic: "",
  });

  const [campuses, setCampuses] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!adminId){
    setLoading(false);
    return;
  }

    const loadData = async () => {
      try {
        const [adminRes, campusesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/admin/${adminId}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/campus/active`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setFormData({
          name: adminRes.data.name,
          email: adminRes.data.email,
          password: "",
          campus: adminRes.data.campus?._id || "",
          cnic: adminRes.data.cnic || "",
        });

        setCampuses(campusesRes.data);
      } catch {
        setError("Failed to load admin or campuses data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [adminId, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = { ...formData };
      if (!updateData.password) delete updateData.password;

      await axios.put(`${API_BASE_URL}/admin/${adminId}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (onSuccess) onSuccess(); // close modal & refresh data in parent
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update admin");
    }
  };

  if (loading) return <p className="text-center py-10 text-gray-500">Loading...</p>;

  return (
    <div className="p-8 max-w-xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-200">
      {error && <p className="text-red-600 text-center mb-4 font-medium">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <input 
          type="text" 
          name="name" 
          value={formData.name}
          onChange={handleChange} 
          placeholder="Full Name" 
          required 
          className="w-full p-4 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-600 shadow-sm transition"
        />

        <input 
          type="email" 
          name="email" 
          value={formData.email}
          onChange={handleChange} 
          placeholder="Email Address" 
          required 
          className="w-full p-4 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-600 shadow-sm transition"
        />

        <input 
          type="password" 
          name="password" 
          value={formData.password}
          onChange={handleChange} 
          placeholder="New Password (leave blank to keep current)" 
          className="w-full p-4 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-600 shadow-sm transition"
        />

        <select 
          name="campus" 
          value={formData.campus} 
          onChange={handleChange} 
          required 
          className="w-full p-4 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-600 shadow-sm transition"
        >
          <option value="">Select Campus</option>
          {campuses.map(campus => (
            <option key={campus._id} value={campus._id}>{campus.name}</option>
          ))}
        </select>

        <input 
          type="number" 
          name="cnic" 
          value={formData.cnic}
          onChange={handleChange} 
          placeholder="CNIC (Optional)" 
          className="w-full p-4 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-600 shadow-sm transition"
        />

        <button 
          type="submit" 
          className="w-full py-4 text-xl font-semibold text-white rounded-xl bg-gradient-to-r from-blue-500 to-pink-600 hover:from-pink-500 hover:to-blue-500 shadow-lg transition-transform transform hover:scale-105"
        >
          Update Admin
        </button>
      </form>
    </div>
  );
};

export default AdminEdit;
