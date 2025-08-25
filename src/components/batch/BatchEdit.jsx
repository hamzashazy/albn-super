import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "https://albn-backend.vercel.app/api";

const BatchEdit = ({ batchId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    startingDate: '',
    endingDate: '',
    campus: '', 
    program: '', 
  });

  const [campuses, setCampuses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!batchId){
    setLoading(false);
    return;
  }

    const loadData = async () => {
      try {
        const [batchRes, campusesRes, programsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/batch/${batchId}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/campus/active`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/program/active`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setFormData({
          name: batchRes.data.name,
          city: batchRes.data.city,
          startingDate: batchRes.data.startingDate ? batchRes.data.startingDate.split("T")[0] : "",
          endingDate: batchRes.data.endingDate ? batchRes.data.endingDate.split("T")[0] : "",
          campus: batchRes.data.campus?._id || "",
          program: batchRes.data.program?._id || "",
        });

        setCampuses(campusesRes.data);
        setPrograms(programsRes.data);
      } catch {
        setError("Failed to load batch or campuses data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [batchId, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = { ...formData };
      if (!updateData.startingDate) delete updateData.startingDate;
      if (!updateData.endingDate) delete updateData.endingDate;

      await axios.put(`${API_BASE_URL}/batch/${batchId}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (onSuccess) onSuccess(); // close modal & refresh data in parent
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update batch");
    }
  };

  if (loading) return <p className="text-center py-10 text-gray-500">Loading...</p>;

  return (
    <div className="p-8 max-w-xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-200">
      {error && <p className="text-red-600 text-center mb-4 font-medium">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <input 
            type="text" 
            name="name" 
            placeholder="Batch Name" 
            value={formData.name}
            onChange={handleChange} 
            required 
            disabled={loading}
            className="w-full p-3 sm:p-4 text-base sm:text-lg rounded-lg sm:rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-600 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        
        <div>
          <textarea 
            name="city" 
            placeholder="City" 
            value={formData.city}
            onChange={handleChange} 
            required 
            disabled={loading}
            className="w-full p-3 sm:p-4 text-base sm:text-lg rounded-lg sm:rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-600 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        
        <div>
          <input 
            type="date" 
            name="startingDate" 
            placeholder="Starting Date" 
            value={formData.startingDate}
            onChange={handleChange} 
            required 
            disabled={loading}
            className="w-full p-3 sm:p-4 text-base sm:text-lg rounded-lg sm:rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-600 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        
        <div>
          <input 
            type="date" 
            name="endingDate" 
            placeholder="Ending Date" 
            value={formData.endingDate}
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
       
        <div>
          <select 
            name="program" 
            value={formData.program} 
            onChange={handleChange} 
            required 
            disabled={loading}
            className="w-full p-3 sm:p-4 text-base sm:text-lg rounded-lg sm:rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-600 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Select Program</option>
            {programs.map(program => (
              <option key={program._id} value={program._id}>{program.title}</option>
            ))}
          </select>
        </div>


        <button 
          type="submit" 
          className="w-full py-4 text-xl font-semibold text-white rounded-xl bg-gradient-to-r from-blue-500 to-pink-600 hover:from-pink-500 hover:to-blue-500 shadow-lg transition-transform transform hover:scale-105"
        >
          Update Batch
        </button>
      </form>
    </div>
  );
};

export default BatchEdit;
