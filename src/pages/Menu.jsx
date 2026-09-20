import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, X, Layers, Tag } from 'lucide-react';
import { fetchMenuItems, fetchCategories, createMenuItem, updateMenuItem, deleteMenuItem, createCategory, deleteCategory, API_URL } from '../services/api';

const Menu = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [newItem, setNewItem] = useState({
    name: '',
    category_id: '',
    price: '',
    description: '',
    image_url: '',
    image: null,
    is_active: true,
    is_vegetarian: false,
    is_gluten_free: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [menuItems, cats] = await Promise.all([
        fetchMenuItems(),
        fetchCategories()
      ]);

      setCategories(cats);

      const catMap = cats.reduce((acc, cat) => {
        acc[cat.id] = cat.name;
        return acc;
      }, {});

      const mappedItems = menuItems.map(item => ({
        id: item.id,
        name: item.name,
        category: catMap[item.category_id] || 'Unknown',
        category_id: item.category_id,
        price: Number(item.price),
        status: item.is_active ? 'Active' : 'Inactive',
        description: item.description,
        image_url: item.has_image ? `${API_URL}/menu-items/${item.id}/image` : item.image_url,
        is_vegetarian: item.is_vegetarian,
        is_gluten_free: item.is_gluten_free,
        is_active: item.is_active
      }));

      setItems(mappedItems);
    } catch (error) {
      console.error('Failed to load menu data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setNewItem({
      name: '',
      category_id: categories.length > 0 ? categories[0].id : '',
      price: '',
      description: '',
      image_url: '',
      image: null,
      is_active: true,
      is_vegetarian: false,
      is_gluten_free: false
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setIsEditMode(true);
    setEditingId(item.id);
    setNewItem({
        name: item.name,
        category_id: item.category_id,
        price: item.price,
        description: item.description || '',
        image_url: item.image_url || '',
        image: null,
        is_active: item.status === 'Active', // status is mapped in loadData
        is_vegetarian: item.is_vegetarian,
        is_gluten_free: item.is_gluten_free
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const itemData = {
        ...newItem,
        category_id: Number(newItem.category_id),
        price: Number(newItem.price)
      };

      if (isEditMode) {
        await updateMenuItem(editingId, itemData);
      } else {
        await createMenuItem(itemData);
      }
      
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      alert(`Failed to ${isEditMode ? 'update' : 'create'} menu item`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteMenuItem(id);
        loadData();
      } catch (error) {
        alert('Failed to delete menu item');
      }
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const slug = newCategoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      await createCategory({ name: newCategoryName.trim(), slug: slug, display_order: categories.length + 1 });
      setNewCategoryName('');
      loadData();
    } catch (error) {
      alert('Failed to create category');
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (window.confirm('Delete this category? Items in this category will not be deleted.')) {
      try {
        await deleteCategory(catId);
        loadData();
      } catch (error) {
        alert('Failed to delete category');
      }
    }
  };

  const filteredItems = items.filter(item => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || item.name.toLowerCase().includes(q) || (item.description && item.description.toLowerCase().includes(q));
    const matchesCategory = categoryFilter === 'all' || item.category_id === Number(categoryFilter);
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-dark">Menu Management</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium shadow-sm"
          >
            <Layers size={18} />
            Categories ({categories.length})
          </button>
          <button 
            onClick={openAddModal}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-semibold shadow-sm"
          >
            <Plus size={18} />
            Add New Item
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-lg flex items-center justify-center p-4 z-50 h-full">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-dark">{isEditMode ? 'Edit Menu Item' : 'Add New Item'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="e.g. Margherita Pizza"
                      value={newItem.name}
                      onChange={e => setNewItem({...newItem, name: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      required
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      value={newItem.category_id}
                      onChange={e => setNewItem({...newItem, category_id: e.target.value})}
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      value={newItem.price}
                      onChange={e => setNewItem({...newItem, price: e.target.value})}
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      rows="3"
                      placeholder="Enter item description..."
                      value={newItem.description}
                      onChange={e => setNewItem({...newItem, description: e.target.value})}
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                    <div className="space-y-3">
                      {(newItem.image_url || newItem.image) && (
                        <div className="mb-2">
                          <img 
                            src={newItem.image ? URL.createObjectURL(newItem.image) : newItem.image_url} 
                            alt="Preview" 
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all"
                            onChange={e => setNewItem({...newItem, image: e.target.files[0]})}
                          />
                        </div>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-gray-200"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white px-2 text-gray-500">Or use URL</span>
                        </div>
                      </div>
                      <input
                        type="url"
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        placeholder="https://..."
                        value={newItem.image_url}
                        onChange={e => setNewItem({...newItem, image_url: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="col-span-2 flex flex-wrap gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          checked={newItem.is_vegetarian}
                          onChange={e => setNewItem({...newItem, is_vegetarian: e.target.checked})}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-dark">Vegetarian</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          checked={newItem.is_gluten_free}
                          onChange={e => setNewItem({...newItem, is_gluten_free: e.target.checked})}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-dark">Gluten Free</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          checked={newItem.is_active}
                          onChange={e => setNewItem({...newItem, is_active: e.target.checked})}
                        />
                         <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-dark">Active</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100">
                  <button type="submit" className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 active:scale-[0.98]">
                    {isEditMode ? 'Update Item' : 'Create Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-dark flex items-center gap-2">
                <Layers size={20} className="text-primary" />
                Manage Categories
              </h2>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
              <input
                type="text"
                placeholder="New category name..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors"
              >
                Add
              </button>
            </form>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <span className="font-semibold text-dark text-sm">{cat.name}</span>
                    <span className="text-xs text-gray-400 block">slug: {cat.slug}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search dishes, ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            />
          </div>
          
          <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Item Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                    No menu items found.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-dark flex items-center gap-3">
                      {item.image_url && (
                        <img 
                          src={item.image_url} 
                          alt={item.name} 
                          className="w-10 h-10 object-cover rounded-lg border border-gray-100 shrink-0" 
                        />
                      )}
                      <div>
                        <div>{item.name}</div>
                        {item.description && (
                          <div className="text-xs text-gray-400 max-w-xs truncate">{item.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{item.category}</td>
                    <td className="px-6 py-4 font-medium text-dark">${item.price.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Item"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Menu;

