import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import API_URL from '../../config/api';

const ProfilePage = ({ userId, accessToken, username, role }) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    address: "",
    phone: "",
    role: "",
    created_at: "",
  });
  const [userStats, setUserStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    cartItems: 0,
    wishlistItems: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (userId && accessToken) {
        try {
          const response = await axios.get(
            `${API_URL}/users/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          const userData = response.data;
          setFormData({
            username: userData.username || username || "",
            email: userData.email || "",
            first_name: userData.first_name || "",
            last_name: userData.last_name || "",
            address: userData.address || "",
            phone: userData.phone || "",
            role: userData.role || role || "",
            created_at: userData.date_added || userData.created_at || "",
          });

          await fetchUserStats();
          setLoading(false);
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setLoading(false);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to load profile data.",
            background: '#1c1917',
            color: '#fff',
            confirmButtonColor: '#f59e0b',
          });
        }
      } else {
        const storedUserData = JSON.parse(sessionStorage.getItem("userData") || "{}");
        if (storedUserData.userId) {
          setFormData({
            username: storedUserData.username || "",
            email: storedUserData.email || "",
            first_name: "",
            last_name: "",
            address: "",
            phone: "",
            role: storedUserData.role || "",
            created_at: "",
          });
        }
        setLoading(false);
      }
    };

    const fetchUserStats = async () => {
      try {
        const ordersResponse = await axios.get(
          `${API_URL}/orders/user/${userId}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const orders = ordersResponse.data || [];
        const totalSpent = orders.reduce((sum, order) => sum + (order.amount || 0), 0);

        let cartCount = 0;
        try {
          const cartResponse = await axios.get(`${API_URL}/cart/${userId}`, { headers: { Authorization: `Bearer ${accessToken}` } });
          cartCount = Array.isArray(cartResponse.data) ? cartResponse.data.length : 0;
        } catch (cartError) {
          if (cartError.response?.status !== 404) console.error("Error fetching cart:", cartError);
        }

        let wishlistCount = 0;
        try {
          const wishlistResponse = await axios.get(`${API_URL}/wishlist/${userId}`, { headers: { Authorization: `Bearer ${accessToken}` } });
          wishlistCount = Array.isArray(wishlistResponse.data) ? wishlistResponse.data.length : 0;
        } catch (wishlistError) {
          if (wishlistError.response?.status !== 404) console.error("Error fetching wishlist:", wishlistError);
        }

        setUserStats({ totalOrders: orders.length, totalSpent, cartItems: cartCount, wishlistItems: wishlistCount });
      } catch (error) {
        console.error("Error fetching user stats:", error);
        setUserStats({ totalOrders: 0, totalSpent: 0, cartItems: 0, wishlistItems: 0 });
      }
    };

    fetchUserProfile();
  }, [userId, accessToken, username, role]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${API_URL}/users/profile/${userId}`,
        formData,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      Swal.fire({
        icon: "success",
        title: "Profile Updated",
        text: "Your profile has been updated successfully.",
        background: '#1c1917',
        color: '#fff',
        confirmButtonColor: '#10b981',
      });
      console.log("Profile updated:", response.data);
      setEditMode(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "There was an error updating your profile. Please try again.",
        background: '#1c1917',
        color: '#fff',
        confirmButtonColor: '#ef4444',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center" style={{fontFamily:'Outfit,sans-serif'}}>
        <div className="text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-stone-700"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500 animate-spin"></div>
          </div>
          <p className="text-lg text-stone-400 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Orders", value: userStats.totalOrders, icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z", color: "amber" },
    { label: "Spent", value: userStats.totalSpent.toLocaleString("id-ID", { style: "currency", currency: "IDR" }), icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "emerald" },
    { label: "Cart", value: userStats.cartItems, icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z", color: "amber" },
    { label: "Wishlist", value: userStats.wishlistItems, icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z", color: "red" },
  ];

  const colorMap = {
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
    red: { bg: 'bg-red-500/10', text: 'text-red-400' },
  };

  return (
    <div className="min-h-screen bg-stone-950" style={{fontFamily:'Outfit,sans-serif'}}>
      {/* Header */}
      <div className="border-b border-stone-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-amber-400">{(formData.username || "U")[0].toUpperCase()}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{formData.username || "User"}</h1>
              <p className="text-sm text-stone-500 capitalize">{formData.role || "Member"} • Joined {formData.created_at ? new Date(formData.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : "—"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-stone-900 rounded-2xl p-4 border border-stone-800">
              <div className={`w-8 h-8 rounded-xl ${colorMap[stat.color].bg} flex items-center justify-center mb-3`}>
                <svg className={`w-4 h-4 ${colorMap[stat.color].text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                </svg>
              </div>
              <p className="text-xs text-stone-500 uppercase tracking-wider mb-0.5">{stat.label}</p>
              <p className={`text-lg font-bold text-white ${stat.label === "Spent" ? "text-sm" : ""}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Profile Card */}
        <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden">
          {editMode ? (
            /* Edit Mode */
            <form onSubmit={handleUpdateProfile} className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Edit Profile</h2>
                <button type="button" onClick={() => setEditMode(false)} className="text-sm text-stone-500 hover:text-white transition-colors">Cancel</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-stone-400 mb-1.5 uppercase tracking-wider">Username</label>
                  <input type="text" name="username" value={formData.username || ""} onChange={handleChange}
                    className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm" placeholder="Enter your username" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-stone-400 mb-1.5 uppercase tracking-wider">Email</label>
                  <input type="email" name="email" value={formData.email || ""} onChange={handleChange}
                    className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm" placeholder="Enter your email" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-400 mb-1.5 uppercase tracking-wider">First Name</label>
                  <input type="text" name="first_name" value={formData.first_name || ""} onChange={handleChange}
                    className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm" placeholder="First name" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-400 mb-1.5 uppercase tracking-wider">Last Name</label>
                  <input type="text" name="last_name" value={formData.last_name || ""} onChange={handleChange}
                    className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm" placeholder="Last name" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-stone-400 mb-1.5 uppercase tracking-wider">Address</label>
                  <textarea name="address" value={formData.address || ""} onChange={handleChange} rows="2"
                    className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all resize-none text-sm" placeholder="Enter your address" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-stone-400 mb-1.5 uppercase tracking-wider">Phone</label>
                  <input type="tel" name="phone" value={formData.phone || ""} onChange={handleChange}
                    className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm" placeholder="Enter your phone number" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl transition-all text-sm">Save Changes</button>
                <button type="button" onClick={() => setEditMode(false)} className="flex-1 py-3 bg-stone-800 hover:bg-stone-700 text-white font-medium rounded-xl transition-all text-sm">Cancel</button>
              </div>
            </form>
          ) : (
            /* View Mode */
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Personal Information</h2>
                <button onClick={() => setEditMode(true)} className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-amber-400 text-sm font-medium rounded-xl transition-all flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Edit
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Username", value: formData.username },
                  { label: "Email", value: formData.email },
                  { label: "First Name", value: formData.first_name },
                  { label: "Last Name", value: formData.last_name },
                  { label: "Address", value: formData.address || "Not provided", full: true },
                  { label: "Phone", value: formData.phone || "Not provided", full: true },
                ].map((field, i) => (
                  <div key={i} className={`bg-stone-800/50 rounded-xl p-4 ${field.full ? 'md:col-span-2' : ''}`}>
                    <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest mb-1">{field.label}</p>
                    <p className="text-sm font-medium text-white">{field.value || "—"}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Privacy Note */}
        <div className="mt-4 bg-stone-900/50 border border-stone-800 rounded-2xl p-4 flex items-start gap-3">
          <svg className="w-4 h-4 text-stone-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p className="text-xs text-stone-500">Your data is encrypted and secure. We never share your information with third parties.</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;