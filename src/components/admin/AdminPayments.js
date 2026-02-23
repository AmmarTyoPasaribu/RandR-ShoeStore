import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import API_URL from '../../config/api';

function AdminPayments({ accessToken }) {
  const [payments, setPayments] = useState([]);
  const [editPayment, setEditPayment] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const authHeaders = { headers: { Authorization: `Bearer ${accessToken}` } };

  const fetchPayments = async () => {
    try {
      const response = await axios.get(`${API_URL}/payments`, authHeaders);
      setPayments(response.data);
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };

  const handleEditPayment = (payment) => { setEditPayment({ ...payment }); };

  const handleUpdatePayment = async () => {
    try {
      const response = await axios.put(`${API_URL}/payments/${editPayment.payment_id}`, editPayment, authHeaders);
      fetchPayments();
      setEditPayment(null);
      Swal.fire({ icon: "success", title: "Updated!", text: response.data.message, background: '#1c1917', color: '#fff', confirmButtonColor: '#f59e0b' });
    } catch (error) {
      console.error("Error updating payment:", error);
      Swal.fire({ icon: "error", title: "Error!", text: error.response?.data?.message || "Failed to update payment.", background: '#1c1917', color: '#fff', confirmButtonColor: '#ef4444' });
    }
  };

  const handleDeletePayment = async (paymentId) => {
    const result = await Swal.fire({
      title: "Delete payment?", text: "This action cannot be undone.", icon: "warning",
      showCancelButton: true, confirmButtonColor: "#ef4444", cancelButtonColor: "#57534e", confirmButtonText: "Delete",
      background: '#1c1917', color: '#fff',
    });
    if (result.isConfirmed) {
      try {
        const response = await axios.delete(`${API_URL}/payments/${paymentId}`, authHeaders);
        fetchPayments();
        Swal.fire({ icon: "success", title: "Deleted!", text: response.data.message, timer: 1500, showConfirmButton: false, background: '#1c1917', color: '#fff' });
      } catch (error) {
        console.error("Error deleting payment:", error);
        Swal.fire({ icon: "error", title: "Error!", text: error.response?.data?.message || "Failed to delete payment.", background: '#1c1917', color: '#fff', confirmButtonColor: '#ef4444' });
      }
    }
  };

  const statusColor = (s) => {
    const map = { pending: 'bg-amber-500/10 text-amber-400', paid: 'bg-emerald-500/10 text-emerald-400', failed: 'bg-red-500/10 text-red-400', refunded: 'bg-purple-500/10 text-purple-400' };
    return map[s] || 'bg-stone-800 text-stone-400';
  };

  const methodIcon = (m) => {
    const icons = {
      'Credit Card': 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
      'Bank Transfer': 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      'E-Wallet': 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
      'Cash on Delivery': 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
    };
    return icons[m] || 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
  };

  return (
    <div className="min-h-screen bg-stone-950 p-4 sm:p-6 lg:p-8" style={{fontFamily:'Outfit,sans-serif'}}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Payments</h1>
          <p className="text-sm text-stone-500 mt-1">{payments.length} payment records</p>
        </div>

        <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-800">
                  {['ID','Order','Method','Status','Date','Actions'].map(h => (
                    <th key={h} className={`px-5 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-widest ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.payment_id} className="border-b border-stone-800/50 hover:bg-stone-800/30 transition-colors">
                    <td className="px-5 py-3 text-sm text-stone-400 font-mono">#{payment.payment_id}</td>
                    <td className="px-5 py-3 text-sm text-stone-300">#{payment.order_id}</td>
                    <td className="px-5 py-3">
                      {editPayment && editPayment.payment_id === payment.payment_id ? (
                        <select value={editPayment.payment_method} onChange={(e) => setEditPayment({ ...editPayment, payment_method: e.target.value })}
                          className="px-2 py-1 bg-stone-800 border border-amber-500/50 rounded-lg text-white text-sm focus:outline-none">
                          {['Cash on Delivery','Bank Transfer','Credit Card','E-Wallet'].map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      ) : (
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={methodIcon(payment.payment_method)} /></svg>
                          <span className="text-sm text-white">{payment.payment_method}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {editPayment && editPayment.payment_id === payment.payment_id ? (
                        <select value={editPayment.payment_status} onChange={(e) => setEditPayment({ ...editPayment, payment_status: e.target.value })}
                          className="px-2 py-1 bg-stone-800 border border-amber-500/50 rounded-lg text-white text-sm focus:outline-none">
                          {['pending','paid','failed','refunded'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                        </select>
                      ) : (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md capitalize ${statusColor(payment.payment_status)}`}>{payment.payment_status}</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {editPayment && editPayment.payment_id === payment.payment_id ? (
                        <input type="date" value={editPayment.payment_date} onChange={(e) => setEditPayment({ ...editPayment, payment_date: e.target.value })}
                          className="px-2 py-1 bg-stone-800 border border-amber-500/50 rounded-lg text-white text-sm focus:outline-none" />
                      ) : (
                        <span className="text-sm text-stone-400">{new Date(payment.payment_date).toLocaleDateString()}</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {editPayment && editPayment.payment_id === payment.payment_id ? (
                          <>
                            <button onClick={handleUpdatePayment} className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors" title="Save">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            </button>
                            <button onClick={() => setEditPayment(null)} className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:bg-stone-700 transition-colors" title="Cancel">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEditPayment(payment)} className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors" title="Edit">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => handleDeletePayment(payment.payment_id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Delete">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-stone-500">No payments found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPayments;
