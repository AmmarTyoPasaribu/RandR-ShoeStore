import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

function OrderPage({ userId, accessToken }) {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const itemsPerPage = 10;

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/orders/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to fetch orders. Please try again later.");
      setLoading(false);
    }
  }, [userId, accessToken]);

  useEffect(() => {
    console.log("OrderPage received props:", { userId, accessToken });
    if (userId && accessToken) {
      fetchOrders();
    } else {
      setError("User ID or Token not found");
      setLoading(false);
    }
  }, [userId, accessToken, fetchOrders]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const indexOfLastOrder = currentPage * itemsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusConfig = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('pending')) return { color: 'text-yellow-400', bg: 'bg-yellow-400/10', dot: 'bg-yellow-400' };
    if (s.includes('completed') || s.includes('delivered')) return { color: 'text-emerald-400', bg: 'bg-emerald-400/10', dot: 'bg-emerald-400' };
    if (s.includes('cancelled') || s.includes('failed')) return { color: 'text-red-400', bg: 'bg-red-400/10', dot: 'bg-red-400' };
    if (s.includes('processing') || s.includes('shipped')) return { color: 'text-amber-400', bg: 'bg-amber-400/10', dot: 'bg-amber-400' };
    return { color: 'text-stone-400', bg: 'bg-stone-800', dot: 'bg-stone-400' };
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
          <p className="text-lg text-stone-400 font-medium">Loading orders...</p>
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
          <h2 className="text-lg font-bold text-white mb-2">Error</h2>
          <p className="text-sm text-stone-400 mb-6">{error}</p>
          <button onClick={fetchOrders} className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold rounded-xl transition-all text-sm">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950" style={{fontFamily:'Outfit,sans-serif'}}>
      {/* Header */}
      <div className="border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-white">Your Orders</h1>
          <p className="text-sm text-stone-500 mt-0.5">{orders.length} {orders.length === 1 ? 'order' : 'orders'} placed</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentOrders.length > 0 ? (
          <div className="space-y-3">
            {currentOrders.map((order) => {
              const status = getStatusConfig(order.order_status);
              return (
                <div
                  key={order.order_id}
                  className="group bg-stone-900 rounded-2xl p-4 flex items-center gap-4 hover:bg-stone-900/80 transition-colors border border-stone-800/50 hover:border-stone-700 cursor-pointer"
                  onClick={() => { setSelectedOrder(order); document.body.style.overflow = 'hidden'; }}
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-stone-800 overflow-hidden flex-shrink-0">
                    <img
                      src={`/images/${order.shoe_name}.jpg`}
                      alt={order.shoe_name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%231c1917'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2357534e' font-size='10'%3ENo Img%3C/text%3E%3C/svg%3E"; }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-stone-500">#{order.order_id}</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${status.bg} ${status.color}`}>
                        {order.order_status}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-white truncate">{order.shoe_name}</h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {new Date(order.order_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-amber-400">{formatPrice(order.amount)}</p>
                  </div>

                  {/* Arrow */}
                  <svg className="w-4 h-4 text-stone-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-stone-900 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-stone-400 mb-1">No orders yet</h3>
            <p className="text-sm text-stone-600 mb-6">Start shopping to see your orders here</p>
            <a href="/products" className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl font-semibold text-sm transition-all">Browse Products</a>
          </div>
        )}

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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={() => { setSelectedOrder(null); document.body.style.overflow = 'unset'; }}>
          <div className="bg-stone-900 rounded-3xl max-w-lg w-full shadow-2xl border border-stone-800 overflow-hidden animate-fadeIn" onClick={(e) => e.stopPropagation()}>
            {/* Image */}
            <div className="relative bg-stone-800 p-6 flex items-center justify-center h-64">
              <button onClick={() => { setSelectedOrder(null); document.body.style.overflow = 'unset'; }}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-stone-900/80 flex items-center justify-center text-white hover:bg-stone-900 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <img src={`/images/${selectedOrder.shoe_name}.jpg`} alt={selectedOrder.shoe_name} className="max-h-full object-contain"
                onError={(e) => { e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%231c1917'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2357534e' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E"; }}
              />
            </div>
            {/* Details */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-stone-500">Order #{selectedOrder.order_id}</span>
                {(() => { const s = getStatusConfig(selectedOrder.order_status); return (
                  <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-md ${s.bg} ${s.color}`}>{selectedOrder.order_status}</span>
                ); })()}
              </div>
              <h2 className="text-xl font-bold text-white mb-1">{selectedOrder.shoe_name}</h2>
              <p className="text-xs text-stone-500 mb-4">
                {new Date(selectedOrder.order_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>

              <div className="bg-stone-800/50 rounded-xl p-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-stone-400 text-sm">Total Amount</span>
                  <span className="text-lg font-bold text-amber-400">{formatPrice(selectedOrder.amount)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl transition-all text-sm">Track Order</button>
                <button onClick={() => { setSelectedOrder(null); document.body.style.overflow = 'unset'; }}
                  className="flex-1 py-3 bg-stone-800 hover:bg-stone-700 text-white font-medium rounded-xl transition-all text-sm">Close</button>
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

export default OrderPage;