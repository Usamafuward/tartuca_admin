import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, X } from 'lucide-react';
import { fetchMenuItems, fetchCategories, createMenuItem, updateMenuItem, deleteMenuItem, API_URL } from '../services/api';

const Menu = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-dark">Menu Management</h1>
        <button 
          onClick={openAddModal}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Add New Item
        </button>
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search menu items..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
            <Filter size={20} />
            <span>Filter</span>
          </button>
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
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-dark">{item.name}</td>
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
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Menu;
