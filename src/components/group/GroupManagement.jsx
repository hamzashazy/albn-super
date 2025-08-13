// components/group/GroupManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://albn-backend.vercel.app/api/group';

const GroupManagement = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

const fetchGroups = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem('token');

    const response = await axios.get(`${API_BASE_URL}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setGroups(response.data);
  } catch (err) {
    setError('Failed to fetch groups');
    console.error(err.response?.data || err.message);
  } finally {
    setLoading(false);
  }
};

  // Soft delete group
  const handleDeleteGroup = async (id) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setGroups(prev =>
          prev.map(group =>
            group._id === id ? { ...group, isDeleted: true } : group
          )
        );
      } catch (err) {
        setError('Failed to delete group');
        console.error(err.response?.data || err.message);
      }
    }
  };

  // Restore group
  const handleRestoreGroup = async (id) => {
    if (window.confirm('Are you sure you want to restore this group?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`${API_BASE_URL}/restore/${id}`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setGroups(prev =>
          prev.map(group =>
            group._id === id ? { ...group, isDeleted: false } : group
          )
        );
      } catch (err) {
        setError('Failed to restore group');
        console.error(err.response?.data || err.message);
      }
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Group Management</h1>
        <Link
          to="/group/create"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Create New Group
        </Link>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full bg-white rounded shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">Group Name</th>
              <th className="px-4 py-2">Murabbi</th>
            </tr>
          </thead>
          <tbody>
            {groups.map(group => (
              <tr key={group._id} className="text-center border-t">
                <td className="px-4 py-2">{group.name}</td>
                <td className="px-4 py-2">{group.murabbi}</td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => navigate(`/group/edit/${group._id}`)}
                    className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
                  >
                    Edit
                  </button>

                  {group.isDeleted ? (
                    <button
                      onClick={() => handleRestoreGroup(group._id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Enable
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDeleteGroup(group._id)}
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

export default GroupManagement;
