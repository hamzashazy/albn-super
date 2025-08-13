import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://albn-backend.vercel.app/api';

const AdminCreate = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    campus: '', // store campus ID
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

  useEffect(() => {
    fetchCampuses();
  }, []);

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
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create admin');
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow rounded">
      <h2 className="text-xl font-semibold mb-4">Create New Admin</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="name" placeholder="Name" onChange={handleChange} required className="w-full p-2 border rounded" />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required className="w-full p-2 border rounded" />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required className="w-full p-2 border rounded" />
        
        {/* Campus Dropdown */}
        <select name="campus" value={formData.campus} onChange={handleChange} required className="w-full p-2 border rounded">
          <option value="">Select Campus</option>
          {campuses.map(campus => (
            <option key={campus._id} value={campus._id}>{campus.name}</option>
          ))}
        </select>

        <input type="number" name="cnic" placeholder="CNIC" onChange={handleChange} className="w-full p-2 border rounded" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Create</button>
      </form>
    </div>
  );
};

export default AdminCreate;
