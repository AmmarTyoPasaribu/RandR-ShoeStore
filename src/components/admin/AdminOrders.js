import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import API_URL from '../../config/api';

function AdminOrders({ accessToken }) {
  const [orders, setOrders] = useState([]);
  const [editOrder, setEditOrder] = useState(null);

  const authHeaders = { headers: { Authorization: `Bearer ${accessToken}` } };

  useEffect(() => {
    fetchOrders();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchOrders = () => {
    axios.get(`${API_URL}/orders`, authHeaders)
      .then((response) => setOrders(response.data))
      .catch((error) => console.error("Error fetching orders:", error));
  };

  const handleEditOrder = (order) => { setEditOrder({ ...order }); };

  const handleUpdateOrder = () => {
    axios.put(`${API_URL}/orders/${editOrder.order_id}`, {
      order_status: editOrder.order_status,
      order_date: editOrder.order_date,
    }, authHeaders)
      .then(() => {
        fetchOrders();
        setEditOrder(null);
        Swal.fire({ icon: "success", title: "Updated!", text: "Order updated successfully!", background: '#1c1917', color: '#fff', confirmButtonColor: '#f59e0b' });
      })
      .catch((error) => {
        console.error("Error updating order:", error);
        Swal.fire({ icon: "error", title: "Error!", text: "Failed to update order.", background: '#1c1917', color: '#fff', confirmButtonColor: '#ef4444' });
      });
  };

  const handleDeleteOrder = (orderId) => {
    Swal.fire({
      title: "Delete order?", text: "This action cannot be undone.", icon: "warning",
      showCancelButton: true, confirmButtonColor: "#ef4444", cancelButtonColor: "#57534e", confirmButtonText: "Delete",
      background: '#1c1917', color: '#fff',
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`${API_URL}/orders/${orderId}`, authHeaders)
          .then(() => {
            fetchOrders();
            Swal.fire({ icon: "success", title: "Deleted!", timer: 1500, showConfirmButton: false, background: '#1c1917', color: '#fff' });
          })
          .catch((error) => {
            console.error("Error deleting order:", error);
            Swal.fire({ icon: "error", title: "Error!", text: "Failed to delete order.", background: '#1c1917', color: '#fff', confirmButtonColor: '#ef4444' });
          });
      }
    });
  };

  const statusColor = (s) => {
    const map = { pending: 'bg-amber-500/10 text-amber-400', processing: 'bg-blue-500/10 text-blue-400', shipped: 'bg-purple-500/10 text-purple-400', delivered: 'bg-emerald-500/10 text-emerald-400', cancelled: 'bg-red-500/10 text-red-400' };
    return map[s] || 'bg-stone-800 text-stone-400';
  };

  return (
    <div className="min-h-screen bg-stone-950 p-4 sm:p-6 lg:p-8" style={{fontFamily:'Outfit,sans-serif'}}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-sm text-stone-500 mt-1">{orders.length} total orders</p>
        </div>

        <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-800">
                  {['Order ID','User ID','Shoe ID','Status','Date','Actions'].map(h => (
                    <th key={h} className={`px-5 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-widest ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.order_id} className="border-b border-stone-800/50 hover:bg-stone-800/30 transition-colors">
                    <td className="px-5 py-3 text-sm text-stone-400 font-mono">#{order.order_id}</td>
                    <td className="px-5 py-3 text-sm text-stone-300">{order.user_id}</td>
                    <td className="px-5 py-3 text-sm text-stone-300">{order.shoe_detail_id}</td>
                    <td className="px-5 py-3">
                      {editOrder && editOrder.order_id === order.order_id ? (
                        <select value={editOrder.order_status} onChange={(e) => setEditOrder({ ...editOrder, order_status: e.target.value })}
                          className="px-2 py-1 bg-stone-800 border border-amber-500/50 rounded-lg text-white text-sm focus:outline-none">
                          {['pending','processing','shipped','delivered','cancelled'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                        </select>
                      ) : (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md capitalize ${statusColor(order.order_status)}`}>{order.order_status}</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {editOrder && editOrder.order_id === order.order_id ? (
                        <input type="date" value={editOrder.order_date} onChange={(e) => setEditOrder({ ...editOrder, order_date: e.target.value })}
                          className="px-2 py-1 bg-stone-800 border border-amber-500/50 rounded-lg text-white text-sm focus:outline-none" />
                      ) : (
                        <span className="text-sm text-stone-400">{new Date(order.order_date).toLocaleDateString()}</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {editOrder && editOrder.order_id === order.order_id ? (
                          <>
                            <button onClick={handleUpdateOrder} className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors" title="Save">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            </button>
                            <button onClick={() => setEditOrder(null)} className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:bg-stone-700 transition-colors" title="Cancel">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEditOrder(order)} className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors" title="Edit">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => handleDeleteOrder(order.order_id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Delete">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-stone-500">No orders found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOrders;
