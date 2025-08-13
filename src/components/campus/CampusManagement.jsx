// components/campus/CampusManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://albn-backend.vercel.app/api/campus';

const CampusManagement = () => {
  const [campuses, setCampuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

const fetchCampuses = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem('token');

    const response = await axios.get(`${API_BASE_URL}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setCampuses(response.data);
  } catch (err) {
    setError('Failed to fetch campuses');
    console.error(err.response?.data || err.message);
  } finally {
    setLoading(false);
  }
};

  // Soft delete campus
  const handleDeleteCampus = async (id) => {
    if (window.confirm('Are you sure you want to delete this campus?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCampuses(prev =>
          prev.map(campus =>
            campus._id === id ? { ...campus, isDeleted: true } : campus
          )
        );
      } catch (err) {
        setError('Failed to delete campus');
        console.error(err.response?.data || err.message);
      }
    }
  };

  // Restore campus
  const handleRestoreCampus = async (id) => {
    if (window.confirm('Are you sure you want to restore this campus?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`${API_BASE_URL}/restore/${id}`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCampuses(prev =>
          prev.map(campus =>
            campus._id === id ? { ...campus, isDeleted: false } : campus
          )
        );
      } catch (err) {
        setError('Failed to restore campus');
        console.error(err.response?.data || err.message);
      }
    }
  };

  useEffect(() => {
    fetchCampuses();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Campus Management</h1>
        <Link
          to="/campus/create"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Create New Campus
        </Link>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full bg-white rounded shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">Campus Name</th>
              <th className="px-4 py-2">City</th>
              <th className="px-4 py-2">Zimedaar</th>
              <th className="px-4 py-2">Founding Date</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {campuses.map(campus => (
              <tr key={campus._id} className="text-center border-t">
                <td className="px-4 py-2">{campus.name}</td>
                <td className="px-4 py-2">{campus.city}</td>
                <td className="px-4 py-2">{campus.zimedaar}</td>
                <td className="px-4 py-2">
                  {new Date(campus.founding_date).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => navigate(`/campus/edit/${campus._id}`)}
                    className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
                  >
                    Edit
                  </button>

                  {campus.isDeleted ? (
                    <button
                      onClick={() => handleRestoreCampus(campus._id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Enable
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDeleteCampus(campus._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Disable
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CampusManagement;
