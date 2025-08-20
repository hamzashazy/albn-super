import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'https://albn-backend.vercel.app/api';

const GroupCreate = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    murabbi: '',
    campus: '', 
  });
  const [campuses, setCampuses] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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
    // Clear error when user starts typing
    if (error) setError(null);
  };

const handleSubmit = async e => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  // ✅ Validation step (new)
  if (!formData.campus) {
    setError("Campus is required");
    setLoading(false);
    return;
  }

  try {
    const token = localStorage.getItem("token");
    await axios.post(`${API_BASE_URL}/group/`, formData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (onSuccess) onSuccess();
  } catch (err) {
    setError(err.response?.data?.message || "Failed to create group");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 text-red-600 text-sm sm:text-base rounded-lg">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        <div>
          <input 
            type="text" 
            name="name" 
            placeholder="Group Name" 
            value={formData.name}
            onChange={handleChange} 
            required 
            disabled={loading}
            className="w-full p-3 sm:p-4 text-base sm:text-lg rounded-lg sm:rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-600 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        
        <div>
          <textarea 
            name="murabbi" 
            placeholder="Details" 
            value={formData.murabbi}
            onChange={handleChange} 
            required 
            disabled={loading}
            className="w-full p-3 sm:p-4 text-base sm:text-lg rounded-lg sm:rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-600 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
       
        <div>
          <select 
            name="campus" 
            value={formData.campus} 
            onChange={handleChange} 
            required 
            disabled={loading}
            className="w-full p-3 sm:p-4 text-base sm:text-lg rounded-lg sm:rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-600 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Select Campus</option>
            {campuses.map(campus => (
              <option key={campus._id} value={campus._id}>{campus.name}</option>
            ))}
          </select>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-3 sm:py-4 text-lg sm:text-xl font-semibold text-white rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-500 to-pink-600 hover:from-indigo-600 hover:to-blue-500 shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? 'Creating Group...' : 'Create Group'}
        </button>
      </form>
    </div>
  );
};

export default GroupCreate;