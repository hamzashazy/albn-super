// components/student/StudentEdit.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "https://albn-backend.vercel.app/api";

const StudentEdit = ({ studentId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    campus: "",
    program: "",
    group: "",
    batch: "",
  });

  const [campuses, setCampuses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [batches, setBatches] = useState([]);
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const [studentRes, campusesRes, programsRes, batchesRes, groupsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/student/${studentId}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/campus/active`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/program/active`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/batch/active`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/group/active`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setFormData({
          name: studentRes.data.name || "",
          email: studentRes.data.email || "",
          password: "",
          campus: studentRes.data.campus?._id || "",
          program: studentRes.data.program?._id || "",
          batch: studentRes.data.batch?._id || "",
          group: studentRes.data.group?._id || "",
        });

        setCampuses(campusesRes.data);
        setPrograms(programsRes.data);
        setBatches(batchesRes.data);
        setGroups(groupsRes.data);
      } catch {
        setError("Failed to load student or dropdown data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [studentId, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = { ...formData };
      if (!updateData.password) delete updateData.password;

      await axios.put(`${API_BASE_URL}/student/${studentId}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update student");
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
          {campuses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>

        <select 
          name="program" 
          value={formData.program} 
          onChange={handleChange} 
          required 
          className="w-full p-4 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-600 shadow-sm transition"
        >
          <option value="">Select Program</option>
          {programs.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
        </select>
        
        <select 
          name="batch" 
          value={formData.batch} 
          onChange={handleChange} 
          required 
          className="w-full p-4 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-600 shadow-sm transition"
        >
          <option value="">Select Batch</option>
          {batches.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>

        <select 
          name="group" 
          value={formData.group} 
          onChange={handleChange} 
          required 
          className="w-full p-4 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-600 shadow-sm transition"
        >
          <option value="">Select Group</option>
          {groups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
        </select>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-gray-300 hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-pink-600 text-white hover:from-pink-500 hover:to-blue-500 shadow-lg transition-transform transform hover:scale-105"
          >
            Update Student
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentEdit;
