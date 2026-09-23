import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Tag, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  X, 
  Sparkles, 
  Check, 
  DollarSign, 
  Percent,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  fetchSpecialOffers, 
  createSpecialOffer, 
  updateSpecialOffer, 
  deleteSpecialOffer 
} from '../services/api';
import { SpecialOffersSkeleton } from '../components/common/Skeleton';
import { useSettings } from '../context/SettingsContext';

const SpecialOffers = () => {
  const { currencySymbol, formatPrice } = useSettings();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add('modal-open');
      return () => {
        document.body.classList.remove('modal-open');
      };
    }
  }, [isModalOpen]);
  const [newOffer, setNewOffer] = useState({
    title: '',
    description: '',
    price: '',
    badge_text: '',
    badge_color: 'amber',
    image_url: '',
    image: null,
    is_active: true
  });

  const loadOffers = async () => {
    setLoading(true);
    try {
      const data = await fetchSpecialOffers();
      setOffers(data);
    } catch (error) {
      console.error('Failed to load offers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const openAddModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setNewOffer({
      title: '',
      description: '',
      price: '',
      badge_text: '',
      badge_color: 'amber',
      image_url: '',
      image: null,
      is_active: true
    });
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
      badge_color: offer.badge_color || 'amber',
      image_url: offer.image_url || '',
      image: null,
      is_active: offer.is_active !== undefined ? offer.is_active : true
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
    if (window.confirm('Delete this special offer?')) {
      try {
        await deleteSpecialOffer(id);
        loadOffers();
      } catch (error) {
        alert('Failed to delete offer');
      }
    }
  };

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (offer.description && offer.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (offer.badge_text && offer.badge_text.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && offer.is_active) || 
      (statusFilter === 'inactive' && !offer.is_active);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Special Offers</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Create and manage discounts, promotions, and deals.
          </p>
        </div>

        <button 
          onClick={openAddModal}
          className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] active:scale-[0.98]"
        >
          <Plus size={15} />
          <span>Add Offer</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 rounded-xl border border-white/[0.07] flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center shadow-xl">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
          <input
            type="text"
            placeholder="Search offers..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-white/[0.08] rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all"
          />
        </div>

        <div className="flex gap-1.5">
          {['all', 'active', 'inactive'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                statusFilter === status
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-white/[0.04]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Offers Modal (Create / Edit) */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
          <div className="glass-card-elevated rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.1] w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-5 border-b border-slate-200 dark:border-white/[0.08] flex justify-between items-center shrink-0 bg-white/95 dark:bg-[#0E1017]/95 backdrop-blur-xl rounded-t-2xl">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{isEditMode ? 'Edit Special Offer' : 'Add Special Offer'}</span>
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
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Offer Title</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-lg text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 shadow-sm"
                    placeholder="e.g. Weekend Tasting Menu"
                    value={newOffer.title}
                    onChange={e => setNewOffer({...newOffer, title: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Badge Text</label>
                    <input
                      type="text"
                      className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-lg text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 shadow-sm"
                      placeholder="e.g. 20% OFF or CHEF'S PICK"
                      value={newOffer.badge_text}
                      onChange={e => setNewOffer({...newOffer, badge_text: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Discounted Price ({currencySymbol})</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-lg text-slate-900 dark:text-slate-200 font-mono focus:outline-none focus:border-amber-500/50 shadow-sm"
                      placeholder="38.00"
                      value={newOffer.price}
                      onChange={e => setNewOffer({...newOffer, price: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <textarea
                    rows="3"
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-lg text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 resize-none shadow-sm"
                    placeholder="Details about what is included in this offer..."
                    value={newOffer.description}
                    onChange={e => setNewOffer({...newOffer, description: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Image URL</label>
                  <input
                    type="url"
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-lg text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 font-mono text-[11px] shadow-sm"
                    placeholder="https://images.unsplash.com/..."
                    value={newOffer.image_url}
                    onChange={e => setNewOffer({...newOffer, image_url: e.target.value})}
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newOffer.is_active}
                      onChange={e => setNewOffer({...newOffer, is_active: e.target.checked})}
                      className="rounded border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 text-amber-500 focus:ring-amber-500/30"
                    />
                    <span>Active & Visible to Customers</span>
                  </label>
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
                    {isEditMode ? 'Save Changes' : 'Create Offer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Grid of Offers */}
      {loading ? (
        <SpecialOffersSkeleton count={4} />
      ) : filteredOffers.length === 0 ? (
        <div className="glass-card p-12 rounded-xl border border-white/[0.07] text-center text-slate-500 shadow-xl">
          <Tag size={40} className="mx-auto mb-3 opacity-30 text-slate-400" />
          <p className="text-sm font-semibold text-slate-200">No special offers found</p>
          <p className="text-xs text-slate-500 mt-1">Add your first promotional offer to showcase on the menu.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOffers.map(offer => (
            <div 
              key={offer.id} 
              className="glass-card rounded-2xl border border-white/[0.07] hover:border-white/[0.15] overflow-hidden transition-all flex flex-col justify-between shadow-xl group"
            >
              <div>
                {/* Offer Image Header */}
                <div className="relative h-44 bg-slate-900 overflow-hidden">
                  <img 
                    src={offer.image_url || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600'} 
                    alt={offer.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => {
                      e.target.src = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#08090C] via-transparent to-transparent" />
                  
                  {offer.badge_text && (
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-amber-500/30">
                        {offer.badge_text}
                      </span>
                    </div>
                  )}

                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                      offer.is_active 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : 'bg-slate-800/80 text-slate-400 border border-white/10'
                    }`}>
                      {offer.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                </div>

                {/* Offer Details */}
                <div className="p-5">
                  <div className="flex justify-between items-baseline gap-2 mb-2">
                    <h3 className="font-bold text-white text-base leading-snug">{offer.title}</h3>
                    <span className="font-mono text-lg font-bold text-amber-400 tnum shrink-0">
                      {formatPrice(offer.price)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {offer.description || 'Special pricing promotion for a limited time.'}
                  </p>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 px-5 border-t border-white/[0.06] flex items-center justify-between bg-black/20">
                <span className="text-[10px] font-mono text-slate-500">
                  ID: #{offer.id}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(offer)}
                    className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-white/[0.04] rounded-lg transition-colors"
                    title="Edit Offer"
                  >
                    <Edit size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(offer.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/[0.04] rounded-lg transition-colors"
                    title="Delete Offer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SpecialOffers;
