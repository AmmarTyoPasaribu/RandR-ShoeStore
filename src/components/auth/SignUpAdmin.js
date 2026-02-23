import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { API_URL } from "../../config/api";

function SignUpAdmin() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    firstName: "",
    lastName: "",
    role: "Admin",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/users/register`, formData);
      await Swal.fire({ title: 'Success!', text: response.data.message, icon: 'success', background: '#292524', color: '#fff', confirmButtonColor: '#d97706' });
      if (response.status === 200) navigate("/signin");
    } catch (error) {
      Swal.fire({ title: 'Error', text: error.response?.data?.message || "An error occurred.", icon: 'error', background: '#292524', color: '#fff' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 px-4" style={{fontFamily: 'Outfit, sans-serif'}}>
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <img src="/logo.png" alt="Roots & Routes" className="h-16 mx-auto mb-3" />
          <span className="bg-amber-600/20 text-amber-400 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">Admin Registration</span>
        </div>

        <div className="bg-stone-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-stone-700">
          <h2 className="text-2xl font-bold mb-6 text-white text-center">Create Admin Account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" name="username" placeholder="Username" required onChange={handleChange}
              className="w-full bg-stone-700/50 border border-stone-600 text-white placeholder-stone-500 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all" />
            <input type="password" name="password" placeholder="Password" required onChange={handleChange}
              className="w-full bg-stone-700/50 border border-stone-600 text-white placeholder-stone-500 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all" />
            <input type="email" name="email" placeholder="Email" required onChange={handleChange}
              className="w-full bg-stone-700/50 border border-stone-600 text-white placeholder-stone-500 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all" />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" name="firstName" placeholder="First Name" onChange={handleChange}
                className="w-full bg-stone-700/50 border border-stone-600 text-white placeholder-stone-500 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all" />
              <input type="text" name="lastName" placeholder="Last Name" onChange={handleChange}
                className="w-full bg-stone-700/50 border border-stone-600 text-white placeholder-stone-500 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all" />
            </div>
            <button type="submit" disabled={loading}
              className={`w-full bg-gradient-to-r from-amber-600 to-yellow-700 hover:from-amber-700 hover:to-yellow-800 text-white font-bold py-3 rounded-xl shadow-lg transition-all duration-300 ${loading ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02]"}`}>
              {loading ? "Creating..." : "Sign Up"}
            </button>
          </form>

          <p className="mt-5 text-center text-stone-400 text-sm">
            Already have an account?{" "}
            <Link to="/signin-admin" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUpAdmin;
