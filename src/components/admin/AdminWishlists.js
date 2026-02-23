import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

function AdminWishlists({ accessToken }) {
  const [wishlists, setWishlists] = useState([]);
  const [newWishlist, setNewWishlist] = useState({ id_user: '', shoe_detail_id: '' });
  const [editWishlist, setEditWishlist] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchWishlists();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const authHeaders = { headers: { Authorization: `Bearer ${accessToken}` } };

  const fetchWishlists = () => {
    axios.get('http://localhost:5000/api/wishlist', authHeaders)
      .then(response => setWishlists(response.data))
      .catch(error => console.error('Error fetching wishlists:', error));
  };

  const handleCreateWishlist = () => {
    if (!newWishlist.id_user || !newWishlist.shoe_detail_id) return;
    axios.post('http://localhost:5000/api/wishlist', newWishlist, authHeaders)
      .then(() => {
        fetchWishlists();
        setNewWishlist({ id_user: '', shoe_detail_id: '' });
        setShowForm(false);
        Swal.fire({ icon: 'success', title: 'Created!', text: 'Wishlist created successfully!', background: '#1c1917', color: '#fff', confirmButtonColor: '#f59e0b' });
      })
      .catch(error => {
        console.error('Error creating wishlist:', error);
        Swal.fire({ icon: 'error', title: 'Error!', text: 'Failed to create wishlist.', background: '#1c1917', color: '#fff', confirmButtonColor: '#ef4444' });
      });
  };

  const handleEditWishlist = (wishlist) => { setEditWishlist({ ...wishlist }); };

  const handleUpdateWishlist = () => {
    axios.put(`http://localhost:5000/api/wishlist/${editWishlist.id_wishlist}`, editWishlist, authHeaders)
      .then(() => {
        fetchWishlists();
        setEditWishlist(null);
        Swal.fire({ icon: 'success', title: 'Updated!', text: 'Wishlist updated successfully!', background: '#1c1917', color: '#fff', confirmButtonColor: '#f59e0b' });
      })
      .catch(error => {
        console.error('Error updating wishlist:', error);
        Swal.fire({ icon: 'error', title: 'Error!', text: 'Failed to update wishlist.', background: '#1c1917', color: '#fff', confirmButtonColor: '#ef4444' });
      });
  };

  const handleDeleteWishlist = (wishlistId) => {
    Swal.fire({
      title: 'Delete wishlist item?', text: "This action cannot be undone.", icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#57534e', confirmButtonText: 'Delete',
      background: '#1c1917', color: '#fff',
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`http://localhost:5000/api/wishlist/${wishlistId}`, authHeaders)
          .then(() => {
            fetchWishlists();
            Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1500, showConfirmButton: false, background: '#1c1917', color: '#fff' });
          })
          .catch(error => {
            console.error('Error deleting wishlist:', error);
            Swal.fire({ icon: 'error', title: 'Error!', text: 'Failed to delete wishlist.', background: '#1c1917', color: '#fff', confirmButtonColor: '#ef4444' });
          });
      }
    });
  };

  const editInputCls = "px-2 py-1 bg-stone-800 border border-amber-500/50 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 w-20";
  const inputCls = "flex-1 px-4 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white text-sm placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all";

  return (
    <div className="min-h-screen bg-stone-950 p-4 sm:p-6 lg:p-8" style={{fontFamily:'Outfit,sans-serif'}}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Wishlists</h1>
            <p className="text-sm text-stone-500 mt-0.5">{wishlists.length} items</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl transition-all text-sm flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add
          </button>
        </div>

        {showForm && (
          <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5 mb-6">
            <h2 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-3">New Wishlist Entry</h2>
            <div className="flex gap-3">
              <input type="number" placeholder="User ID" value={newWishlist.id_user} onChange={(e) => setNewWishlist({ ...newWishlist, id_user: e.target.value })} className={inputCls} />
              <input type="number" placeholder="Shoe Detail ID" value={newWishlist.shoe_detail_id} onChange={(e) => setNewWishlist({ ...newWishlist, shoe_detail_id: e.target.value })} className={inputCls} />
              <button onClick={handleCreateWishlist} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl transition-all text-sm whitespace-nowrap">Create</button>
            </div>
          </div>
        )}

        <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-800">
                {['ID','User ID','Shoe ID','Actions'].map(h => (
                  <th key={h} className={`px-5 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-widest ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {wishlists.map(wishlist => (
                <tr key={wishlist.id_wishlist} className="border-b border-stone-800/50 hover:bg-stone-800/30 transition-colors">
                  <td className="px-5 py-3 text-sm text-stone-400 font-mono">{wishlist.id_wishlist}</td>
                  <td className="px-5 py-3">
                    {editWishlist && editWishlist.id_wishlist === wishlist.id_wishlist ? (
                      <input type="number" value={editWishlist.id_user} onChange={(e) => setEditWishlist({ ...editWishlist, id_user: e.target.value })} className={editInputCls} />
                    ) : (
                      <span className="text-sm text-white">{wishlist.id_user}</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {editWishlist && editWishlist.id_wishlist === wishlist.id_wishlist ? (
                      <input type="number" value={editWishlist.shoe_detail_id} onChange={(e) => setEditWishlist({ ...editWishlist, shoe_detail_id: e.target.value })} className={editInputCls} />
                    ) : (
                      <span className="text-sm text-stone-300">{wishlist.shoe_detail_id}</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {editWishlist && editWishlist.id_wishlist === wishlist.id_wishlist ? (
                        <>
                          <button onClick={handleUpdateWishlist} className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors" title="Save">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          </button>
                          <button onClick={() => setEditWishlist(null)} className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:bg-stone-700 transition-colors" title="Cancel">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEditWishlist(wishlist)} className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors" title="Edit">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button onClick={() => handleDeleteWishlist(wishlist.id_wishlist)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Delete">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {wishlists.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-stone-500">No wishlists found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminWishlists;
