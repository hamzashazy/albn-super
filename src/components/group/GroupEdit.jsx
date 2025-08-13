import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://albn-backend.vercel.app/api/group';

const GroupEdit = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    murabbi: '',
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setFormData(res.data); // Directly set the fetched data
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load group');
      });
  }, [id, token]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE_URL}/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/group');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update group');
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow rounded">
      <h2 className="text-xl font-semibold mb-4">Edit Group</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="murabbi"
          value={formData.murabbi}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Update
        </button>
      </form>
    </div>
  );
};

export default GroupEdit;
