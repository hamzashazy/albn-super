import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://albn-backend.vercel.app/api';

const StudentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  // Fetch student data
  const fetchStudent = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/student/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData({
        name: res.data.name,
        email: res.data.email,
        password: '', // Leave blank unless updating
        campus: res.data.campus?._id || res.data.campus || '',
        program: res.data.program?._id || res.data.program || '',
        group: res.data.group?._id || res.data.group || '',
      });
    } catch (err) {
      setError('Failed to load student data');
    }
  };

  // Fetch campuses
  const fetchCampuses = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/campus/active`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCampuses(res.data);
    } catch (err) {
      setError('Failed to load campuses');
    }
  };

  // Fetch programs
  const fetchPrograms = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/program/active`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPrograms(res.data);
    } catch (err) {
      setError('Failed to load programs');
    }
  };

  // Fetch groups
  const fetchGroups = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/group/active`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroups(res.data);
    } catch (err) {
      setError('Failed to load groups');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchStudent(),
        fetchCampuses(),
        fetchPrograms(),
        fetchGroups()
      ]);
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

      await axios.put(`${API_BASE_URL}/student/${id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/student');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update student');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow rounded">
      <h2 className="text-xl font-semibold mb-4">Edit Student</h2>
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

        {/* Campus Dropdown */}
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

        {/* Program Dropdown */}
        <select
          name="program"
          value={formData.program}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        >
          <option value="">Select Program</option>
          {programs.map(program => (
            <option key={program._id} value={program._id}>
              {program.title}
            </option>
          ))}
        </select>

        {/* Group Dropdown */}
        <select
          name="group"
          value={formData.group}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        >
          <option value="">Select Group</option>
          {groups.map(group => (
            <option key={group._id} value={group._id}>
              {group.name}
            </option>
          ))}
        </select>

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

export default StudentEdit;
