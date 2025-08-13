import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://albn-backend.vercel.app/api';

const AdminEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    campus: '',
    cnic: ''
  });

  const [campuses, setCampuses] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  // Fetch admin data
  const fetchAdmin = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData({
        name: res.data.name,
        email: res.data.email,
        password: '', // Leave blank unless updating
        campus: res.data.campus || '',
        cnic: res.data.cnic || ''
      });
    } catch (err) {
      setError('Failed to load admin data');
    }
  };

  // Fetch campuses
  const fetchCampuses = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/campus`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCampuses(res.data);
    } catch (err) {
      setError('Failed to load campuses');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchAdmin();
      await fetchCampuses();
      setLoading(false);
    };
    loadData();
  }, [id]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password; // Prevent overwriting password with blank
      }

      await axios.put(`${API_BASE_URL}/admin/${id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update admin');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow rounded">
      <h2 className="text-xl font-semibold mb-4">Edit Admin</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          value={formData.name}
          placeholder="Name"
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          placeholder="Email"
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          placeholder="New Password (leave blank to keep current)"
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <select
          name="campus"
          value={formData.campus}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        >
          <option value="">Select Campus</option>
          {campuses.map(campus => (
            <option key={campus._id} value={campus._id}>
              {campus.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          name="cnic"
          value={formData.cnic}
          placeholder="CNIC"
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Update
        </button>
      </form>
    </div>
  );
};

export default AdminEdit;
