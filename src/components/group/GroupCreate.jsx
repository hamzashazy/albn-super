import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://albn-backend.vercel.app/api/group';

const GroupCreate = () => {
  const [formData, setFormData] = useState({ name: '', murabbi: '' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/group');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group');
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-200">
      {error && <p className="text-red-600 text-center mb-4 font-medium">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <input type="text" name="name" placeholder="Group Name" onChange={handleChange} required className="w-full p-4 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm transition" />
        <input type="text" name="murabbi" placeholder="Murabbi (Person in Charge)" onChange={handleChange} required className="w-full p-4 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm transition" />
        
        <button type="submit" className="w-full py-4 text-xl font-semibold text-white rounded-xl bg-gradient-to-r from-blue-500 to-pink-600 hover:from-indigo-600 hover:to-blue-500 shadow-lg transition-transform transform hover:scale-105">
          Create Group
        </button>
      </form>
    </div>
  );
};

export default GroupCreate;
