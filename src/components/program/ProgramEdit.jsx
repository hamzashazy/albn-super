// components/program/ProgramEdit.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://albn-backend.vercel.app/api/program';

const ProgramEdit = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({ title: '', details: '', startDate: '' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token'); // Token from login

  useEffect(() => {
    axios.get(`${API_BASE_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        const { title, details, startDate } = res.data;
        setFormData({ title, details, startDate: startDate.split('T')[0] });
      })
      .catch(() => setError('Failed to load program'));
  }, [id, token]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE_URL}/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      navigate('/program');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update program');
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow rounded">
      <h2 className="text-xl font-semibold mb-4">Edit Program</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full p-2 border rounded" />
        <textarea name="details" value={formData.details} onChange={handleChange} required className="w-full p-2 border rounded" />
        <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required className="w-full p-2 border rounded" />
        <button type="submit" className="bg-yellow-500 text-white px-4 py-2 rounded">Update</button>
      </form>
    </div>
  );
};

export default ProgramEdit;
