import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Superlogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // New state

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true); // Disable button

    try {
      const response = await fetch(
        "https://albn-backend.vercel.app/api/superadmin/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("isLogged", "true");
        setMessage("Login successful!");
        setTimeout(() => navigate("/Superpanel"), 1000);
      } else {
        setMessage(data.message || "Login failed");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
      console.error("Login error:", error);
    } finally {
      setLoading(false); // Re-enable button after request
    }
  };

  return (
    <main className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-200 via-pink-100 to-blue-100 px-4 overflow-hidden relative">
      {/* Floating background circles */}
      <div className="absolute top-[-10%] left-[-5%] w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-purple-400 to-pink-400 opacity-30 animate-spin-slow blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-400 opacity-30 animate-spin-slow blur-3xl"></div>

      {/* Login card */}
      <div className="relative bg-white/90 backdrop-blur-md p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-lg flex flex-col items-center z-10 animate-fadeIn">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full p-4 mb-3 shadow-xl">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5s-3 1.343-3 3 1.343 3 3 3zm0 2c-2.67 0-8 1.337-8 4v2a1 1 0 001 1h14a1 1 0 001-1v-2c0-2.663-5.33-4-8-4z"
              />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-1 text-center">
            Super Admin Panel
          </h1>
          <p className="text-gray-500 text-base sm:text-lg text-center">
            Sign in to manage your administrators
          </p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-4 w-full text-center text-base sm:text-lg font-medium px-4 py-2 rounded-lg border transition duration-300 ${
              message.includes("successful")
                ? "bg-green-100 text-green-700 border-green-300"
                : "bg-red-100 text-red-700 border-red-300"
            }`}
          >
            {message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4 sm:space-y-5">
          <div>
            <label className="block text-base sm:text-lg font-semibold text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              autoFocus
              className="w-full text-base sm:text-lg px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 shadow-sm transition"
            />
          </div>

          <div>
            <label className="block text-base sm:text-lg font-semibold text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full text-base sm:text-lg px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 shadow-sm transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading} // Disable when loading
            className={`w-full text-white py-3 sm:py-3.5 rounded-xl font-bold text-lg sm:text-xl shadow-lg transform transition duration-300 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105"
            }`}
          >
            {loading ? "Please wait..." : "Login"} {/* Update text */}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-gray-400 text-sm sm:text-base text-center">
          © 2025 Albn Super Admin Panel
        </p>
      </div>
    </main>
  );
};

export default Superlogin;
