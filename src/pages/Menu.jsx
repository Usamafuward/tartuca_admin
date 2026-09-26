import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  X, 
  Sparkles, 
  Layers, 
  Check, 
  AlertCircle,
  Tag,
  DollarSign,
  RefreshCw
} from 'lucide-react';
import { 
  fetchMenuItems, 
  createMenuItem, 
  updateMenuItem, 
  deleteMenuItem,
  fetchCategories,
  createCategory,
  deleteCategory,
  API_URL 
} from '../services/api';
import CustomSelect from '../components/common/CustomSelect';
import { useSettings } from '../context/SettingsContext';

const Menu = () => {
  const { currencySymbol, formatPrice } = useSettings();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search and Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Item Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    status: 'available',
    is_vegetarian: false,
    is_gluten_free: false,
    image_url: '',
    image: null
  });

  // Category Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen || isCategoryModalOpen) {
      document.body.classList.add('modal-open');
      return () => {
        document.body.classList.remove('modal-open');
      };
    }
  }, [isModalOpen, isCategoryModalOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [itemsData, catsData] = await Promise.all([
        fetchMenuItems(),
        fetchCategories()
      ]);
      setItems(itemsData);
      setCategories(catsData);
      if (catsData.length > 0 && !newItem.category_id) {
        setNewItem(prev => ({ ...prev, category_id: catsData[0].id }));
      }
    } catch (error) {
      console.error('Failed to load menu data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setNewItem({
      name: '',
      description: '',
      price: '',
      category_id: categories.length > 0 ? categories[0].id : '',
      status: 'available',
      is_vegetarian: false,
      is_gluten_free: false,
      image_url: '',
      image: null
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setIsEditMode(true);
    setEditingId(item.id);
    setNewItem({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category_id: item.category_id,
      status: item.status || 'available',
      is_vegetarian: item.is_vegetarian || false,
      is_gluten_free: item.is_gluten_free || false,
      image_url: item.image_url || '',
      image: null
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
    if (window.confirm('Delete this menu item?')) {
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
    if (window.confirm('Delete this category? Items in this category will remain.')) {
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Menu Management</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage dishes, prices, categories, and availability.
          </p>
        </div>

        <div className="flex gap-2.5 self-stretch sm:self-auto">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-white/[0.08] text-xs font-medium text-slate-200 flex items-center gap-2 transition-all"
          >
            <Layers size={14} className="text-slate-400" />
            <span>Categories ({categories.length})</span>
          </button>

          <button 
            onClick={openAddModal}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] active:scale-[0.98]"
          >
            <Plus size={15} />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Item Modal (Create / Edit) */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
          <div className="glass-card-elevated rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.1] w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-5 border-b border-slate-200 dark:border-white/[0.08] flex justify-between items-center shrink-0 bg-white/95 dark:bg-[#0E1017]/95 backdrop-blur-xl rounded-t-2xl">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{isEditMode ? 'Edit Menu Item' : 'Add Menu Item'}</span>
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 modal-scrollbar">
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Item Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-lg text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 shadow-sm"
                    placeholder="e.g. Margherita Pizza"
                    value={newItem.name}
                    onChange={e => setNewItem({...newItem, name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                    <CustomSelect
                      required
                      value={newItem.category_id}
                      onChange={e => setNewItem({...newItem, category_id: e.target.value})}
                      options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
                      placeholder="Select Category"
                      name="category_id"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Price ({currencySymbol})</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-lg text-slate-900 dark:text-slate-200 font-mono focus:outline-none focus:border-amber-500/50 shadow-sm"
                      placeholder="14.50"
                      value={newItem.price}
                      onChange={e => setNewItem({...newItem, price: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <textarea
                    rows="2"
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-lg text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 resize-none shadow-sm"
                    placeholder="Brief description of the dish and ingredients..."
                    value={newItem.description}
                    onChange={e => setNewItem({...newItem, description: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Image URL</label>
                  <input
                    type="url"
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-lg text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 font-mono text-[11px] shadow-sm"
                    placeholder="https://images.unsplash.com/..."
                    value={newItem.image_url}
                    onChange={e => setNewItem({...newItem, image_url: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Availability</label>
                    <CustomSelect
                      value={newItem.status}
                      onChange={e => setNewItem({...newItem, status: e.target.value})}
                      options={[
                        { value: 'available', label: 'Available', dot: 'bg-emerald-400' },
                        { value: 'out_of_stock', label: 'Out of Stock', dot: 'bg-rose-500' }
                      ]}
                      name="status"
                    />
                  </div>

                  <div className="flex flex-col justify-end space-y-2 pb-1">
                    <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newItem.is_vegetarian}
                        onChange={e => setNewItem({...newItem, is_vegetarian: e.target.checked})}
                        className="rounded border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 text-amber-500 focus:ring-amber-500/30"
                      />
                      <span>Vegetarian</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newItem.is_gluten_free}
                        onChange={e => setNewItem({...newItem, is_gluten_free: e.target.checked})}
                        className="rounded border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 text-amber-500 focus:ring-amber-500/30"
                      />
                      <span>Gluten Free</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-white/[0.08] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 text-xs font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold transition-all shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                  >
                    {isEditMode ? 'Save Changes' : 'Create Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Category Management Modal */}
      {isCategoryModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
          <div className="glass-card-elevated rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.1] w-full max-w-md flex flex-col shadow-2xl">
            <div className="p-5 border-b border-slate-200 dark:border-white/[0.08] flex justify-between items-center shrink-0 bg-white/95 dark:bg-[#0E1017]/95 backdrop-blur-xl rounded-t-2xl">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers size={16} className="text-amber-500" />
                <span>Categories</span>
              </h2>
              <button 
                onClick={() => setIsCategoryModalOpen(false)} 
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <form onSubmit={handleAddCategory} className="flex gap-2">
                <input
                  type="text"
                  placeholder="New category name..."
                  className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-lg text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 shadow-sm"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Plus size={14} />
                  <span>Add</span>
                </button>
              </form>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 modal-scrollbar">
                {categories.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.05]">
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{cat.name}</span>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Delete category"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-xl border border-slate-200 dark:border-white/[0.07] overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-200 dark:border-white/[0.06] flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center bg-slate-50/50 dark:bg-[#0C0E14]/40">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={15} />
            <input
              type="text"
              placeholder="Search dishes or ingredients..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/[0.08] rounded-lg text-xs text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all shadow-xs"
            />
          </div>

          <div className="flex gap-2">
            <CustomSelect
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Categories' },
                ...categories.map(cat => ({ value: cat.id, label: cat.name }))
              ]}
              size="sm"
              width="w-38 sm:w-44"
            />

            <CustomSelect
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'available', label: 'Available', dot: 'bg-emerald-400' },
                { value: 'out_of_stock', label: 'Out of Stock', dot: 'bg-rose-500' }
              ]}
              size="sm"
              width="w-32 sm:w-36"
            />
          </div>
        </div>

        {/* Menu Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-[#090A0E] text-slate-600 dark:text-slate-400 text-[11px] uppercase font-mono tracking-wider border-b border-slate-200 dark:border-white/[0.06]">
              <tr>
                <th className="px-6 py-3.5">Dish</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Price</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04] text-xs">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw size={24} className="animate-spin text-amber-500" />
                      <p className="text-xs">Loading menu items...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    No menu items found.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const cat = categories.find(c => c.id === item.category_id);
                  const isAvailable = item.status !== 'out_of_stock';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.025] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.image_url ? (
                            <img 
                              src={item.image_url} 
                              alt={item.name} 
                              className="w-10 h-10 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08]"
                              onError={e => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08] flex items-center justify-center text-slate-400 dark:text-slate-500">
                              <Tag size={16} />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-200">{item.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {item.is_vegetarian && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                                  Veg
                                </span>
                              )}
                              {item.is_gluten_free && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium">
                                  GF
                                </span>
                              )}
                              {item.description && (
                                <p className="text-[11px] text-slate-500 truncate max-w-xs">{item.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        {cat?.name || 'Uncategorized'}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white tnum">
                        {formatPrice(item.price)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${
                          isAvailable
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-rose-500'}`} />
                          {isAvailable ? 'Available' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-white/[0.04] rounded-lg transition-colors"
                            title="Edit Item"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-white/[0.04] rounded-lg transition-colors"
                            title="Delete Item"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Menu;
