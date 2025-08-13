import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

const Superlogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch('https://albn-backend.vercel.app/api/superadmin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("isLogged", "true");
        setMessage("Login successful!");
        setTimeout(() => {
          navigate("/superpanel");
        }, 1000);
      } else {
        setMessage(data.message || "Login failed");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
      console.error('Login error:', error);
    }
  };

  return (
    <main className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-purple-100">
      <div className="bg-white/90 backdrop-blur-md p-10 rounded-2xl shadow-2xl w-full max-w-md flex flex-col items-center">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full p-3 mb-3 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5s-3 1.343-3 3 1.343 3 3 3zm0 2c-2.67 0-8 1.337-8 4v2a1 1 0 001 1h14a1 1 0 001-1v-2c0-2.663-5.33-4-8-4z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-800 mb-1 tracking-tight">Super Admin Panel</h2>
          <p className="text-gray-500 text-base">Sign in to manage your admin</p>
        </div>

        {message && (
          <div
            className={`mb-4 w-full text-center text-sm font-medium px-4 py-2 rounded ${
              message.includes("successful")
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-red-100 text-red-700 border border-red-300"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 w-full">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              placeholder="Enter your email"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-lg font-semibold shadow-lg hover:from-blue-700 hover:to-purple-700 transition"
          >
            Login
          </button>
        </form>
      </div>
    </main>
  );
};

export default Superlogin;