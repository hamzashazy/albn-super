import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://albn-backend.vercel.app/api';

const StudentCreate = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    campus: '',
    program: '',
    group: '',
  });

  const [campuses, setCampuses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch campuses
  const fetchCampuses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/campus/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCampuses(res.data);
    } catch {
      setError('Failed to load campuses');
    }
  };

  // Fetch programs
  const fetchPrograms = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/program/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPrograms(res.data);
    } catch {
      setError('Failed to load programs');
    }
  };

  // Fetch groups
  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/group/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroups(res.data);
    } catch {
      setError('Failed to load groups');
    }
  };

  useEffect(() => {
    fetchCampuses();
    fetchPrograms();
    fetchGroups();
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
      navigate('/student');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create student');
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow rounded">
      <h2 className="text-xl font-semibold mb-4">Create New Student</h2>
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

        {/* Program Dropdown */}
        <select name="program" value={formData.program} onChange={handleChange} required className="w-full p-2 border rounded">
          <option value="">Select Program</option>
          {programs.map(program => (
            <option key={program._id} value={program._id}>{program.title}</option>
          ))}
        </select>

        {/* Group Dropdown */}
        <select name="group" value={formData.group} onChange={handleChange} required className="w-full p-2 border rounded">
          <option value="">Select Class/Group</option>
          {groups.map(group => (
            <option key={group._id} value={group._id}>{group.name}</option>
          ))}
        </select>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Create
        </button>
      </form>
    </div>
  );
};

export default StudentCreate;
