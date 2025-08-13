import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://albn-backend.vercel.app/api/program';

const ProgramManagement = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token'); // Get auth token

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPrograms(response.data);
    } catch (err) {
      setError('Failed to fetch programs');
    } finally {
      setLoading(false);
    }
  };

  // Soft delete program
  const handleDeleteProgram = async (id) => {
    if (window.confirm('Are you sure you want to delete this program?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPrograms(prev =>
          prev.map(program =>
            program._id === id ? { ...program, isDeleted: true } : program
          )
        );
      } catch (err) {
        setError('Failed to delete program');
        console.error(err.response?.data || err.message);
      }
    }
  };

  // Restore program
  const handleRestoreProgram = async (id) => {
    if (window.confirm('Are you sure you want to restore this program?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`${API_BASE_URL}/restore/${id}`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPrograms(prev =>
          prev.map(program =>
            program._id === id ? { ...program, isDeleted: false } : program
          )
        );
      } catch (err) {
        setError('Failed to restore program');
        console.error(err.response?.data || err.message);
      }
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Program Management</h1>
        <Link to="/program/create" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Create New Program
        </Link>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full bg-white rounded shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Details</th>
              <th className="px-4 py-2">Start Date</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {programs.map(program => (
              <tr key={program._id} className="text-center border-t">
                <td className="px-4 py-2">{program.title}</td>
                <td className="px-4 py-2">{program.details}</td>
                <td className="px-4 py-2">{new Date(program.startDate).toLocaleDateString()}</td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => navigate(`/program/edit/${program._id}`)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-yellow-500"
                  >
                    Edit
                  </button>

                  {program.isDeleted ? (
                    <button
                      onClick={() => handleRestoreProgram(program._id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Enable
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDeleteProgram(program._id)}
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

export default ProgramManagement;
