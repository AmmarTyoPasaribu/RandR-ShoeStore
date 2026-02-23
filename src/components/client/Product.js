import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from 'sweetalert2';
import API_URL from '../../config/api';

function Product({ userId, accessToken }) {
  const [shoes, setShoes] = useState([]);
  const [filteredShoes, setFilteredShoes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedShoe, setSelectedShoe] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [favoriteShoes, setFavoriteShoes] = useState(new Set());
  const [wishlistMap, setWishlistMap] = useState({}); // maps shoe_detail_id -> id_wishlist
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 12;

  const navigate = useNavigate();

  useEffect(() => {
    if (!accessToken) {
      console.warn("Token JWT tidak ditemukan. Redirect ke login.");
      navigate("/signin");
      return;
    }

    const fetchWishlist = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/wishlist/${parseInt(userId)}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (Array.isArray(response.data)) {
          const wlMap = {};
          response.data.forEach(item => {
            wlMap[item.shoe_detail_id] = item.id_wishlist;
          });
          setWishlistMap(wlMap);
          setFavoriteShoes(new Set(response.data.map(item => item.shoe_detail_id)));
        }
      } catch (error) {
        // 404 = no wishlist items, that's fine
        if (error.response?.status !== 404) {
          console.error('Error fetching wishlist:', error);
        }
      }
    };

    fetchShoes();
    fetchWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, navigate]);

  useEffect(() => {
    filterShoes();
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, shoes, searchQuery]);

  const fetchShoes = async () => {
    setLoading(true);
    
    // Debug: Cek token sebelum request
    console.log("Fetching shoes with token:", accessToken ? "Token exists" : "No token");
    console.log("Token length:", accessToken?.length);
    console.log("Token preview:", accessToken?.substring(0, 20) + "...");
    
    try {
      const response = await axios.get(`${API_URL}/shoes`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log("Shoes fetched successfully:", response.data.length, "items");
      const shuffledShoes = shuffleArray([...response.data]);
      setShoes(shuffledShoes);
    } catch (error) {
      console.error("Error fetching shoes:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      if (error.response && (error.response.status === 401 || error.response.status === 422)) {
        Swal.fire({
          icon: 'error',
          title: 'Session Expired',
          text: 'Your session has expired. Please login again.',
          showConfirmButton: true,
          confirmButtonColor: '#3B82F6',
        }).then(() => {
          navigate("/signin");
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load products. Please try again.',
          showConfirmButton: true,
          confirmButtonColor: '#EF4444',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const shuffleArray = (array) => {
    const copy = [...array];
    return copy.sort(() => Math.random() - 0.5);
  };

  const getCategoryName = (categoryId) => {
    const categories = {
      1: "Boots",
      2: "Casual",
      3: "Formal",
      4: "Heels",
      5: "Sport",
    };
    return categories[categoryId] || "Unknown";
  };

  const filterShoes = () => {
    let result = shoes;
    
    if (selectedCategory !== "All") {
      const categoryMap = {
        Boots: 1,
        Casual: 2,
        Formal: 3,
        Heels: 4,
        Sport: 5,
      };
      const categoryId = categoryMap[selectedCategory];
      result = result.filter((shoe) => shoe.category_id === categoryId);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((shoe) => 
        shoe.shoe_name.toLowerCase().includes(query)
      );
    }
    
    setFilteredShoes(result);
  };

  const indexOfLastShoe = currentPage * itemsPerPage;
  const indexOfFirstShoe = indexOfLastShoe - itemsPerPage;
  const currentShoes = filteredShoes.slice(indexOfFirstShoe, indexOfLastShoe);
  const totalPages = Math.ceil(filteredShoes.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleShoeClick = async (shoeId) => {
    try {
      const response = await axios.get(
        `${API_URL}/shoes/${shoeId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setSelectedShoe(response.data);
      setSelectedQuantity(1);
      setShowModal(true);
      document.body.style.overflow = "hidden";

      // Record 'view' interaction
      try {
        await axios.post(
          `${API_URL}/user_interactions`,
          {
            id_user: parseInt(userId),
            shoe_detail_id: shoeId,
            interaction_type: 'view'
          },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
      } catch (err) {
        // Non-critical, don't show error to user
        console.error('Error recording view interaction:', err);
      }
    } catch (error) {
      console.error("Error fetching shoe details:", error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Details',
        text: 'Failed to load product details. Please try again.',
        showConfirmButton: true,
        confirmButtonColor: '#EF4444',
      });
    }
  };

  // Reset scroll when component unmounts (e.g. navigating away with modal open)
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const closeModal = () => {
    setShowModal(false);
    setSelectedShoe(null);
    setSelectedQuantity(1);
    document.body.style.overflow = "unset";
  };

  const toggleFavorite = async (shoeId) => {
    const isFavorited = favoriteShoes.has(shoeId);

    if (isFavorited) {
      // Remove from wishlist
      const wishlistId = wishlistMap[shoeId];
      if (wishlistId) {
        try {
          await axios.delete(
            `${API_URL}/wishlist/${wishlistId}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          setFavoriteShoes(prev => {
            const newSet = new Set(prev);
            newSet.delete(shoeId);
            return newSet;
          });
          setWishlistMap(prev => {
            const newMap = { ...prev };
            delete newMap[shoeId];
            return newMap;
          });
        } catch (error) {
          console.error('Error removing from wishlist:', error);
          Swal.fire('Error', 'Failed to remove from wishlist', 'error');
        }
      }
    } else {
      // Add to wishlist
      try {
        await axios.post(
          `${API_URL}/wishlist`,
          {
            id_user: parseInt(userId),
            shoe_detail_id: shoeId
          },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setFavoriteShoes(prev => {
          const newSet = new Set(prev);
          newSet.add(shoeId);
          return newSet;
        });
        // Refetch to get the id_wishlist
        try {
          const wlResponse = await axios.get(
            `${API_URL}/wishlist/${parseInt(userId)}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          if (Array.isArray(wlResponse.data)) {
            const newMap = {};
            wlResponse.data.forEach(item => {
              newMap[item.shoe_detail_id] = item.id_wishlist;
            });
            setWishlistMap(newMap);
          }
        } catch (e) { /* ignore */ }
      } catch (error) {
        console.error('Error adding to wishlist:', error);
        Swal.fire('Error', 'Failed to add to wishlist', 'error');
      }
    }
  };

  const addToCart = async (shoeId, quantity) => {
    if (!userId || !accessToken) {
      Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please login to add items to cart',
        showConfirmButton: true,
        confirmButtonColor: '#3B82F6',
        timer: 3000,
        timerProgressBar: true,
      }).then(() => {
        navigate("/signin");
      });
      return;
    }

    try {
      Swal.fire({
        title: 'Adding to Cart...',
        html: 'Please wait while we add your item',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await axios.post(
        `${API_URL}/cart`,
        {
          shoe_detail_id: shoeId,
          id_user: parseInt(userId),
          quantity: quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: response.data.message || "Item successfully added to cart!",
        showConfirmButton: true,
        confirmButtonColor: '#10B981',
        timer: 2000,
        timerProgressBar: true,
        showClass: {
          popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp'
        }
      });

      if (showModal) closeModal();
    } catch (error) {
      console.error("Error adding to cart:", error);

      if (error.response && (error.response.status === 401 || error.response.status === 422)) {
        Swal.fire({
          icon: 'error',
          title: 'Session Expired',
          text: 'Your session has expired. Please login again.',
          showConfirmButton: true,
          confirmButtonColor: '#3B82F6',
        }).then(() => {
          navigate("/signin");
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed to Add Item',
          text: error.response?.data?.message || "Failed to add item to cart. Please try again.",
          showConfirmButton: true,
          confirmButtonColor: '#EF4444',
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center" style={{fontFamily: 'Outfit, sans-serif'}}>
        <div className="text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-stone-700"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500 animate-spin"></div>
          </div>
          <p className="text-lg text-stone-400 font-medium tracking-wide">Discovering products...</p>
        </div>
      </div>
    );
  }

  const categories = ["All", "Sport", "Casual", "Boots", "Heels", "Formal"];

  return (
    <div className="min-h-screen bg-stone-950" style={{fontFamily: 'Outfit, sans-serif'}}>
      {/* Sticky Filter Bar */}
      <div className="sticky top-0 z-40 bg-stone-950/90 backdrop-blur-xl border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Top Row: Title + Search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Collection</h1>
              <p className="text-sm text-stone-500">{filteredShoes.length} products found</p>
            </div>
            <div className="relative w-full sm:w-80">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search shoes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-stone-700 rounded-full text-white text-sm placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === cat
                    ? "bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/25"
                    : "bg-stone-800/80 text-stone-400 hover:bg-stone-700 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentShoes.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {currentShoes.map((shoe) => (
              <div
                key={shoe.shoe_detail_id}
                className="group relative bg-stone-900 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:ring-2 hover:ring-amber-500/50 hover:shadow-xl hover:shadow-amber-500/5"
                onClick={() => handleShoeClick(shoe.shoe_detail_id)}
              >
                {/* Image */}
                <div className="relative aspect-square bg-stone-800 overflow-hidden">
                  <img
                    src={`/images/${shoe.shoe_name}.jpg`}
                    alt={shoe.shoe_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%231c1917'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2557534e' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  
                  {/* Top badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-start">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      shoe.stock > 10 ? 'bg-emerald-500/90 text-white' : shoe.stock > 0 ? 'bg-amber-500/90 text-stone-950' : 'bg-red-500/90 text-white'
                    }`}>
                      {shoe.stock > 0 ? `${shoe.stock} left` : 'Sold out'}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(shoe.shoe_detail_id); }}
                      className="w-8 h-8 rounded-full bg-stone-950/60 backdrop-blur-sm flex items-center justify-center hover:bg-stone-950/90 transition-all"
                    >
                      <svg className={`w-4 h-4 ${favoriteShoes.has(shoe.shoe_detail_id) ? "text-red-500 fill-current" : "text-white"}`}
                        fill={favoriteShoes.has(shoe.shoe_detail_id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>

                  {/* Hover overlay with quick-add */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); addToCart(shoe.shoe_detail_id, 1); }}
                      disabled={shoe.stock === 0}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {shoe.stock === 0 ? 'Sold Out' : '+ Add to Cart'}
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 sm:p-4 space-y-1.5">
                  <p className="text-[10px] font-semibold text-amber-500 uppercase tracking-widest">
                    {getCategoryName(shoe.category_id)}
                  </p>
                  <h3 className="text-sm font-semibold text-white leading-tight line-clamp-2 min-h-[2.5rem]">
                    {shoe.shoe_name}
                  </h3>
                  <div className="flex items-baseline justify-between pt-1">
                    <p className="text-base font-bold text-amber-400">
                      {shoe.shoe_price.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
                    </p>
                    <span className="text-[10px] text-stone-500 font-medium">EU {shoe.shoe_size}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-stone-900 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-stone-400 mb-1">No products found</h3>
            <p className="text-sm text-stone-600">Try a different category or search term</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-10">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-stone-800 text-white hover:bg-stone-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            {Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1;
              if (pageNumber === 1 || pageNumber === totalPages || (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)) {
                return (
                  <button key={index} onClick={() => handlePageChange(pageNumber)}
                    className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                      currentPage === pageNumber
                        ? "bg-amber-500 text-stone-950 shadow-lg"
                        : "bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-white"
                    }`}
                  >{pageNumber}</button>
                );
              } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                return <span key={index} className="w-6 text-center text-stone-600">â€¢</span>;
              }
              return null;
            })}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-stone-800 text-white hover:bg-stone-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {showModal && selectedShoe && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div
            className="bg-stone-900 rounded-3xl max-w-4xl w-full shadow-2xl border border-stone-800 overflow-hidden animate-fadeIn max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Left â€” Image */}
              <div className="relative bg-stone-800 p-6 lg:p-10 flex items-center justify-center min-h-[300px]">
                <button onClick={closeModal} className="absolute top-4 right-4 lg:hidden w-10 h-10 rounded-full bg-stone-900/80 flex items-center justify-center text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <img
                  src={`/images/${selectedShoe.shoe_name}.jpg`}
                  alt={selectedShoe.shoe_name}
                  className="w-full max-h-[400px] object-contain drop-shadow-2xl"
                  onError={(e) => { e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%231c1917'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2357534e' font-size='18'%3ENo Image%3C/text%3E%3C/svg%3E"; }}
                />
              </div>

              {/* Right â€” Details */}
              <div className="p-6 lg:p-8 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider bg-amber-500/10 px-2.5 py-1 rounded-md">
                      {getCategoryName(selectedShoe.category_id)}
                    </span>
                    <span className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-md ${
                      selectedShoe.stock > 10 ? 'bg-emerald-500/10 text-emerald-400' : selectedShoe.stock > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {selectedShoe.stock > 0 ? `${selectedShoe.stock} in stock` : 'Sold out'}
                    </span>
                  </div>
                  <button onClick={closeModal} className="hidden lg:flex w-9 h-9 rounded-full bg-stone-800 items-center justify-center text-stone-400 hover:text-white hover:bg-stone-700 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-1 leading-tight">{selectedShoe.shoe_name}</h2>
                <p className="text-sm text-stone-500 mb-6">Product #{selectedShoe.shoe_detail_id} â€¢ Size EU {selectedShoe.shoe_size}</p>

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-3xl font-extrabold text-white">
                    {selectedShoe.shoe_price.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
                  </span>
                  <span className="text-base text-stone-600 line-through">
                    {(selectedShoe.shoe_price * 1.2).toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">-20%</span>
                </div>

                {/* Features */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[{icon: "M5 13l4 4L19 7", label: "Quality"}, {icon: "M20 12H4", label: "Free Ship"}, {icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", label: "24/7"}].map((feat, i) => (
                    <div key={i} className="text-center p-2.5 rounded-xl bg-stone-800/60 border border-stone-800">
                      <svg className="w-4 h-4 mx-auto mb-1 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={feat.icon} />
                      </svg>
                      <p className="text-[10px] text-stone-400 font-medium">{feat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Quantity */}
                {selectedShoe.stock > 0 && (
                  <div className="mb-6">
                    <p className="text-xs font-medium text-stone-400 mb-2 uppercase tracking-wider">Quantity</p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-stone-800 rounded-xl overflow-hidden">
                        <button onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))} disabled={selectedQuantity <= 1}
                          className="w-11 h-11 flex items-center justify-center text-white hover:bg-stone-700 transition-colors disabled:opacity-30">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
                        </button>
                        <span className="w-12 text-center text-white font-bold text-lg">{selectedQuantity}</span>
                        <button onClick={() => setSelectedQuantity(Math.min(selectedShoe.stock, selectedQuantity + 1))} disabled={selectedQuantity >= selectedShoe.stock}
                          className="w-11 h-11 flex items-center justify-center text-white hover:bg-stone-700 transition-colors disabled:opacity-30">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        </button>
                      </div>
                      <span className="text-xs text-stone-500">{selectedShoe.stock - selectedQuantity} remaining</span>
                    </div>
                  </div>
                )}

                {/* Total */}
                {selectedShoe.stock > 0 && selectedQuantity > 1 && (
                  <div className="flex items-baseline justify-between p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl mb-6">
                    <span className="text-sm text-stone-400">Total</span>
                    <span className="text-xl font-bold text-amber-400">
                      {(selectedShoe.shoe_price * selectedQuantity).toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 mt-auto">
                  <button
                    onClick={() => addToCart(selectedShoe.shoe_detail_id, selectedQuantity)}
                    disabled={selectedShoe.stock === 0}
                    className="flex-1 py-3.5 bg-stone-800 hover:bg-stone-700 text-white font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                  >
                    {selectedShoe.stock === 0 ? 'Sold Out' : 'Add to Cart'}
                  </button>
                  <button
                    onClick={async () => { await addToCart(selectedShoe.shoe_detail_id, selectedQuantity); navigate('/cart'); }}
                    disabled={selectedShoe.stock === 0}
                    className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                  >
                    {selectedShoe.stock === 0 ? 'Sold Out' : 'Buy Now'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.25s ease-out; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

export default Product;
