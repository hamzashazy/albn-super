import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://albn-backend.vercel.app/api/campus';

const CampusCreate = () => {
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    zimedaar: '',
    founding_date: ''
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      await axios.post(`${API_BASE_URL}/`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/campus');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create campus');
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow rounded">
      <h2 className="text-xl font-semibold mb-4">Create New Campus</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="name" placeholder="Campus Name" onChange={handleChange} required className="w-full p-2 border rounded" />
        <input type="text" name="city" placeholder="City" onChange={handleChange} required className="w-full p-2 border rounded" />
        <input type="text" name="zimedaar" placeholder="Zimedaar (Person In Charge)" onChange={handleChange} required className="w-full p-2 border rounded" />
        <input type="date" name="founding_date" onChange={handleChange} required className="w-full p-2 border rounded" />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Create</button>
      </form>
    </div>
  );
};

export default CampusCreate;
