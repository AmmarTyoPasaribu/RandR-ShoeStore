import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { API_URL } from '../../config/api';

function SignUp() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    firstName: '',
    lastName: ''
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/users/register`, formData);
      await Swal.fire({
        title: 'Success!',
        text: response.data.message || 'Account created successfully!',
        icon: 'success',
        confirmButtonText: 'Continue to Login',
        background: '#292524',
        color: '#fff',
        confirmButtonColor: '#d97706',
      });
      if (response.status === 200) {
        navigate('/signin');
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        title: 'Registration Failed',
        text: error.response?.data?.message || 'An error occurred. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
        background: '#292524',
        color: '#fff',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 px-4" style={{fontFamily: 'Outfit, sans-serif'}}>
      <div className="w-full max-w-4xl">
        <div className="bg-stone-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-stone-700 overflow-hidden flex flex-col md:flex-row">
          {/* Left - Image */}
          <div className="md:w-1/2 relative bg-gradient-to-br from-amber-900/30 to-stone-900 flex items-center justify-center p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 to-transparent"></div>
            <div className="relative text-center">
              <img src="/logo.png" alt="Roots & Routes" className="h-24 mx-auto mb-6" />
              <img src="/images/adidas_trail_run.png" alt="Shoes" className="w-full h-auto rounded-xl shadow-lg" />
            </div>
          </div>

          {/* Right - Form */}
          <div className="md:w-1/2 p-8">
            <h2 className="text-2xl font-bold mb-2 text-white">Create Account</h2>
            <p className="text-stone-400 mb-6 text-sm">Join the Roots & Routes community</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="username"
                placeholder="Username"
                required
                onChange={handleChange}
                className="w-full bg-stone-700/50 border border-stone-600 text-white placeholder-stone-500 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                onChange={handleChange}
                className="w-full bg-stone-700/50 border border-stone-600 text-white placeholder-stone-500 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                onChange={handleChange}
                className="w-full bg-stone-700/50 border border-stone-600 text-white placeholder-stone-500 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  onChange={handleChange}
                  className="w-full bg-stone-700/50 border border-stone-600 text-white placeholder-stone-500 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  onChange={handleChange}
                  className="w-full bg-stone-700/50 border border-stone-600 text-white placeholder-stone-500 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-gradient-to-r from-amber-600 to-yellow-700 hover:from-amber-700 hover:to-yellow-800 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all duration-300 ${
                  loading ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02] hover:shadow-xl"
                }`}
              >
                {loading ? "Creating Account..." : "Sign Up"}
              </button>
            </form>

            <p className="mt-5 text-center text-stone-400 text-sm">
              Already have an account?{' '}
              <Link to="/signin" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
                Log In
              </Link>
            </p>
            <p className="mt-2 text-center text-xs text-stone-500">
              By signing up, I agree to Roots & Routes's{' '}
              <Link to="/" className="text-amber-400/70 hover:text-amber-400 transition-colors">Terms & Conditions</Link>
              {' '}and{' '}
              <Link to="/" className="text-amber-400/70 hover:text-amber-400 transition-colors">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
