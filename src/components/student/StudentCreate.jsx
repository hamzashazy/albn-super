import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'https://albn-backend.vercel.app/api';

const StudentCreate = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', campus: '', program: '', group: ''
  });

  const [campuses, setCampuses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState(null);

  const fetchData = async (endpoint, setter) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/${endpoint}/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setter(res.data);
    } catch {
      setError(`Failed to load ${endpoint}`);
    }
  };

  useEffect(() => {
    fetchData('campus', setCampuses);
    fetchData('program', setPrograms);
    fetchData('group', setGroups);
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/student/register`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create student');
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-200">
      {error && <p className="text-red-600 text-center mb-4 font-medium">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <input type="text" name="name" placeholder="Name" onChange={handleChange} required className="w-full p-4 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm transition" />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required className="w-full p-4 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm transition" />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required className="w-full p-4 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm transition" />
        
        {/* Campus Dropdown */}
        <select name="campus" value={formData.campus} onChange={handleChange} required className="w-full p-4 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm transition">
          <option value="">Select Campus</option>
          {campuses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>

        {/* Program Dropdown */}
        <select name="program" value={formData.program} onChange={handleChange} required className="w-full p-4 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm transition">
          <option value="">Select Program</option>
          {programs.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
        </select>

        {/* Group Dropdown */}
        <select name="group" value={formData.group} onChange={handleChange} required className="w-full p-4 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm transition">
          <option value="">Select Group</option>
          {groups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
        </select>

        <button type="submit" className="w-full py-4 text-xl font-semibold text-white rounded-xl bg-gradient-to-r from-blue-500 to-pink-600 hover:from-indigo-600 hover:to-blue-500 shadow-lg transition-transform transform hover:scale-105">
          Create Student
        </button>
      </form>
    </div>
  );
};

export default StudentCreate;
