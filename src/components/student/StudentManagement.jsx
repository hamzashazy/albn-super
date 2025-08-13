// components/student/StudentManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://albn-backend.vercel.app/api';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch students
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/student`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(res.data);
    } catch (err) {
      setError('Failed to fetch students');
      console.error(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Soft delete student
  const handleDeleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to disable this student?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/student/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudents(prev =>
          prev.map(s =>
            s._id === id ? { ...s, isDeleted: true } : s
          )
        );
      } catch (err) {
        setError('Failed to disable student');
        console.error(err.response?.data || err.message);
      }
    }
  };

  // Restore student
  const handleRestoreStudent = async (id) => {
    if (window.confirm('Are you sure you want to enable this student?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`${API_BASE_URL}/student/restore/${id}`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudents(prev =>
          prev.map(s =>
            s._id === id ? { ...s, isDeleted: false } : s
          )
        );
      } catch (err) {
        setError('Failed to enable student');
        console.error(err.response?.data || err.message);
      }
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Student Management</h1>
        <Link
          to="/student/create"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create New Student
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
              <th className="px-4 py-2">Program</th>
              <th className="px-4 py-2">Class</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student._id} className="text-center border-t">
                <td className="px-4 py-2">{student.name}</td>
                <td className="px-4 py-2">{student.email}</td>
                <td className="px-4 py-2">{student.campus?.name || '-'}</td>
                <td className="px-4 py-2">{student.program?.title || '-'}</td>
                <td className="px-4 py-2">{student.group?.name || '-'}</td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => navigate(`/student/edit/${student._id}`)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-yellow-500"
                  >
                    Edit
                  </button>

                  {student.isDeleted ? (
                    <button
                      onClick={() => handleRestoreStudent(student._id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Enable
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDeleteStudent(student._id)}
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

export default StudentManagement;
