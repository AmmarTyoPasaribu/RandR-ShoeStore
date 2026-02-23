import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

function AdminSepatu({ accessToken }) {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [editCategory, setEditCategory] = useState(null);

  const authHeaders = { headers: { Authorization: `Bearer ${accessToken}` } };

  useEffect(() => {
    fetchCategories();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCategories = () => {
    axios.get('http://localhost:5000/api/categories', authHeaders)
      .then(response => {
        setCategories(response.data);
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
      });
  };

  const handleCreateCategory = () => {
    if (!newCategory.trim()) return;
    axios.post('http://localhost:5000/api/categories', { category_name: newCategory }, authHeaders)
      .then(() => {
        fetchCategories();
        setNewCategory('');
        Swal.fire({ icon: 'success', title: 'Created!', text: 'Category created successfully!', background: '#1c1917', color: '#fff', confirmButtonColor: '#f59e0b' });
      })
      .catch(error => {
        console.error('Error creating category:', error);
        Swal.fire({ icon: 'error', title: 'Error!', text: 'Failed to create category.', background: '#1c1917', color: '#fff', confirmButtonColor: '#ef4444' });
      });
  };

  const handleEditCategory = (category) => {
    setEditCategory({ ...category });
  };

  const handleUpdateCategory = () => {
    axios.put(`http://localhost:5000/api/categories/${editCategory.category_id}`, { category_name: editCategory.category_name }, authHeaders)
      .then(() => {
        fetchCategories();
        setEditCategory(null);
        Swal.fire({ icon: 'success', title: 'Updated!', text: 'Category updated successfully!', background: '#1c1917', color: '#fff', confirmButtonColor: '#f59e0b' });
      })
      .catch(error => {
        console.error('Error updating category:', error);
        Swal.fire({ icon: 'error', title: 'Error!', text: 'Failed to update category.', background: '#1c1917', color: '#fff', confirmButtonColor: '#ef4444' });
      });
  };

  const handleDeleteCategory = (categoryId) => {
    Swal.fire({
      title: 'Delete category?',
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#57534e',
      confirmButtonText: 'Delete',
      background: '#1c1917',
      color: '#fff',
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`http://localhost:5000/api/categories/${categoryId}`, authHeaders)
          .then(() => {
            fetchCategories();
            Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1500, showConfirmButton: false, background: '#1c1917', color: '#fff' });
          })
          .catch(error => {
            console.error('Error deleting category:', error);
            Swal.fire({ icon: 'error', title: 'Error!', text: 'Failed to delete category.', background: '#1c1917', color: '#fff', confirmButtonColor: '#ef4444' });
          });
      }
    });
  };

  return (
    <div className="min-h-screen bg-stone-950 p-4 sm:p-6 lg:p-8" style={{fontFamily:'Outfit,sans-serif'}}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Shoe Categories</h1>
          <p className="text-sm text-stone-500 mt-1">Manage product categories</p>
        </div>

        {/* Add Category */}
        <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5 mb-6">
          <h2 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-3">New Category</h2>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
              className="flex-1 px-4 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white text-sm placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
            />
            <button
              onClick={handleCreateCategory}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl transition-all text-sm flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Add
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-800">
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-widest">ID</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-widest">Category Name</th>
                <th className="text-right px-5 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(category => (
                <tr key={category.category_id} className="border-b border-stone-800/50 hover:bg-stone-800/30 transition-colors">
                  <td className="px-5 py-3 text-sm text-stone-400 font-mono">{category.category_id}</td>
                  <td className="px-5 py-3">
                    {editCategory && editCategory.category_id === category.category_id ? (
                      <input
                        type="text"
                        value={editCategory.category_name}
                        onChange={(e) => setEditCategory({ ...editCategory, category_name: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleUpdateCategory()}
                        className="px-3 py-1.5 bg-stone-800 border border-amber-500/50 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                        autoFocus
                      />
                    ) : (
                      <span className="text-sm font-medium text-white">{category.category_name}</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {editCategory && editCategory.category_id === category.category_id ? (
                        <>
                          <button onClick={handleUpdateCategory} className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors" title="Save">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          </button>
                          <button onClick={() => setEditCategory(null)} className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:bg-stone-700 transition-colors" title="Cancel">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEditCategory(category)} className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors" title="Edit">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button onClick={() => handleDeleteCategory(category.category_id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Delete">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr><td colSpan={3} className="px-5 py-8 text-center text-sm text-stone-500">No categories found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminSepatu;
