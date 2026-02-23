import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function ShoeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shoe, setShoe] = useState(null);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchShoe = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/shoes/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setShoe(response.data);
      } catch (error) {
        console.error("Error fetching shoe details:", error);
        setError("Error fetching data. Please try again later.");
      }
    };
    fetchShoe();
  }, [id, token]);

  const addToCart = async () => {
    try {
      const userId = 1;
      const data = {
        id_user: userId,
        shoe_detail_id: shoe.shoe_detail_id,
        quantity: quantity,
      };
      const response = await axios.post("http://localhost:5000/api/cart", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 201) {
        alert(`${shoe.shoe_name} added to cart!`);
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
      alert("There was an issue adding the item to your cart. Please try again.");
    }
  };

  const handleBuyNow = () => {
    navigate(`/payment/${shoe.shoe_detail_id}`);
  };

  const getCategoryName = (categoryId) => {
    const categories = { 1: "Sport", 2: "Casual", 3: "Boots", 4: "Heels", 5: "Formal" };
    return categories[categoryId] || "Unknown";
  };

  if (error) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4" style={{fontFamily:'Outfit,sans-serif'}}>
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Error</h2>
          <p className="text-sm text-stone-400 mb-6">{error}</p>
          <button onClick={() => navigate("/products")} className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold rounded-xl transition-all text-sm">Back to Products</button>
        </div>
      </div>
    );
  }

  if (!shoe) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center" style={{fontFamily:'Outfit,sans-serif'}}>
        <div className="text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-stone-700"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500 animate-spin"></div>
          </div>
          <p className="text-lg text-stone-400 font-medium">Loading details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950" style={{fontFamily:'Outfit,sans-serif'}}>
      {/* Back nav */}
      <div className="border-b border-stone-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-stone-400 hover:text-white text-sm transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image */}
          <div className="bg-stone-900 rounded-3xl overflow-hidden border border-stone-800 flex items-center justify-center p-6 lg:p-10 min-h-[400px]">
            <img
              src={`/images/${shoe.shoe_name}.jpg`}
              alt={shoe.shoe_name}
              className="max-w-full max-h-[450px] object-contain drop-shadow-2xl"
              onError={(e) => { e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%231c1917'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2357534e' font-size='18'%3ENo Image%3C/text%3E%3C/svg%3E"; }}
            />
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-amber-500 uppercase tracking-widest mb-2">
              {getCategoryName(shoe.category_id)}
            </span>
            <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">{shoe.shoe_name}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-extrabold text-white">
                {shoe.shoe_price.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
              </span>
            </div>

            {/* Info chips */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-3 py-1.5 bg-stone-900 border border-stone-800 rounded-xl text-xs font-medium text-stone-300">
                Size EU {shoe.shoe_size}
              </span>
              <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                shoe.stock > 10 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                shoe.stock > 0 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {shoe.stock > 0 ? `${shoe.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Quantity */}
            {shoe.stock > 0 && (
              <div className="mb-6">
                <p className="text-xs font-medium text-stone-500 mb-2 uppercase tracking-wider">Quantity</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}
                      className="w-11 h-11 flex items-center justify-center text-white hover:bg-stone-800 transition-colors disabled:opacity-30">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
                    </button>
                    <span className="w-12 text-center text-white font-bold text-lg">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(shoe.stock, quantity + 1))} disabled={quantity >= shoe.stock}
                      className="w-11 h-11 flex items-center justify-center text-white hover:bg-stone-800 transition-colors disabled:opacity-30">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    </button>
                  </div>
                  <span className="text-xs text-stone-500">{shoe.stock - quantity} remaining</span>
                </div>
              </div>
            )}

            {/* Total */}
            {shoe.stock > 0 && quantity > 1 && (
              <div className="flex items-baseline justify-between p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl mb-6">
                <span className="text-sm text-stone-400">Total</span>
                <span className="text-xl font-bold text-amber-400">
                  {(shoe.shoe_price * quantity).toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-auto">
              <button onClick={addToCart} disabled={shoe.stock === 0}
                className="flex-1 py-3.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-white font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm">
                Add to Cart
              </button>
              <button onClick={handleBuyNow} disabled={shoe.stock === 0}
                className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm">
                Buy Now
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-4 mt-6 pt-6 border-t border-stone-800">
              {[{icon: "M5 13l4 4L19 7", text: "Free shipping"}, {icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", text: "30-day return"}, {icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", text: "Secure"}].map((badge, i) => (
                <div key={i} className="flex items-center gap-1.5 text-stone-500 text-xs">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={badge.icon} />
                  </svg>
                  <span>{badge.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoeDetail;
