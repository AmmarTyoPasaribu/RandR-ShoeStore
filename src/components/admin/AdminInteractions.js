import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import API_URL from '../../config/api';

function AdminInteractions({ accessToken }) {
  const [interactions, setInteractions] = useState([]);
  const [newInteraction, setNewInteraction] = useState({ id_user: '', shoe_detail_id: '', interaction_type: '' });
  const [editInteraction, setEditInteraction] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchInteractions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const authHeaders = { headers: { Authorization: `Bearer ${accessToken}` } };

  const fetchInteractions = () => {
    axios.get(`${API_URL}/user_interactions`, authHeaders)
      .then(response => setInteractions(response.data))
      .catch(error => console.error('Error fetching interactions:', error));
  };

  const handleCreateInteraction = () => {
    if (!newInteraction.id_user || !newInteraction.shoe_detail_id || !newInteraction.interaction_type) {
      Swal.fire({ icon: 'error', title: 'Error!', text: 'All fields are required.', background: '#1c1917', color: '#fff', confirmButtonColor: '#ef4444' });
      return;
    }
    axios.post(`${API_URL}/user_interactions`, newInteraction, authHeaders)
      .then(() => {
        fetchInteractions();
        setNewInteraction({ id_user: '', shoe_detail_id: '', interaction_type: '' });
        setShowForm(false);
        Swal.fire({ icon: 'success', title: 'Created!', text: 'Interaction created successfully!', background: '#1c1917', color: '#fff', confirmButtonColor: '#f59e0b' });
      })
      .catch(error => {
        console.error('Error creating interaction:', error);
        Swal.fire({ icon: 'error', title: 'Error!', text: 'Failed to create interaction.', background: '#1c1917', color: '#fff', confirmButtonColor: '#ef4444' });
      });
  };

  const handleEditInteraction = (interaction) => { setEditInteraction({ ...interaction }); };

  const handleUpdateInteraction = () => {
    if (!editInteraction.id_user || !editInteraction.shoe_detail_id || !editInteraction.interaction_type) {
      Swal.fire({ icon: 'error', title: 'Error!', text: 'All fields are required.', background: '#1c1917', color: '#fff', confirmButtonColor: '#ef4444' });
      return;
    }
    axios.put(`${API_URL}/user_interactions/${editInteraction.interaction_id}`, editInteraction, authHeaders)
      .then(() => {
        fetchInteractions();
        setEditInteraction(null);
        Swal.fire({ icon: 'success', title: 'Updated!', text: 'Interaction updated successfully!', background: '#1c1917', color: '#fff', confirmButtonColor: '#f59e0b' });
      })
      .catch(error => {
        console.error('Error updating interaction:', error);
        Swal.fire({ icon: 'error', title: 'Error!', text: 'Failed to update interaction.', background: '#1c1917', color: '#fff', confirmButtonColor: '#ef4444' });
      });
  };

  const handleDeleteInteraction = (interactionId) => {
    Swal.fire({
      title: 'Delete interaction?', text: "This action cannot be undone.", icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#57534e', confirmButtonText: 'Delete',
      background: '#1c1917', color: '#fff',
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`${API_URL}/user_interactions/${interactionId}`, authHeaders)
          .then(() => {
            fetchInteractions();
            Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1500, showConfirmButton: false, background: '#1c1917', color: '#fff' });
          })
          .catch(error => {
            console.error('Error deleting interaction:', error);
            Swal.fire({ icon: 'error', title: 'Error!', text: 'Failed to delete interaction.', background: '#1c1917', color: '#fff', confirmButtonColor: '#ef4444' });
          });
      }
    });
  };

  const typeColor = (t) => {
    const map = { view: 'bg-blue-500/10 text-blue-400', click: 'bg-amber-500/10 text-amber-400', purchase: 'bg-emerald-500/10 text-emerald-400', wishlist: 'bg-red-500/10 text-red-400', cart: 'bg-purple-500/10 text-purple-400' };
    return map[t] || 'bg-stone-800 text-stone-400';
  };

  const editInputCls = "px-2 py-1 bg-stone-800 border border-amber-500/50 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 w-20";
  const inputCls = "flex-1 px-4 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white text-sm placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all";

  return (
    <div className="min-h-screen bg-stone-950 p-4 sm:p-6 lg:p-8" style={{fontFamily:'Outfit,sans-serif'}}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">User Interactions</h1>
            <p className="text-sm text-stone-500 mt-0.5">{interactions.length} records</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl transition-all text-sm flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add
          </button>
        </div>

        {showForm && (
          <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5 mb-6">
            <h2 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-3">New Interaction</h2>
            <div className="flex gap-3 flex-wrap">
              <input type="number" placeholder="User ID" value={newInteraction.id_user} onChange={(e) => setNewInteraction({ ...newInteraction, id_user: e.target.value })} className={inputCls} />
              <input type="number" placeholder="Shoe Detail ID" value={newInteraction.shoe_detail_id} onChange={(e) => setNewInteraction({ ...newInteraction, shoe_detail_id: e.target.value })} className={inputCls} />
              <input type="text" placeholder="Type (view, click, purchase...)" value={newInteraction.interaction_type} onChange={(e) => setNewInteraction({ ...newInteraction, interaction_type: e.target.value })} className={inputCls} />
              <button onClick={handleCreateInteraction} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl transition-all text-sm whitespace-nowrap">Create</button>
            </div>
          </div>
        )}

        <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-800">
                  {['ID','User ID','Shoe ID','Type','Actions'].map(h => (
                    <th key={h} className={`px-5 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-widest ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {interactions.map(interaction => (
                  <tr key={interaction.interaction_id} className="border-b border-stone-800/50 hover:bg-stone-800/30 transition-colors">
                    <td className="px-5 py-3 text-sm text-stone-400 font-mono">{interaction.interaction_id}</td>
                    <td className="px-5 py-3">
                      {editInteraction && editInteraction.interaction_id === interaction.interaction_id ? (
                        <input type="number" value={editInteraction.id_user} onChange={(e) => setEditInteraction({ ...editInteraction, id_user: e.target.value })} className={editInputCls} />
                      ) : (
                        <span className="text-sm text-white">{interaction.id_user}</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {editInteraction && editInteraction.interaction_id === interaction.interaction_id ? (
                        <input type="number" value={editInteraction.shoe_detail_id} onChange={(e) => setEditInteraction({ ...editInteraction, shoe_detail_id: e.target.value })} className={editInputCls} />
                      ) : (
                        <span className="text-sm text-stone-300">{interaction.shoe_detail_id}</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {editInteraction && editInteraction.interaction_id === interaction.interaction_id ? (
                        <input type="text" value={editInteraction.interaction_type} onChange={(e) => setEditInteraction({ ...editInteraction, interaction_type: e.target.value })}
                          className="px-2 py-1 bg-stone-800 border border-amber-500/50 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 w-24" />
                      ) : (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${typeColor(interaction.interaction_type)}`}>{interaction.interaction_type}</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {editInteraction && editInteraction.interaction_id === interaction.interaction_id ? (
                          <>
                            <button onClick={handleUpdateInteraction} className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors" title="Save">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            </button>
                            <button onClick={() => setEditInteraction(null)} className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:bg-stone-700 transition-colors" title="Cancel">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEditInteraction(interaction)} className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors" title="Edit">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => handleDeleteInteraction(interaction.interaction_id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Delete">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {interactions.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-stone-500">No interactions found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminInteractions;
