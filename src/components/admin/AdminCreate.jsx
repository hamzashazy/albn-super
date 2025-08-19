import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://albn-backend.vercel.app/api';

const AdminCreate = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    campus: '', 
    cnic: ''
  });
  const [campuses, setCampuses] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchCampuses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/campus/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCampuses(res.data);
    } catch (err) {
      setError('Failed to load campuses');
    }
  };

  useEffect(() => { fetchCampuses(); }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/admin/register`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create admin');
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-200">
      {error && <p className="text-red-600 text-center mb-4 font-medium">{error}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <input 
          type="text" 
          name="name" 
          placeholder="Full Name" 
          onChange={handleChange} 
          required 
          className="w-full p-4 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-600 shadow-sm transition"
        />
        
        <input 
          type="email" 
          name="email" 
          placeholder="Email Address" 
          onChange={handleChange} 
          required 
          className="w-full p-4 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-600 shadow-sm transition"
        />
        
        <input 
          type="password" 
          name="password" 
          placeholder="Password" 
          onChange={handleChange} 
          required 
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
          placeholder="CNIC (Optional)" 
          onChange={handleChange} 
          className="w-full p-4 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-600 shadow-sm transition"
        />

        <button 
          type="submit" 
          className="w-full py-4 text-xl font-semibold text-white rounded-xl bg-gradient-to-r from-blue-500 to-pink-600 hover:from-indigo-600 hover:to-blue-500 shadow-lg transition-transform transform hover:scale-105"
        >
          Create Admin
        </button>
      </form>
    </div>
  );
};

export default AdminCreate;
