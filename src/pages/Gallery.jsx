import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Trash2, Search, X, Image as ImageIcon, ZoomIn, RefreshCw } from 'lucide-react';
import { fetchGallery, createGalleryImage, deleteGalleryImage, API_URL } from '../services/api';
import CustomSelect from '../components/common/CustomSelect';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImagePreview, setSelectedImagePreview] = useState(null);
  const [newImage, setNewImage] = useState({
    title: '',
    image_url: '',
    description: 'Interior',
    image: null
  });

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen || selectedImagePreview) {
      document.body.classList.add('modal-open');
      return () => {
        document.body.classList.remove('modal-open');
      };
    }
  }, [isModalOpen, selectedImagePreview]);

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    try {
      const data = await fetchGallery();
      const mappedImages = data.map(img => ({
        ...img,
        image_url: img.has_image ? `${API_URL}/gallery/${img.id}/image` : img.image_url,
        title: img.alt_text || 'Gallery Image',
        description: img.category || 'General'
      }));
      setImages(mappedImages);
    } catch (error) {
      console.error('Failed to load gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setNewImage({ title: '', image_url: '', description: 'Interior', image: null });
    setIsModalOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createGalleryImage({
        alt_text: newImage.title,
        category: newImage.description,
        image_url: newImage.image_url,
        image: newImage.image
      });
      setIsModalOpen(false);
      setNewImage({ title: '', image_url: '', description: 'Interior', image: null });
      loadGallery();
    } catch (error) {
      alert('Failed to add photo');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      try {
        await deleteGalleryImage(id);
        loadGallery();
      } catch (error) {
        alert('Failed to delete photo');
      }
    }
  };

  // Derive unique categories from existing images
  const categories = ['all', ...Array.from(new Set(images.map(img => img.description).filter(Boolean)))];

  const filteredImages = images.filter(img => {
    const matchesSearch = (img.title && img.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (img.description && img.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || 
      (img.description && img.description.toLowerCase() === selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 min-w-0 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">Gallery</h1>
          <p className="text-xs text-slate-400 mt-1">Upload and organize showcase photos for your restaurant website</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-obsidian-950 font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98] text-sm"
        >
          <Plus size={18} className="stroke-[2.5]" />
          Add Photo
        </button>
      </div>

      {/* Lightbox Modal */}
      {selectedImagePreview && createPortal(
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200"
          onClick={() => setSelectedImagePreview(null)}
        >
          <div 
            className="max-w-4xl w-full bg-[#0e1117] border border-white/15 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.03] rounded-t-2xl">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
                  {selectedImagePreview.description}
                </span>
                <h3 className="font-bold text-white text-base">{selectedImagePreview.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedImagePreview(null)}
                className="p-1.5 bg-white/5 text-slate-300 hover:text-white rounded-lg hover:bg-white/15 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="w-full max-h-[65vh] bg-[#08090C] flex items-center justify-center p-2">
              <img 
                src={selectedImagePreview.image_url} 
                alt={selectedImagePreview.title}
                className="max-w-full max-h-[60vh] object-contain rounded-lg" 
              />
            </div>

            <div className="px-6 py-4 bg-[#0e1117] border-t border-white/10 flex justify-between items-center">
              <span className="text-xs text-slate-400">
                Photo ID: <span className="font-mono text-slate-300">#{selectedImagePreview.id}</span>
              </span>
              <button 
                onClick={() => {
                  const id = selectedImagePreview.id;
                  setSelectedImagePreview(null);
                  handleDelete(id);
                }}
                className="px-3.5 py-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Trash2 size={14} /> Delete Photo
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Add Photo Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/60 dark:bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-150">
          <div className="glass-card-elevated rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 w-full max-w-md overflow-hidden flex flex-col text-slate-900 dark:text-slate-100">
            <div className="p-5 border-b border-slate-200 dark:border-white/10 flex justify-between items-center shrink-0 bg-slate-50/80 dark:bg-white/[0.02] rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <ImageIcon size={16} />
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Add Gallery Photo</h2>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto max-h-[75vh] modal-scrollbar">
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">Title / Caption</label>
                  <input
                    type="text"
                    placeholder="e.g. Dining Room at Evening"
                    required
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-[#08090C] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500/50 text-xs shadow-sm transition-all"
                    value={newImage.title}
                    onChange={e => setNewImage({...newImage, title: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">Category</label>
                  <div className="flex gap-2">
                    <CustomSelect
                      value={newImage.description}
                      onChange={e => setNewImage({...newImage, description: e.target.value})}
                      options={[
                        { value: 'Interior', label: 'Interior' },
                        { value: 'Food', label: 'Food' },
                        { value: 'Drinks', label: 'Drinks' },
                        { value: 'Atmosphere', label: 'Atmosphere' },
                        { value: 'Chef', label: 'Chef' },
                        { value: 'Events', label: 'Events' }
                      ]}
                      width="w-36"
                    />
                    <input
                      type="text"
                      placeholder="Or custom category..."
                      className="flex-1 px-3.5 py-2.5 bg-white dark:bg-[#08090C] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500/50 text-xs shadow-sm transition-all"
                      value={newImage.description}
                      onChange={e => setNewImage({...newImage, description: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">Photo</label>
                  <div className="space-y-3">
                    {(newImage.image_url || newImage.image) && (
                      <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 h-32 bg-slate-100 dark:bg-[#08090C]">
                        <img 
                          src={newImage.image ? URL.createObjectURL(newImage.image) : newImage.image_url} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border file:border-slate-200 dark:file:border-white/10 file:text-xs file:font-semibold file:bg-slate-100 dark:file:bg-white/5 file:text-slate-700 dark:file:text-slate-200 hover:file:bg-slate-200 dark:hover:file:bg-white/10 transition-all cursor-pointer"
                        onChange={e => setNewImage({...newImage, image: e.target.files[0]})}
                      />
                    </div>
                    <div className="relative flex items-center py-1">
                      <div className="flex-grow border-t border-slate-200 dark:border-white/10"></div>
                      <span className="flex-shrink mx-3 text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Or Image URL</span>
                      <div className="flex-grow border-t border-slate-200 dark:border-white/10"></div>
                    </div>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-[#08090C] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500/50 text-xs shadow-sm transition-all"
                      value={newImage.image_url}
                      onChange={e => setNewImage({...newImage, image_url: e.target.value})}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                  <button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-2.5 rounded-xl transition-all shadow-md shadow-amber-500/20 active:scale-[0.98] text-xs"
                  >
                    Add Photo
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Search & Category Filter */}
      <div className="glass-card p-4 sm:p-5 border border-white/5 space-y-3.5">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search photos by title or category..."
              className="w-full pl-10 pr-9 py-2 bg-[#08090C] border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 text-xs transition-all"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 rounded transition-colors"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-white/5">
          {categories.map(cat => {
            const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  isActive
                    ? 'bg-amber-500 text-obsidian-950 shadow-md shadow-amber-500/20'
                    : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10 border border-white/5'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid View for Gallery */}
      {loading ? (
        <div className="glass-card border border-white/5 rounded-2xl text-center py-24 text-slate-400">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw size={24} className="animate-spin text-amber-500" />
            <p className="text-xs">Loading photo gallery...</p>
          </div>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="glass-card border border-white/5 rounded-2xl text-center py-16 text-slate-400">
          <ImageIcon size={36} className="mx-auto text-slate-600 mb-3" />
          <p className="text-sm font-semibold text-slate-300">
            {searchQuery || selectedCategory !== 'all' ? 'No photos match your search criteria.' : 'No gallery photos yet. Add your first photo!'}
          </p>
          <p className="text-xs text-slate-500 mt-1">Upload high-resolution photography for your restaurant</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredImages.map((img) => (
            <div 
              key={img.id} 
              className="group relative rounded-2xl overflow-hidden glass-card border border-white/5 hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 cursor-pointer bg-[#0c0e14]"
              onClick={() => setSelectedImagePreview(img)}
            >
              <div className="aspect-[4/3] bg-[#08090C] overflow-hidden">
                <img 
                  src={img.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500'} 
                  alt={img.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500';
                  }}
                />
              </div>

              {/* Ambient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#08090C] via-[#08090C]/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity pointer-events-none" />

              {/* Floating category chip */}
              <div className="absolute top-3 left-3 pointer-events-none">
                <span className="px-2.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-amber-400 border border-amber-500/20">
                  {img.description}
                </span>
              </div>

              {/* Delete button */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(img.id);
                }}
                className="absolute top-3 right-3 p-2 bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/30 rounded-xl transition-all shadow-lg backdrop-blur-md opacity-0 group-hover:opacity-100"
                title="Delete Photo"
              >
                <Trash2 size={14} />
              </button>

              {/* Bottom info */}
              <div className="absolute bottom-0 inset-x-0 p-4 flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <p className="text-slate-100 font-bold text-sm truncate">{img.title}</p>
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">#{img.id}</p>
                </div>
                <div className="p-1.5 rounded-lg bg-white/5 text-slate-400 group-hover:text-amber-400 group-hover:bg-amber-500/10 transition-colors flex-shrink-0">
                  <ZoomIn size={15} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;
