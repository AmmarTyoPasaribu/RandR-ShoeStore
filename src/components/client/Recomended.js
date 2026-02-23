import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import API_URL from '../../config/api';

function Recomended({ userId, accessToken }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const itemsPerPage = 12;
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId || !accessToken) {
      setError("User not found. Please login again.");
      setLoading(false);
      navigate("/signin");
      return;
    }

    const fetchRecommendations = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/shoe_recommendations/${userId}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        if (!response.data || response.data.length === 0) {
          setError("No recommendations found. Browse our products to get personalized recommendations!");
          setLoading(false);
          return;
        }

        const shoeDetails = response.data.map((rec) => ({
          id: rec.shoe_detail_id,
          shoeName: rec.shoe_name,
          shoePrice: rec.shoe_price,
          shoeSize: rec.shoe_size,
          stock: rec.stock,
          categoryId: rec.category_id,
          dateAdded: rec.date_added,
          lastUpdated: rec.last_updated,
        }));

        setProducts(shoeDetails);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        if (err.response && (err.response.status === 401 || err.response.status === 422)) {
          Swal.fire({
            icon: 'error',
            title: 'Session Expired',
            text: 'Your session has expired. Please login again.',
            showConfirmButton: true,
            confirmButtonColor: '#F59E0B',
          }).then(() => {
            navigate("/signin");
          });
        } else {
          setError("No recommendations found yet. Browse and interact with products to get personalized recommendations!");
        }
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId, accessToken, navigate]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedProducts = products.slice(startIndex, endIndex);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setSelectedQuantity(1);
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
    setSelectedQuantity(1);
    document.body.style.overflow = 'unset';
  };

  const addToCart = async (shoeId, quantity) => {
    if (!userId || !accessToken) {
      Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please login to add items to cart',
        showConfirmButton: true,
        confirmButtonColor: '#F59E0B',
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
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: response.data.message || "Item successfully added to cart!",
        showConfirmButton: true,
        confirmButtonColor: '#10B981',
        timer: 2000,
        timerProgressBar: true,
      });

      closeModal();
    } catch (error) {
      console.error("Error adding to cart:", error);

      if (error.response && (error.response.status === 401 || error.response.status === 422)) {
        Swal.fire({
          icon: 'error',
          title: 'Session Expired',
          text: 'Your session has expired. Please login again.',
          showConfirmButton: true,
          confirmButtonColor: '#F59E0B',
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

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center" style={{fontFamily:'Outfit,sans-serif'}}>
        <div className="text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-stone-700"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500 animate-spin"></div>
          </div>
          <p className="text-lg text-stone-400 font-medium">Curating your picks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4" style={{fontFamily:'Outfit,sans-serif'}}>
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white mb-2">No Recommendations Yet</h2>
          <p className="text-sm text-stone-400 mb-6">{error}</p>
          <button onClick={() => navigate("/products")} className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold rounded-xl transition-all text-sm">
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950" style={{fontFamily:'Outfit,sans-serif'}}>
      {/* Header */}
      <div className="border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-white">Curated For You</h1>
          <p className="text-sm text-stone-500 mt-0.5">Personalized picks based on your activity • {products.length} recommendations</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {displayedProducts.map((product) => (
            <div
              key={product.id}
              className="group relative bg-stone-900 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:ring-2 hover:ring-amber-500/50 hover:shadow-xl hover:shadow-amber-500/5"
              onClick={() => handleProductClick(product)}
            >
              {/* Image */}
              <div className="relative aspect-square bg-stone-800 overflow-hidden">
                <img
                  src={`/images/${product.shoeName}.jpg`}
                  alt={product.shoeName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%231c1917'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2357534e' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E";
                  }}
                />
                
                {/* Stock badge */}
                <div className="absolute top-2.5 left-2.5">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    product.stock > 10 ? 'bg-emerald-500/90 text-white' : product.stock > 0 ? 'bg-amber-500/90 text-stone-950' : 'bg-red-500/90 text-white'
                  }`}>
                    {product.stock > 0 ? `${product.stock} left` : 'Sold out'}
                  </span>
                </div>

                {/* Quick-add on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); addToCart(product.id, 1); }}
                    disabled={product.stock === 0}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {product.stock === 0 ? 'Sold Out' : '+ Add to Cart'}
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-3 sm:p-4 space-y-1.5">
                <p className="text-[10px] font-semibold text-amber-500 uppercase tracking-widest">
                  {getCategoryName(product.categoryId)}
                </p>
                <h3 className="text-sm font-semibold text-white leading-tight line-clamp-2 min-h-[2.5rem]">
                  {product.shoeName}
                </h3>
                <div className="flex items-baseline justify-between pt-1">
                  <p className="text-base font-bold text-amber-400">
                    {product.shoePrice.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
                  </p>
                  <span className="text-[10px] text-stone-500 font-medium">EU {product.shoeSize}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-10">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-stone-800 text-white hover:bg-stone-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            {Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1;
              if (pageNumber === 1 || pageNumber === totalPages || (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)) {
                return (
                  <button key={index} onClick={() => handlePageChange(pageNumber)}
                    className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                      currentPage === pageNumber ? "bg-amber-500 text-stone-950 shadow-lg" : "bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-white"
                    }`}
                  >{pageNumber}</button>
                );
              } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                return <span key={index} className="w-6 text-center text-stone-600">•</span>;
              }
              return null;
            })}
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-stone-800 text-white hover:bg-stone-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-stone-900 rounded-3xl max-w-4xl w-full shadow-2xl border border-stone-800 overflow-hidden animate-fadeIn max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Left — Image */}
              <div className="relative bg-stone-800 p-6 lg:p-10 flex items-center justify-center min-h-[300px]">
                <button onClick={closeModal} className="absolute top-4 right-4 lg:hidden w-10 h-10 rounded-full bg-stone-900/80 flex items-center justify-center text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <img src={`/images/${selectedProduct.shoeName}.jpg`} alt={selectedProduct.shoeName}
                  className="w-full max-h-[400px] object-contain drop-shadow-2xl"
                  onError={(e) => { e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%231c1917'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2357534e' font-size='18'%3ENo Image%3C/text%3E%3C/svg%3E"; }}
                />
              </div>

              {/* Right — Details */}
              <div className="p-6 lg:p-8 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider bg-amber-500/10 px-2.5 py-1 rounded-md">
                      {getCategoryName(selectedProduct.categoryId)}
                    </span>
                    <span className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-md ${
                      selectedProduct.stock > 10 ? 'bg-emerald-500/10 text-emerald-400' : selectedProduct.stock > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {selectedProduct.stock > 0 ? `${selectedProduct.stock} in stock` : 'Sold out'}
                    </span>
                  </div>
                  <button onClick={closeModal} className="hidden lg:flex w-9 h-9 rounded-full bg-stone-800 items-center justify-center text-stone-400 hover:text-white hover:bg-stone-700 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-1 leading-tight">{selectedProduct.shoeName}</h2>
                <p className="text-sm text-stone-500 mb-6">Product #{selectedProduct.id} • Size EU {selectedProduct.shoeSize}</p>

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-3xl font-extrabold text-white">
                    {selectedProduct.shoePrice.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
                  </span>
                  <span className="text-base text-stone-600 line-through">
                    {(selectedProduct.shoePrice * 1.2).toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
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
                {selectedProduct.stock > 0 && (
                  <div className="mb-6">
                    <p className="text-xs font-medium text-stone-400 mb-2 uppercase tracking-wider">Quantity</p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-stone-800 rounded-xl overflow-hidden">
                        <button onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))} disabled={selectedQuantity <= 1}
                          className="w-11 h-11 flex items-center justify-center text-white hover:bg-stone-700 transition-colors disabled:opacity-30">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
                        </button>
                        <span className="w-12 text-center text-white font-bold text-lg">{selectedQuantity}</span>
                        <button onClick={() => setSelectedQuantity(Math.min(selectedProduct.stock, selectedQuantity + 1))} disabled={selectedQuantity >= selectedProduct.stock}
                          className="w-11 h-11 flex items-center justify-center text-white hover:bg-stone-700 transition-colors disabled:opacity-30">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        </button>
                      </div>
                      <span className="text-xs text-stone-500">{selectedProduct.stock - selectedQuantity} remaining</span>
                    </div>
                  </div>
                )}

                {/* Total */}
                {selectedProduct.stock > 0 && selectedQuantity > 1 && (
                  <div className="flex items-baseline justify-between p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl mb-6">
                    <span className="text-sm text-stone-400">Total</span>
                    <span className="text-xl font-bold text-amber-400">
                      {(selectedProduct.shoePrice * selectedQuantity).toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 mt-auto">
                  <button onClick={() => addToCart(selectedProduct.id, selectedQuantity)} disabled={selectedProduct.stock === 0}
                    className="flex-1 py-3.5 bg-stone-800 hover:bg-stone-700 text-white font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm">
                    {selectedProduct.stock === 0 ? 'Sold Out' : 'Add to Cart'}
                  </button>
                  <button onClick={async () => { await addToCart(selectedProduct.id, selectedQuantity); navigate('/cart'); }} disabled={selectedProduct.stock === 0}
                    className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm">
                    {selectedProduct.stock === 0 ? 'Sold Out' : 'Buy Now'}
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
      `}</style>
    </div>
  );
}

export default Recomended;