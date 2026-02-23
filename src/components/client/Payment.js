import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function Payment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Pending");

  const handlePayment = () => {
    setPaymentStatus("Success");
    alert("Payment successful!");
  };

  const methods = [
    { value: "Credit Card", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
    { value: "Bank Transfer", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
    { value: "E-Wallet", icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" },
  ];

  return (
    <div className="min-h-screen bg-stone-950" style={{fontFamily:'Outfit,sans-serif'}}>
      {/* Header */}
      <div className="border-b border-stone-800">
        <div className="max-w-lg mx-auto px-4 py-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-stone-400 hover:text-white text-sm mb-4 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back
          </button>
          <h1 className="text-2xl font-bold text-white">Checkout</h1>
          <p className="text-sm text-stone-500 mt-0.5">Product #{id}</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* Payment Method */}
        <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5">
          <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Payment Method</h2>
          <div className="space-y-2.5">
            {methods.map((m) => (
              <label key={m.value}
                className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === m.value ? 'border-amber-500 bg-amber-500/5' : 'border-stone-800 hover:border-stone-700 bg-stone-800/30'
                }`}>
                <input type="radio" name="payment" value={m.value} checked={paymentMethod === m.value}
                  onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  paymentMethod === m.value ? 'border-amber-500' : 'border-stone-600'
                }`}>
                  {paymentMethod === m.value && <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>}
                </div>
                <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={m.icon} />
                </svg>
                <span className="text-sm font-medium text-white">{m.value}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Status</span>
            <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-md ${
              paymentStatus === "Success" ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
            }`}>{paymentStatus}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button onClick={handlePayment} disabled={!paymentMethod}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed">
            Confirm Payment
          </button>
          <button onClick={() => navigate(-1)}
            className="w-full py-3.5 bg-stone-800 hover:bg-stone-700 text-white font-medium rounded-xl transition-all text-sm">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default Payment;
