import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, X } from 'lucide-react';
import { fetchSpecialOffers, createSpecialOffer, deleteSpecialOffer, updateSpecialOffer, API_URL } from '../services/api';

const SpecialOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newOffer, setNewOffer] = useState({
    title: '',
    description: '',
    price: '',
    badge_text: '',
    badge_color: 'red',
    image_url: '',
    image: null
  });

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      const data = await fetchSpecialOffers();
      const mappedOffers = data.map(offer => ({
        ...offer,
        image: offer.has_image ? `${API_URL}/special-offers/${offer.id}/image` : offer.image_url
      }));
      setOffers(mappedOffers);
    } catch (error) {
      console.error('Failed to load offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setNewOffer({ title: '', description: '', price: '', badge_text: '', badge_color: 'red', image_url: '', image: null });
    setIsModalOpen(true);
  };

  const openEditModal = (offer) => {
    setIsEditMode(true);
    setEditingId(offer.id);
    setNewOffer({
      title: offer.title,
      description: offer.description || '',
      price: offer.price,
      badge_text: offer.badge_text || '',
      badge_color: offer.badge_color || 'red',
      image_url: offer.image_url || '',
      image: null
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const offerData = {
        ...newOffer,
        price: Number(newOffer.price)
      };

      if (isEditMode) {
        await updateSpecialOffer(editingId, offerData);
      } else {
        await createSpecialOffer(offerData);
      }
      setIsModalOpen(false);
      loadOffers();
    } catch (error) {
      alert(`Failed to ${isEditMode ? 'update' : 'create'} offer`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      try {
        await deleteSpecialOffer(id);
        loadOffers();
      } catch (error) {
        alert('Failed to delete offer');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-dark">Special Offers</h1>
        <button 
          onClick={openAddModal}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Add New Offer
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-lg flex items-center justify-center p-4 z-50 h-full">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-lg max-h-[90vh] flex flex-col">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-dark">{isEditMode ? 'Edit Special Offer' : 'Add Special Offer'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Offer Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Weekend Combo"
                      required
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      value={newOffer.title}
                      onChange={e => setNewOffer({...newOffer, title: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      placeholder="What's included?"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      rows="2"
                      value={newOffer.description}
                      onChange={e => setNewOffer({...newOffer, description: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        required
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        value={newOffer.price}
                        onChange={e => setNewOffer({...newOffer, price: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Badge Text</label>
                      <input
                        type="text"
                        placeholder="e.g. HOT"
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        value={newOffer.badge_text}
                        onChange={e => setNewOffer({...newOffer, badge_text: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Badge Color</label>
                    <select
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      value={newOffer.badge_color}
                      onChange={e => setNewOffer({...newOffer, badge_color: e.target.value})}
                    >
                      <option value="red">Red</option>
                      <option value="blue">Blue</option>
                      <option value="green">Green</option>
                      <option value="yellow">Yellow</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                    <div className="space-y-3">
                      {(newOffer.image_url || newOffer.image) && (
                        <div className="mb-2">
                          <img 
                            src={newOffer.image ? URL.createObjectURL(newOffer.image) : newOffer.image_url} 
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
                            onChange={e => setNewOffer({...newOffer, image: e.target.files[0]})}
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
                        placeholder="https://..."
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        value={newOffer.image_url}
                        onChange={e => setNewOffer({...newOffer, image_url: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-gray-100">
                  <button type="submit" className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 active:scale-[0.98]">
                    {isEditMode ? 'Update Offer' : 'Create Offer'}
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
              placeholder="Search offers..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {offers.map((offer) => (
            <div key={offer.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative h-48">
                <img 
                  src={offer.image_url || 'https://via.placeholder.com/400x200?text=No+Image'} 
                  alt={offer.title} 
                  className="w-full h-full object-cover"
                />
                {offer.badge_text && (
                  <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold text-white bg-${offer.badge_color}-500`}>
                    {offer.badge_text}
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-dark">{offer.title}</h3>
                  <span className="font-bold text-primary">${Number(offer.price).toFixed(2)}</span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{offer.description}</p>
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    offer.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {offer.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openEditModal(offer)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(offer.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpecialOffers;
