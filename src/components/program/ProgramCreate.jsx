// components/program/ProgramCreate.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://albn-backend.vercel.app/api/program';

const ProgramCreate = () => {
  const [formData, setFormData] = useState({
    title: '',
    details: '',
    startDate: '',
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token'); // Token from login

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      navigate('/program');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create program');
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow rounded">
      <h2 className="text-xl font-semibold mb-4">Create New Program</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="title" placeholder="Title" onChange={handleChange} required className="w-full p-2 border rounded" />
        <textarea name="details" placeholder="Details" onChange={handleChange} required className="w-full p-2 border rounded" />
        <input type="date" name="startDate" onChange={handleChange} required className="w-full p-2 border rounded" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Create</button>
      </form>
    </div>
  );
};

export default ProgramCreate;
