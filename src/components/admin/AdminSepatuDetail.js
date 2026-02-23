import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

function AdminSepatuDetail() {
  const navigate = useNavigate();
  const [shoes, setShoes] = useState([]);
  const [newShoe, setNewShoe] = useState({
    category_id: '',
    shoe_name: '',
    shoe_price: '',
    shoe_size: '',
    stock: ''
  });
  const [editShoe, setEditShoe] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchShoes();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchShoes = () => {
    axios.get('http://localhost:5000/api/shoes')
      .then(response => setShoes(response.data))
      .catch(error => console.error('Error fetching shoes:', error));
  };

  const handleCreateShoe = () => {
    if (!newShoe.shoe_name || !newShoe.shoe_price) return;
    axios.post('http://localhost:5000/api/shoes', newShoe)
      .then(() => {
        fetchShoes();
        setNewShoe({ category_id: '', shoe_name: '', shoe_price: '', shoe_size: '', stock: '' });
        setShowForm(false);
        Swal.fire({ icon: 'success', title: 'Created!', text: 'Shoe created successfully!', background: '#1c1917', color: '#fff', confirmButtonColor: '#f59e0b' });
      })
      .catch(error => {
        console.error('Error creating shoe:', error);
        Swal.fire({ icon: 'error', title: 'Error!', text: 'Failed to create shoe.', background: '#1c1917', color: '#fff', confirmButtonColor: '#ef4444' });
      });
  };

  const handleEditShoe = (shoe) => { setEditShoe({ ...shoe }); };

  const handleUpdateShoe = () => {
    axios.put(`http://localhost:5000/api/shoes/${editShoe.shoe_detail_id}`, editShoe)
      .then(() => {
        fetchShoes();
        setEditShoe(null);
        Swal.fire({ icon: 'success', title: 'Updated!', text: 'Shoe updated successfully!', background: '#1c1917', color: '#fff', confirmButtonColor: '#f59e0b' });
      })
      .catch(error => {
        console.error('Error updating shoe:', error);
        Swal.fire({ icon: 'error', title: 'Error!', text: 'Failed to update shoe.', background: '#1c1917', color: '#fff', confirmButtonColor: '#ef4444' });
      });
  };

  const handleDeleteShoe = (shoeId) => {
    Swal.fire({
      title: 'Delete shoe?', text: "This action cannot be undone.", icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#57534e', confirmButtonText: 'Delete',
      background: '#1c1917', color: '#fff',
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`http://localhost:5000/api/shoes/${shoeId}`)
          .then(() => {
            fetchShoes();
            Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1500, showConfirmButton: false, background: '#1c1917', color: '#fff' });
          })
          .catch(error => {
            console.error('Error deleting shoe:', error);
            Swal.fire({ icon: 'error', title: 'Error!', text: 'Failed to delete shoe.', background: '#1c1917', color: '#fff', confirmButtonColor: '#ef4444' });
          });
      }
    });
  };

  const handleBack = () => { navigate('/admin'); };

  const inputCls = "w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white text-sm placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all";
  const editInputCls = "px-2 py-1 bg-stone-800 border border-amber-500/50 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 w-full";

  return (
    <div className="min-h-screen bg-stone-950 p-4 sm:p-6 lg:p-8" style={{fontFamily:'Outfit,sans-serif'}}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button onClick={handleBack} className="flex items-center gap-1.5 text-stone-400 hover:text-white text-sm mb-2 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back to Admin
            </button>
            <h1 className="text-2xl font-bold text-white">Shoe Details</h1>
            <p className="text-sm text-stone-500 mt-0.5">{shoes.length} products</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl transition-all text-sm flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add Shoe
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5 mb-6">
            <h2 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4">New Shoe</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <input type="number" placeholder="Category ID" value={newShoe.category_id} onChange={(e) => setNewShoe({ ...newShoe, category_id: e.target.value })} className={inputCls} />
              <input type="text" placeholder="Shoe Name" value={newShoe.shoe_name} onChange={(e) => setNewShoe({ ...newShoe, shoe_name: e.target.value })} className={inputCls} />
              <input type="number" placeholder="Price" value={newShoe.shoe_price} onChange={(e) => setNewShoe({ ...newShoe, shoe_price: e.target.value })} className={inputCls} />
              <input type="number" placeholder="Size" value={newShoe.shoe_size} onChange={(e) => setNewShoe({ ...newShoe, shoe_size: e.target.value })} className={inputCls} />
              <input type="number" placeholder="Stock" value={newShoe.stock} onChange={(e) => setNewShoe({ ...newShoe, stock: e.target.value })} className={inputCls} />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleCreateShoe} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl transition-all text-sm">Create</button>
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-white rounded-xl transition-all text-sm">Cancel</button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-800">
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-widest">ID</th>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-widest">Name</th>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-widest">Price</th>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-widest">Size</th>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-widest">Stock</th>
                  <th className="text-right px-5 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shoes.map(shoe => (
                  <tr key={shoe.shoe_detail_id} className="border-b border-stone-800/50 hover:bg-stone-800/30 transition-colors">
                    <td className="px-5 py-3 text-sm text-stone-400 font-mono">{shoe.shoe_detail_id}</td>
                    <td className="px-5 py-3">
                      {editShoe && editShoe.shoe_detail_id === shoe.shoe_detail_id ? (
                        <input type="text" value={editShoe.shoe_name} onChange={(e) => setEditShoe({ ...editShoe, shoe_name: e.target.value })} className={editInputCls} />
                      ) : (
                        <span className="text-sm font-medium text-white">{shoe.shoe_name}</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {editShoe && editShoe.shoe_detail_id === shoe.shoe_detail_id ? (
                        <input type="number" value={editShoe.shoe_price} onChange={(e) => setEditShoe({ ...editShoe, shoe_price: e.target.value })} className={editInputCls} />
                      ) : (
                        <span className="text-sm text-emerald-400">{Number(shoe.shoe_price).toLocaleString('id-ID', {style:'currency',currency:'IDR',minimumFractionDigits:0})}</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {editShoe && editShoe.shoe_detail_id === shoe.shoe_detail_id ? (
                        <input type="number" value={editShoe.shoe_size} onChange={(e) => setEditShoe({ ...editShoe, shoe_size: e.target.value })} className={editInputCls} />
                      ) : (
                        <span className="text-sm text-stone-300">{shoe.shoe_size}</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {editShoe && editShoe.shoe_detail_id === shoe.shoe_detail_id ? (
                        <input type="number" value={editShoe.stock} onChange={(e) => setEditShoe({ ...editShoe, stock: e.target.value })} className={editInputCls} />
                      ) : (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${shoe.stock > 10 ? 'bg-emerald-500/10 text-emerald-400' : shoe.stock > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                          {shoe.stock}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {editShoe && editShoe.shoe_detail_id === shoe.shoe_detail_id ? (
                          <>
                            <button onClick={handleUpdateShoe} className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors" title="Save">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            </button>
                            <button onClick={() => setEditShoe(null)} className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:bg-stone-700 transition-colors" title="Cancel">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEditShoe(shoe)} className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors" title="Edit">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => handleDeleteShoe(shoe.shoe_detail_id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Delete">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {shoes.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-stone-500">No shoes found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSepatuDetail;
