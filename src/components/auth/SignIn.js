import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { API_URL } from "../../config/api";

function SignIn({ onLogin }) {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/users/login`,
        credentials
      );

      await Swal.fire({
        title: "Success!",
        text: "Login successful!",
        icon: "success",
        confirmButtonText: "OK",
      });

      const { username, role, access_token, user_id } = response.data;

      // Pass data sebagai 4 parameter terpisah, BUKAN sebagai object
      if (onLogin) {
        onLogin(username, role, access_token, user_id);
      }

      // Navigasi berdasarkan role
      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      Swal.fire({
        title: "Login Failed",
        text:
          error.response?.data?.message ||
          "An error occurred. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950" style={{fontFamily: 'Outfit, sans-serif'}}>
      <div className="w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Roots & Routes" className="h-20 mx-auto mb-4" />
        </div>

        <div className="bg-stone-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-stone-700 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white text-center">
              Welcome Back!
            </h1>
            <p className="text-stone-400 text-center mt-2">
              Sign in to your account
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="flex flex-col">
              <label
                htmlFor="username"
                className="mb-2 font-medium text-stone-300 text-sm"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Enter your username"
                value={credentials.username}
                onChange={handleChange}
                required
                className="bg-stone-700/50 border border-stone-600 p-3 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex flex-col relative">
              <label
                htmlFor="password"
                className="mb-2 font-medium text-stone-300 text-sm"
              >
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={handleChange}
                required
                className="bg-stone-700/50 border border-stone-600 p-3 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all pr-12"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-4 top-[38px] text-stone-400 hover:text-amber-400 focus:outline-none transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Link
                to="/forgot-password"
                className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
              >
                Need Help?
              </Link>
              <button
                type="submit"
                className={`bg-gradient-to-r from-amber-600 to-yellow-700 hover:from-amber-700 hover:to-yellow-800 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all duration-300 ${
                  loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105 hover:shadow-xl"
                }`}
                disabled={loading}
              >
                {loading ? "Logging in..." : "Log In"}
              </button>
            </div>
          </form>

          <p className="text-center text-stone-400 text-sm">
            Don't have an account?{" "}
            <Link to="/signup" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignIn;