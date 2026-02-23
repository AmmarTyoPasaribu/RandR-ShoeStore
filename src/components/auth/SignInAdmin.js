import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { API_URL } from "../../config/api";

function SignInAdmin({ onLogin }) {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/users/login`,
        credentials
      );
      if (response.status === 200) {
        if (response.data.role === "Admin") {
          onLogin(response.data.username);
          navigate("/admin");
        } else {
          Swal.fire({ title: "Access Denied", text: "You do not have admin access.", icon: "error", background: '#292524', color: '#fff' });
        }
      }
    } catch (error) {
      Swal.fire({ title: "Login Failed", text: error.response?.data?.message || "An error occurred.", icon: "error", background: '#292524', color: '#fff' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950" style={{fontFamily: 'Outfit, sans-serif'}}>
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Roots & Routes" className="h-16 mx-auto mb-3" />
          <span className="bg-amber-600/20 text-amber-400 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">Admin Panel</span>
        </div>

        <div className="bg-stone-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-stone-700 space-y-6">
          <h2 className="text-2xl font-bold text-white text-center">Admin Sign In</h2>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="flex flex-col">
              <label htmlFor="username" className="mb-2 font-medium text-stone-300 text-sm">Username</label>
              <input type="text" id="username" name="username" placeholder="Admin username" onChange={handleChange}
                className="bg-stone-700/50 border border-stone-600 p-3 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all" />
            </div>
            <div className="flex flex-col">
              <label htmlFor="password" className="mb-2 font-medium text-stone-300 text-sm">Password</label>
              <input type="password" id="password" name="password" placeholder="Admin password" onChange={handleChange}
                className="bg-stone-700/50 border border-stone-600 p-3 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all" />
            </div>
            <button type="submit" disabled={loading}
              className={`w-full bg-gradient-to-r from-amber-600 to-yellow-700 hover:from-amber-700 hover:to-yellow-800 text-white font-bold py-3 rounded-xl shadow-lg transition-all duration-300 ${loading ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02]"}`}>
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <p className="text-center text-stone-400 text-sm">
            Need an admin account?{" "}
            <Link to="/signup-admin" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignInAdmin;
