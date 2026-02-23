import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Link,
  useNavigate,
  Navigate,
} from "react-router-dom";
import Swal from "sweetalert2";

import Recomended from "./components/client/Recomended";
import SignIn from "./components/auth/SignIn";
import SignUp from "./components/auth/SignUp";
import Cart from "./components/client/Cart";
import Product from "./components/client/Product";
import AdminSepatu from "./components/admin/AdminSepatu";
import AdminUser from "./components/admin/AdminUser";
import AdminPayments from "./components/admin/AdminPayments";
import AdminWishlists from "./components/admin/AdminWishlists";
import AdminOrders from "./components/admin/AdminOrders";
import AdminInteractions from "./components/admin/AdminInteractions";
import AdminRecommendations from "./components/admin/AdminRecommendations";
import OrderPage from "./components/client/OrderPage";
import ProfilePage from "./components/client/ProfilePage";

// Home Component
const Home = ({ userData }) => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFeaturedProducts([
        { id: 1, name: "Nike Air Jordan 1 Low Red Bred Toe", price: 1750000, image: "/images/Nike Air Jordan 1 Low Red Bred Toe.jpg", category: "Casual", discount: 20 },
        { id: 2, name: "Asics Magic Speed 4 Digital Aqua Original", price: 2800000, image: "/images/Asics Magic Speed 4 Digital Aqua Original.jpg", category: "Sport", discount: 0 },
        { id: 3, name: "Glossy Black Slingback Italian Sole", price: 920000, image: "/images/Glossy Black Slingback Italian Sole.jpg", category: "Heels", discount: 15 },
        { id: 4, name: "Nokha Boots Harlow Black", price: 890000, image: "/images/Nokha Boots Harlow Black.jpg", category: "Boots", discount: 0 }
      ]);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="min-h-screen bg-stone-950" style={{ fontFamily: 'Outfit, sans-serif' }}>

      {/* ── HERO ── centered, logo-focused */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* ambient blobs */}
        <div className="absolute top-[-10%] left-[-8%] w-[500px] h-[500px] rounded-full bg-amber-700/10 blur-[120px]" />
        <div className="absolute bottom-[-12%] right-[-6%] w-[400px] h-[400px] rounded-full bg-yellow-600/10 blur-[100px]" />

        <div className="relative z-10 flex flex-col items-center gap-6 max-w-3xl">
          {/* logo */}
          <img
            src="/logo.png"
            alt="R&R"
            className="h-28 sm:h-36 w-auto drop-shadow-2xl"
            style={{ filter: 'drop-shadow(0 8px 32px rgba(245,158,11,0.35))' }}
          />

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-white">
            Langkah Dimulai <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">
              Dari Sini
            </span>
          </h1>

          <p className="text-stone-400 text-base sm:text-lg leading-relaxed max-w-xl">
            Temukan koleksi sepatu pilihan — dari kasual yang nyaman hingga formal yang elegan.
            Setiap pasang dirancang untuk menemani setiap perjalananmu.
          </p>

          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {userData.isLoggedIn ? (
              <>
                <button onClick={() => navigate('/products')}
                  className="px-7 py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl transition-all hover:scale-105 text-sm sm:text-base">
                  Jelajahi Koleksi
                </button>
                <button onClick={() => navigate('/recomended')}
                  className="px-7 py-3.5 bg-stone-800 hover:bg-stone-700 text-white font-semibold rounded-xl border border-stone-700 transition-all hover:scale-105 text-sm sm:text-base">
                  Rekomendasi Untukmu
                </button>
              </>
            ) : (
              <>
                <button onClick={() => navigate('/signin')}
                  className="px-7 py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl transition-all hover:scale-105 text-sm sm:text-base">
                  Mulai Belanja
                </button>
                <button onClick={() => navigate('/products')}
                  className="px-7 py-3.5 bg-white/5 backdrop-blur border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition-all hover:scale-105 text-sm sm:text-base">
                  Lihat Katalog
                </button>
              </>
            )}
          </div>
        </div>

        {/* scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-stone-600 animate-bounce">
          <span className="text-[10px] uppercase tracking-widest">Scroll</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </div>
      </section>

      {/* ── BRAND VALUES ── horizontal strip */}
      <section className="border-y border-stone-800/60">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-stone-800/60">
          {[
            { icon: "M5 13l4 4L19 7", label: "100% Original", sub: "Garansi keaslian" },
            { icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4", label: "Gratis Ongkir", sub: "Ke seluruh Indonesia" },
            { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", label: "Pembayaran Aman", sub: "Terenkripsi & terpercaya" },
            { icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", label: "Mudah Ditukar", sub: "Pengembalian 7 hari" },
          ].map((v, i) => (
            <div key={i} className="flex flex-col items-center justify-center py-8 px-4 gap-2 group">
              <svg className="w-6 h-6 text-amber-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d={v.icon} />
              </svg>
              <span className="text-sm font-bold text-white">{v.label}</span>
              <span className="text-[11px] text-stone-500">{v.sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── ABOUT STRIP ── */}
      <section className="px-4 sm:px-8 lg:px-16 py-20">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Logo card */}
          <div className="relative mx-auto w-full max-w-sm aspect-square flex items-center justify-center">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-500/10 to-yellow-600/5 border border-stone-800" />
            <img src="/logo.png" alt="R&R" className="relative z-10 h-40 w-auto opacity-90" />
          </div>

          <div className="space-y-5">
            <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
              Kenapa Memilih <span className="text-amber-400">R&R</span>?
            </h2>
            <p className="text-stone-400 leading-relaxed">
              Roots & Routes hadir untuk kamu yang menghargai kualitas tanpa kompromi. 
              Kami mengkurasi koleksi terbaik dari berbagai brand ternama — memastikan 
              setiap pasang sepatu bukan hanya terlihat keren, tapi juga nyaman dipakai 
              sepanjang hari.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-2">
              {[
                { num: "500+", text: "Produk" },
                { num: "10K+", text: "Pelanggan" },
                { num: "4.9★", text: "Rating" },
              ].map((s, i) => (
                <div key={i} className="text-center bg-stone-900 rounded-xl border border-stone-800 py-4">
                  <p className="text-xl font-bold text-amber-400">{s.num}</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="px-4 sm:px-8 lg:px-16 py-16 bg-stone-900/40">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-amber-500 text-xs font-bold uppercase tracking-widest mb-1">Pilihan Terbaik</p>
              <h2 className="text-3xl font-bold text-white">Koleksi Unggulan</h2>
            </div>
            <button onClick={() => navigate('/products')}
              className="hidden sm:flex items-center gap-1.5 text-sm text-stone-400 hover:text-amber-400 transition-colors font-medium">
              Lihat semua
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-stone-900 rounded-2xl p-3 animate-pulse">
                  <div className="bg-stone-800 aspect-square rounded-xl mb-3" />
                  <div className="h-3 bg-stone-800 rounded mb-2 w-3/4" />
                  <div className="h-3 bg-stone-800 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredProducts.map((p) => (
                <div key={p.id}
                  onClick={() => navigate('/products')}
                  className="group bg-stone-900 rounded-2xl overflow-hidden border border-stone-800 hover:border-amber-500/40 transition-all cursor-pointer hover:-translate-y-1 duration-300">
                  <div className="relative aspect-square bg-stone-800 overflow-hidden">
                    <img src={p.image} alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23292524'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2357534e' font-size='18'%3ENo Image%3C/text%3E%3C/svg%3E"; }} />
                    {p.discount > 0 && (
                      <span className="absolute top-2.5 left-2.5 text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-md">-{p.discount}%</span>
                    )}
                  </div>
                  <div className="p-3.5">
                    <span className="text-[10px] font-semibold text-amber-500 uppercase tracking-wider">{p.category}</span>
                    <h3 className="text-sm font-bold text-white mt-1 leading-snug line-clamp-2 group-hover:text-amber-400 transition-colors">{p.name}</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                      {p.discount > 0 ? (
                        <>
                          <span className="text-sm font-bold text-emerald-400">{formatPrice(p.price * (1 - p.discount / 100))}</span>
                          <span className="text-xs text-stone-600 line-through">{formatPrice(p.price)}</span>
                        </>
                      ) : (
                        <span className="text-sm font-bold text-emerald-400">{formatPrice(p.price)}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-8 sm:hidden">
            <button onClick={() => navigate('/products')}
              className="text-sm text-amber-400 font-semibold underline underline-offset-4">Lihat semua produk →</button>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-4 sm:px-8 lg:px-16 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden border border-stone-800">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 via-stone-900 to-yellow-700/10" />
            <div className="relative z-10 flex flex-col items-center text-center px-6 py-14 sm:py-20 gap-5">
              <img src="/logo.png" alt="R&R" className="h-14 w-auto opacity-70" />
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Siap Temukan Gaya Barumu?
              </h2>
              <p className="text-stone-400 text-sm sm:text-base max-w-md">
                Bergabung dengan ribuan pelanggan yang sudah mempercayakan kebutuhan sepatu mereka pada R&R.
              </p>
              <button
                onClick={() => userData.isLoggedIn ? navigate('/products') : navigate('/signup')}
                className="mt-2 px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl transition-all hover:scale-105 text-sm sm:text-base">
                {userData.isLoggedIn ? 'Belanja Sekarang' : 'Daftar Gratis'}
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

function AppContent() {
  // State untuk menyimpan data user
  const [userData, setUserData] = useState({
    username: "",
    role: "",
    accessToken: "",
    userId: "",
    isLoggedIn: false,
  });
  
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Optional: Load dari sessionStorage saat pertama kali
  // sessionStorage akan hilang saat browser ditutup
  useEffect(() => {
    const savedData = sessionStorage.getItem("userData");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setUserData(parsed);
      } catch (error) {
        console.error("Error parsing saved user data:", error);
      }
    }
  }, []);

  // Optional: Save ke sessionStorage setiap kali userData berubah
  useEffect(() => {
    if (userData.isLoggedIn) {
      sessionStorage.setItem("userData", JSON.stringify(userData));
    } else {
      sessionStorage.removeItem("userData");
    }
  }, [userData]);

  // Handler untuk login - menerima 4 parameter terpisah
  const handleLogin = (username, role, accessToken, userId) => {
    console.log('App.js handleLogin received:', { username, role, accessToken, userId });

    // Validasi: pastikan bukan object yang dikirim
    if (typeof username === 'object' || typeof role === 'object') {
      console.error('ERROR: handleLogin received object instead of separate parameters!');
      console.error('Received:', { username, role, accessToken, userId });
      // Jika accidentally kirim object, ekstrak datanya
      if (username && typeof username === 'object') {
        const data = username;
        const newUserData = {
          username: String(data.username || ''),
          role: String(data.role || ''),
          accessToken: String(data.access_token || data.accessToken || ''),
          userId: String(data.user_id || data.userId || ''),
          isLoggedIn: true,
        };
        console.log('Setting userData (object case):', newUserData);
        setUserData(newUserData);
        return;
      }
    }

    // Normal case: 4 parameter terpisah
    const newUserData = {
      username: String(username || ''),
      role: String(role || ''),
      accessToken: String(accessToken || ''),
      userId: String(userId || ''),
      isLoggedIn: true,
    };
    console.log('Setting userData (normal case):', newUserData);
    setUserData(newUserData);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to log out?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, log out!",
      cancelButtonText: "No, stay logged in",
      background: '#1f2937',
      color: '#fff',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
    }).then((result) => {
      if (result.isConfirmed) {
        // Reset state
        setUserData({
          username: "",
          role: "",
          accessToken: "",
          userId: "",
          isLoggedIn: false,
        });
        sessionStorage.removeItem("userData");
        navigate("/");
        setMobileMenuOpen(false);
        setIsOpen(false);
      }
    });
  };

  // PrivateRoute Component - menggunakan state
  const PrivateRoute = ({ children }) => {
    if (!userData.isLoggedIn) {
      return <Navigate to="/signin" />;
    }
    return children;
  };

  // AdminRoute Component - menggunakan state
  const AdminRoute = ({ children }) => {
    if (!userData.isLoggedIn) {
      return <Navigate to="/signin" />;
    }
    if (userData.role === "User") {
      return <Navigate to="/" />;
    }
    return children;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950" style={{fontFamily: 'Outfit, sans-serif'}}>
      {/* Header */}
      <header className="bg-gradient-to-r from-stone-900 to-stone-950 text-white shadow-2xl sticky top-0 z-50 border-b border-stone-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Roots & Routes" className="h-10 sm:h-12 w-auto" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-2">
              <Link
                to={userData.isLoggedIn ? "/" : "/signin"}
                className="text-base text-gray-300 hover:text-amber-400 hover:bg-gray-700 transition-all duration-200 font-medium px-3 py-2 rounded-lg"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Home
                </span>
              </Link>

              {userData.role === "User" && (
                <>
                  <Link
                    to={userData.isLoggedIn ? "/recomended" : "/signin"}
                    className="text-base text-gray-300 hover:text-amber-400 hover:bg-gray-700 transition-all duration-200 font-medium px-3 py-2 rounded-lg"
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      Recommended
                    </span>
                  </Link>
                  <Link
                    to={userData.isLoggedIn ? "/products" : "/signin"}
                    className="text-base text-gray-300 hover:text-amber-400 hover:bg-gray-700 transition-all duration-200 font-medium px-3 py-2 rounded-lg"
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Products
                    </span>
                  </Link>
                  <Link
                    to={userData.isLoggedIn ? "/orders" : "/signin"}
                    className="text-base text-gray-300 hover:text-amber-400 hover:bg-gray-700 transition-all duration-200 font-medium px-3 py-2 rounded-lg"
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Orders
                    </span>
                  </Link>
                  <Link
                    to="/cart"
                    className="text-base text-gray-300 hover:text-amber-400 transition-colors duration-200 font-medium flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Cart
                  </Link>
                </>
              )}

              {userData.role === "Admin" && (
                <>
                  <Link
                    to="/admin/categories"
                    className="text-base text-gray-300 hover:text-amber-400 transition-colors duration-200 font-medium"
                  >
                    Categories
                  </Link>
                  <Link
                    to="/admin/users"
                    className="text-base text-gray-300 hover:text-amber-400 transition-colors duration-200 font-medium"
                  >
                    Users
                  </Link>
                  <Link
                    to="/admin/payments"
                    className="text-base text-gray-300 hover:text-amber-400 transition-colors duration-200 font-medium"
                  >
                    Payments
                  </Link>
                  <Link
                    to="/admin/wishlists"
                    className="text-base text-gray-300 hover:text-amber-400 transition-colors duration-200 font-medium"
                  >
                    Wishlists
                  </Link>
                  <Link
                    to="/admin/orders"
                    className="text-base text-gray-300 hover:text-amber-400 transition-colors duration-200 font-medium"
                  >
                    Orders
                  </Link>
                  <Link
                    to="/admin/interactions"
                    className="text-base text-gray-300 hover:text-amber-400 transition-colors duration-200 font-medium"
                  >
                    Interactions
                  </Link>
                  <Link
                    to="/admin/recommendations"
                    className="text-base text-gray-300 hover:text-amber-400 transition-colors duration-200 font-medium"
                  >
                    Recs
                  </Link>
                </>
              )}
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              {userData.isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={toggleMenu}
                    className="flex items-center space-x-2 bg-gray-700/50 hover:bg-gray-700 px-4 py-2 rounded-lg transition-all duration-200 border border-gray-600"
                  >
                    <span className="text-sm font-medium text-gray-200">
                      Welcome, {userData.username || 'User'}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : "rotate-0"
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {isOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl overflow-hidden z-10 border border-gray-700">
                      <button
                        className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-amber-400 transition-colors duration-150"
                        onClick={() => {
                          navigate("/profile");
                          setIsOpen(false);
                        }}
                      >
                        Profile
                      </button>
                      <button
                        className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-900/20 transition-colors duration-150"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link to="/signin">
                    <button className="bg-amber-600 text-white px-5 py-2 rounded-lg hover:bg-amber-700 transition-all duration-200 font-medium shadow-lg">
                      Sign in
                    </button>
                  </Link>
                  <Link to="/signup">
                    <button className="bg-stone-700 text-white px-5 py-2 rounded-lg hover:bg-stone-600 transition-all duration-200 font-medium shadow-lg border border-stone-500">
                      Sign Up
                    </button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden pb-4 border-t border-gray-700 mt-2">
              <nav className="flex flex-col space-y-1 mt-4">
                <Link
                  to={userData.isLoggedIn ? "/" : "/signin"}
                  className="px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-amber-400 rounded-lg transition-all duration-200 flex items-center gap-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="font-medium">Home</span>
                </Link>

                {userData.role === "User" && (
                  <>
                    <Link
                      to={userData.isLoggedIn ? "/recomended" : "/signin"}
                      className="px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-amber-400 rounded-lg transition-all duration-200 flex items-center gap-3"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span className="font-medium">Recommended</span>
                    </Link>
                    <Link
                      to={userData.isLoggedIn ? "/products" : "/signin"}
                      className="px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-amber-400 rounded-lg transition-all duration-200 flex items-center gap-3"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <span className="font-medium">Products</span>
                    </Link>
                    <Link
                      to={userData.isLoggedIn ? "/orders" : "/signin"}
                      className="px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-amber-400 rounded-lg transition-all duration-200 flex items-center gap-3"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span className="font-medium">Orders</span>
                    </Link>
                    <Link
                      to="/cart"
                      className="px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-amber-400 rounded-lg transition-all duration-200 flex items-center gap-3"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="font-medium">Cart</span>
                    </Link>
                  </>
                )}

                {userData.role === "Admin" && (
                  <>
                    <Link
                      to="/admin/categories"
                      className="px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-amber-400 rounded-lg transition-all duration-200 flex items-center gap-3"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span className="font-medium">Categories</span>
                    </Link>
                    <Link
                      to="/admin/users"
                      className="px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-amber-400 rounded-lg transition-all duration-200 flex items-center gap-3"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span className="font-medium">Users</span>
                    </Link>
                    <Link
                      to="/admin/payments"
                      className="px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-amber-400 rounded-lg transition-all duration-200 flex items-center gap-3"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm-6 0V7a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2z" />
                      </svg>
                      <span className="font-medium">Payments</span>
                    </Link>
                    <Link
                      to="/admin/wishlists"
                      className="px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-amber-400 rounded-lg transition-all duration-200 flex items-center gap-3"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span className="font-medium">Wishlists</span>
                    </Link>
                    <Link
                      to="/admin/orders"
                      className="px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-amber-400 rounded-lg transition-all duration-200 flex items-center gap-3"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span className="font-medium">Orders</span>
                    </Link>
                    <Link
                      to="/admin/interactions"
                      className="px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-amber-400 rounded-lg transition-all duration-200 flex items-center gap-3"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="font-medium">Interactions</span>
                    </Link>
                    <Link
                      to="/admin/recommendations"
                      className="px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-amber-400 rounded-lg transition-all duration-200 flex items-center gap-3"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span className="font-medium">Recommendations</span>
                    </Link>
                  </>
                )}
              </nav>

              {/* Mobile Auth Buttons */}
              <div className="mt-4 space-y-2">
                {userData.isLoggedIn ? (
                  <>
                    <button
                      className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-amber-400 rounded-lg transition-colors duration-200"
                      onClick={() => {
                        navigate("/profile");
                        setMobileMenuOpen(false);
                      }}
                    >
                      Profile - {userData.username || 'User'}
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/signin" className="block">
                      <button
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign in
                      </button>
                    </Link>
                    <Link to="/signup" className="block">
                      <button
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign Up
                      </button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto">
        <Routes>
          <Route path="/" element={<Home userData={userData} />} />
          <Route 
            path="/signin" 
            element={
              userData.isLoggedIn ? (
                <Navigate to="/" replace />
              ) : (
                <SignIn onLogin={handleLogin} />
              )
            } 
          />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/recomended"
            element={
              <PrivateRoute>
                <Recomended 
                  userId={userData.userId}
                  accessToken={userData.accessToken}
                />
              </PrivateRoute>
            }
          />
          <Route
            path="/products"
            element={
              <PrivateRoute>
                <Product 
                  userId={userData.userId}
                  accessToken={userData.accessToken}
                />
              </PrivateRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <PrivateRoute>
                <OrderPage
                  userId={userData.userId}
                  accessToken={userData.accessToken}
                />
              </PrivateRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <PrivateRoute>
                <Cart
                  userId={userData.userId}
                  accessToken={userData.accessToken}
                />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage
                  userId={userData.userId}
                  username={userData.username}
                  accessToken={userData.accessToken}
                  role={userData.role}
                />
              </PrivateRoute>
            }
          />
          
          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <Navigate to="/admin/categories" replace />
              </AdminRoute>
            } 
          />
          <Route
            path="/admin/categories"
            element={
              <AdminRoute>
                <AdminSepatu accessToken={userData.accessToken} />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUser accessToken={userData.accessToken} />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <AdminRoute>
                <AdminPayments accessToken={userData.accessToken} />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/wishlists"
            element={
              <AdminRoute>
                <AdminWishlists accessToken={userData.accessToken} />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminRoute>
                <AdminOrders accessToken={userData.accessToken} />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/interactions"
            element={
              <AdminRoute>
                <AdminInteractions accessToken={userData.accessToken} />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/recommendations"
            element={
              <AdminRoute>
                <AdminRecommendations accessToken={userData.accessToken} />
              </AdminRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

// Export AppContent sebagai App
export default AppContent;