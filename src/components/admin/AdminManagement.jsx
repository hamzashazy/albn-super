// components/admin/AdminManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://albn-backend.vercel.app/api';


const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();


  // Fetch admins
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdmins(res.data); // Make sure API returns isDeleted field
    } catch (err) {
      setError('Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  };

  // Soft delete admin
  const handleDeleteAdmin = async (id) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/admin/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAdmins(prev =>
          prev.map(admin =>
            admin._id === id ? { ...admin, isDeleted: true } : admin
          )
        );
      } catch (err) {
        setError('Failed to delete admin');
        console.error(err.response?.data || err.message);
      }
    }
  };

  // Restore admin
  const handleRestoreAdmin = async (id) => {
    if (window.confirm('Are you sure you want to restore this admin?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`${API_BASE_URL}/admin/restore/${id}`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAdmins(prev =>
          prev.map(admin =>
            admin._id === id ? { ...admin, isDeleted: false } : admin
          )
        );
      } catch (err) {
        setError('Failed to restore admin');
        console.error(err.response?.data || err.message);
      }
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Admin Management</h1>
        <Link
          to="/admin/create"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create New Admin
        </Link>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full bg-white rounded shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Campus</th>
              <th className="px-4 py-2">Cnic</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map(admin => (
              <tr key={admin._id} className="text-center border-t">
                <td className="px-4 py-2">{admin.name}</td>
                <td className="px-4 py-2">{admin.email}</td>
                <td className="px-4 py-2">{admin.campus?.name || '-'}</td>
                <td className="px-4 py-2">{admin.cnic || '-'}</td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => navigate(`/admin/edit/${admin._id}`)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-yellow-500"
                  >
                    Edit
                  </button>

                  {admin.isDeleted ? (
                    <button
                      onClick={() => handleRestoreAdmin(admin._id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Enable
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDeleteAdmin(admin._id)}
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

export default AdminManagement;
