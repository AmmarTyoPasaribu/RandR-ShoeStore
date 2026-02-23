import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";

function AdminUser({ accessToken }) {
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);

  const authHeaders = { headers: { Authorization: `Bearer ${accessToken}` } };

  const fetchUsers = useCallback(() => {
    axios
      .get("http://localhost:5000/api/users", authHeaders)
      .then((response) => setUsers(response.data))
      .catch((error) => console.error("Error fetching users:", error));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEditUser = (user) => { setEditUser({ ...user }); };

  const handleUpdateUser = () => {
    axios
      .put(`http://localhost:5000/api/users/profile/${editUser.user_id}`, editUser, authHeaders)
      .then(() => {
        fetchUsers();
        setEditUser(null);
        Swal.fire({ icon: "success", title: "Updated!", text: "User updated successfully!", background: '#1c1917', color: '#fff', confirmButtonColor: '#f59e0b' });
      })
      .catch((error) => {
        console.error("Error updating user:", error);
        Swal.fire({ icon: "error", title: "Error!", text: "Failed to update user.", background: '#1c1917', color: '#fff', confirmButtonColor: '#ef4444' });
      });
  };

  const handleDeleteUser = (userId) => {
    Swal.fire({
      title: "Delete user?", text: "This action cannot be undone.", icon: "warning",
      showCancelButton: true, confirmButtonColor: "#ef4444", cancelButtonColor: "#57534e", confirmButtonText: "Delete",
      background: '#1c1917', color: '#fff',
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`http://localhost:5000/api/users/${userId}`, authHeaders)
          .then(() => {
            fetchUsers();
            Swal.fire({ icon: "success", title: "Deleted!", timer: 1500, showConfirmButton: false, background: '#1c1917', color: '#fff' });
          })
          .catch((error) => {
            console.error("Error deleting user:", error);
            Swal.fire({ icon: "error", title: "Error!", text: "Failed to delete user.", background: '#1c1917', color: '#fff', confirmButtonColor: '#ef4444' });
          });
      }
    });
  };

  const editInputCls = "px-2 py-1 bg-stone-800 border border-amber-500/50 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 w-full";

  return (
    <div className="min-h-screen bg-stone-950 p-4 sm:p-6 lg:p-8" style={{fontFamily:'Outfit,sans-serif'}}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-sm text-stone-500 mt-1">{users.length} registered users</p>
        </div>

        {/* Table */}
        <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-800">
                  {['ID','Username','Email','First Name','Last Name','Role','Actions'].map(h => (
                    <th key={h} className={`px-5 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-widest ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.user_id} className="border-b border-stone-800/50 hover:bg-stone-800/30 transition-colors">
                    <td className="px-5 py-3 text-sm text-stone-400 font-mono">{user.user_id}</td>
                    <td className="px-5 py-3">
                      {editUser && editUser.user_id === user.user_id ? (
                        <input type="text" value={editUser.username} onChange={(e) => setEditUser({ ...editUser, username: e.target.value })} className={editInputCls} />
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-amber-400">{(user.username || "U")[0].toUpperCase()}</span>
                          </div>
                          <span className="text-sm font-medium text-white">{user.username}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 text-sm text-stone-400">{user.email}</td>
                    <td className="px-5 py-3">
                      {editUser && editUser.user_id === user.user_id ? (
                        <input type="text" value={editUser.first_name || ''} onChange={(e) => setEditUser({ ...editUser, first_name: e.target.value })} className={editInputCls} />
                      ) : (
                        <span className="text-sm text-stone-300">{user.first_name}</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {editUser && editUser.user_id === user.user_id ? (
                        <input type="text" value={editUser.last_name || ''} onChange={(e) => setEditUser({ ...editUser, last_name: e.target.value })} className={editInputCls} />
                      ) : (
                        <span className="text-sm text-stone-300">{user.last_name}</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {editUser && editUser.user_id === user.user_id ? (
                        <select value={editUser.role} onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                          className="px-2 py-1 bg-stone-800 border border-amber-500/50 rounded-lg text-white text-sm focus:outline-none">
                          <option value="User">User</option>
                          <option value="Admin">Admin</option>
                        </select>
                      ) : (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${user.role === 'Admin' ? 'bg-amber-500/10 text-amber-400' : 'bg-stone-800 text-stone-400'}`}>
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {editUser && editUser.user_id === user.user_id ? (
                          <>
                            <button onClick={handleUpdateUser} className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors" title="Save">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            </button>
                            <button onClick={() => setEditUser(null)} className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:bg-stone-700 transition-colors" title="Cancel">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEditUser(user)} className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors" title="Edit">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => handleDeleteUser(user.user_id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Delete">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-8 text-center text-sm text-stone-500">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminUser;
