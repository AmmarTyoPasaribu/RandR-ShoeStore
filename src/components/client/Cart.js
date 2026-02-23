import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../../config/api";

function Cart({ userId, accessToken }) {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [shoesDetails, setShoesDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchShoesDetails = useCallback(async (shoeIds) => {
    try {
      if (shoeIds.length > 0) {
        const shoes = await Promise.all(
          shoeIds.map((id) =>
            fetch(`${API_URL}/shoes/${id}`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            }).then((response) => response.json())
          )
        );
        setShoesDetails(shoes);
      }
    } catch (error) {
      setError(error.message);
    }
  }, [accessToken]);

  const fetchCartItems = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching cart for user:', userId);
      console.log('Token:', accessToken ? 'exists' : 'missing');

      const response = await fetch(`${API_URL}/cart/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.status === 401 || response.status === 422) {
        setError("Your session has expired. Please login again.");
        return;
      }

      if (response.status === 403) {
        setError("Authorization failed. Please login again.");
        return;
      }

      if (response.status === 404) {
        // Cart is empty — not an error
        setCartItems([]);
        setLoading(false);
        return;
      }

      if (Array.isArray(data)) {
        setCartItems(data);
        const shoeIds = data.map((item) => item.shoe_detail_id);
        await fetchShoesDetails(shoeIds);
      } else {
        setCartItems([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Cart fetch error:', error);
      setError("Failed to load cart. Please try again.");
      setLoading(false);
    }
  }, [userId, accessToken, fetchShoesDetails]);

  useEffect(() => {
    if (userId && accessToken) {
      fetchCartItems();
    } else {
      setError("User ID or Token not found");
      setLoading(false);
    }
  }, [userId, accessToken, fetchCartItems]);


  const handleDelete = async (id) => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this item?"
      );
      if (confirmDelete) {
        await fetch(`${API_URL}/cart/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });
        setCartItems(cartItems.filter((item) => item.id_cart !== id));
        setShowModal(false);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    const confirmOrder = window.confirm(
      `You are about to place ${cartItems.length} order(s). Proceed?`
    );
    if (!confirmOrder) return;

    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      let successCount = 0;
      let failedItems = [];

      for (const item of cartItems) {
        try {
          // Create order
          const orderResponse = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              shoe_detail_id: item.shoe_detail_id,
              order_date: today,
              order_status: 'pending',
              amount: item.shoe_price * item.quantity,
            }),
          });
          const orderData = await orderResponse.json();

          // Create payment for this order
          if (orderData.order_id) {
            try {
              await fetch(`${API_URL}/payments`, {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  order_id: orderData.order_id,
                  payment_method: 'Cash on Delivery',
                  payment_status: 'pending',
                  payment_date: today,
                }),
              });
            } catch (payErr) {
              console.error('Payment creation error:', payErr);
            }
          }

          // Delete cart item after order created
          await fetch(`${API_URL}/cart/${item.id_cart}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });
          successCount++;
        } catch (err) {
          failedItems.push(item.shoe_name);
        }
      }

      setLoading(false);
      setShowModal(false);

      if (failedItems.length > 0) {
        alert(`${successCount} order(s) placed. Failed: ${failedItems.join(', ')}`);
      } else {
        alert(`${successCount} order(s) placed successfully!`);
      }

      navigate('/orders');
    } catch (error) {
      setLoading(false);
      alert('Failed to process checkout. Please try again.');
    }
  };

  const handleItemClick = (item) => {
    setSelectedItem(item); // Set selected item to show in modal
    setShowModal(true); // Show the modal
    document.body.style.overflow = 'hidden';
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCartItems = cartItems.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(cartItems.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset scroll when component unmounts (e.g. navigating away with modal open)
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    document.body.style.overflow = 'unset';
  };

  const formatPrice = (amount) => {
    return parseFloat(amount).toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center" style={{fontFamily:'Outfit,sans-serif'}}>
        <div className="text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-stone-700"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500 animate-spin"></div>
          </div>
          <p className="text-lg text-stone-400 font-medium">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4" style={{fontFamily:'Outfit,sans-serif'}}>
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-sm text-stone-400 mb-6">{error}</p>
          <div className="space-y-2">
            <button onClick={() => navigate('/signin')} className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold rounded-xl transition-all text-sm">Login Again</button>
            <button onClick={fetchCartItems} className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-white font-medium rounded-xl transition-all text-sm">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  // Order summary calculations
  const totalAmount = cartItems.reduce((sum, item) => {
    const shoe = shoesDetails.find(s => s.shoe_detail_id === item.shoe_detail_id);
    return sum + (shoe ? shoe.shoe_price * item.quantity : 0);
  }, 0);

  return (
    <div className="min-h-screen bg-stone-950" style={{fontFamily:'Outfit,sans-serif'}}>
      {/* Header */}
      <div className="border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Shopping Cart</h1>
              <p className="text-sm text-stone-500 mt-0.5">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</p>
            </div>
            <button onClick={() => navigate('/products')} className="text-sm text-amber-500 hover:text-amber-400 transition-colors font-medium flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>

      {cartItems.length === 0 ? (
        /* Empty Cart */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-stone-900 flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-stone-400 mb-1">Your cart is empty</h3>
          <p className="text-sm text-stone-600 mb-6">Discover our collection and add something you love</p>
          <button onClick={() => navigate('/products')} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl font-semibold text-sm transition-all">
            Browse Products
          </button>
        </div>
      ) : (
        /* Cart Content: Split View */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left â€” Cart Items */}
            <div className="lg:col-span-2 space-y-3">
              {currentCartItems.map((item) => {
                const shoe = shoesDetails.find(s => s.shoe_detail_id === item.shoe_detail_id);
                return (
                  <div key={item.id_cart} className="group bg-stone-900 rounded-2xl p-4 flex items-center gap-4 hover:bg-stone-900/80 transition-colors border border-stone-800/50 hover:border-stone-700">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-stone-800 overflow-hidden flex-shrink-0 cursor-pointer" onClick={() => handleItemClick(item)}>
                      <img
                        src={`/images/${shoe?.shoe_name || 'placeholder'}.jpg`}
                        alt={shoe?.shoe_name || 'Product'}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%231c1917'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2357534e' font-size='10'%3ENo Img%3C/text%3E%3C/svg%3E"; }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-semibold text-white truncate cursor-pointer hover:text-amber-400 transition-colors" onClick={() => handleItemClick(item)}>
                        {shoe?.shoe_name || 'Unknown Product'}
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">Size EU {shoe?.shoe_size || 'N/A'} â€¢ Qty: {item.quantity}</p>
                      <p className="text-sm font-bold text-amber-400 mt-1">
                        {shoe ? formatPrice(shoe.shoe_price * item.quantity) : 'N/A'}
                      </p>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={(e) => { e.stopPropagation(); if (window.confirm("Remove this item?")) handleDelete(item.id_cart); }}
                      className="w-9 h-9 rounded-xl bg-stone-800 hover:bg-red-500/20 flex items-center justify-center transition-all group/del flex-shrink-0"
                    >
                      <svg className="w-4 h-4 text-stone-500 group-hover/del:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                );
              })}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 pt-4">
                  <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-all disabled:opacity-30 bg-stone-800 text-white hover:bg-stone-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i} onClick={() => handlePageChange(i + 1)}
                      className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${currentPage === i + 1 ? "bg-amber-500 text-stone-950" : "bg-stone-800 text-stone-400 hover:bg-stone-700"}`}
                    >{i + 1}</button>
                  ))}
                  <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-all disabled:opacity-30 bg-stone-800 text-white hover:bg-stone-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              )}
            </div>

            {/* Right â€” Order Summary (Sticky) */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 bg-stone-900 rounded-2xl border border-stone-800 p-6 space-y-5">
                <h2 className="text-lg font-bold text-white">Order Summary</h2>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-stone-400">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span className="text-white font-medium">{formatPrice(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-stone-400">
                    <span>Shipping</span>
                    <span className="text-emerald-400 font-medium">Free</span>
                  </div>
                  <div className="border-t border-stone-800 pt-3">
                    <div className="flex justify-between">
                      <span className="text-white font-semibold">Total</span>
                      <span className="text-xl font-bold text-amber-400">{formatPrice(totalAmount)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl transition-all text-sm"
                >
                  Checkout
                </button>

                <div className="flex items-center justify-center gap-4 text-[11px] text-stone-500 pt-1">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Free shipping
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Easy returns
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {showModal && selectedItem && (() => {
        const shoe = shoesDetails.find(s => s.shoe_detail_id === selectedItem.shoe_detail_id);
        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={closeModal}>
            <div className="bg-stone-900 rounded-3xl max-w-lg w-full shadow-2xl border border-stone-800 overflow-hidden animate-fadeIn" onClick={(e) => e.stopPropagation()}>
              {/* Image */}
              <div className="relative bg-stone-800 p-6 flex items-center justify-center h-64">
                <button onClick={closeModal} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-stone-900/80 flex items-center justify-center text-white hover:bg-stone-900 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <img src={`/images/${shoe?.shoe_name || 'placeholder'}.jpg`} alt={shoe?.shoe_name} className="max-h-full object-contain"
                  onError={(e) => { e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%231c1917'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2357534e' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E"; }}
                />
              </div>
              {/* Details */}
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-1">{shoe?.shoe_name || 'Unknown'}</h2>
                <p className="text-xs text-stone-500 mb-4">Size EU {shoe?.shoe_size || 'N/A'} â€¢ Cart #{selectedItem.id_cart}</p>
                
                <div className="bg-stone-800/50 rounded-xl p-4 mb-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-400">Price</span>
                    <span className="text-white font-medium">{shoe ? formatPrice(shoe.shoe_price) : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-400">Quantity</span>
                    <span className="text-white font-medium">{selectedItem.quantity}</span>
                  </div>
                  <div className="border-t border-stone-700 pt-2">
                    <div className="flex justify-between">
                      <span className="text-stone-300 font-medium">Total</span>
                      <span className="text-lg font-bold text-amber-400">{shoe ? formatPrice(shoe.shoe_price * selectedItem.quantity) : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => { closeModal(); handleCheckout(); }} className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl transition-all text-sm">Checkout</button>
                  <button onClick={() => handleDelete(selectedItem.id_cart)} className="py-3 px-4 bg-stone-800 hover:bg-red-500/20 text-stone-400 hover:text-red-400 font-medium rounded-xl transition-all text-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

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

export default Cart;
