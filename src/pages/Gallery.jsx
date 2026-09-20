import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, X } from 'lucide-react';
import { fetchGallery, createGalleryImage, deleteGalleryImage, API_URL } from '../services/api';

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
      alert('Failed to add image');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await deleteGalleryImage(id);
        loadGallery();
      } catch (error) {
        alert('Failed to delete image');
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark">Gallery Management</h1>
          <p className="text-sm text-gray-500 mt-1">Upload and organize showcase photos for your restaurant website</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium shadow-sm"
        >
          <Plus size={20} />
          Add New Image
        </button>
      </div>

      {/* Image Preview Modal */}
      {selectedImagePreview && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedImagePreview(null)}
        >
          <div className="max-w-3xl max-h-[85vh] bg-white rounded-2xl overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedImagePreview(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/80 transition-colors"
            >
              <X size={20} />
            </button>
            <img 
              src={selectedImagePreview.image_url} 
              alt={selectedImagePreview.title}
              className="w-full max-h-[70vh] object-contain bg-black" 
            />
            <div className="p-4 bg-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-dark text-lg">{selectedImagePreview.title}</h3>
                <span className="text-sm text-primary font-medium">{selectedImagePreview.description}</span>
              </div>
              <button 
                onClick={() => {
                  const id = selectedImagePreview.id;
                  setSelectedImagePreview(null);
                  handleDelete(id);
                }}
                className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-dark">Add Gallery Image</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title / Caption</label>
                  <input
                    type="text"
                    placeholder="e.g. Elegant Dining Room"
                    required
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={newImage.title}
                    onChange={e => setNewImage({...newImage, title: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <div className="flex gap-2">
                    <select
                      className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={newImage.description}
                      onChange={e => setNewImage({...newImage, description: e.target.value})}
                    >
                      <option value="Interior">Interior</option>
                      <option value="Food">Food</option>
                      <option value="Drinks">Drinks</option>
                      <option value="Atmosphere">Atmosphere</option>
                      <option value="Chef">Chef</option>
                      <option value="Events">Events</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Or custom category..."
                      className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
                      value={newImage.description}
                      onChange={e => setNewImage({...newImage, description: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                  <div className="space-y-3">
                    {(newImage.image_url || newImage.image) && (
                      <div className="mb-2">
                        <img 
                          src={newImage.image ? URL.createObjectURL(newImage.image) : newImage.image_url} 
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
                          onChange={e => setNewImage({...newImage, image: e.target.files[0]})}
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
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      value={newImage.image_url}
                      onChange={e => setNewImage({...newImage, image_url: e.target.value})}
                    />
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-gray-100">
                  <button type="submit" className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 active:scale-[0.98]">
                    Add Image
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search gallery by title or category..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid View for Gallery */}
        {loading ? (
          <div className="text-center py-16 text-gray-500">Loading gallery photos...</div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            {searchQuery || selectedCategory !== 'all' ? 'No images match your search criteria.' : 'No gallery photos yet. Add your first photo!'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
            {filteredImages.map((img) => (
              <div 
                key={img.id} 
                className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer bg-gray-100 border border-gray-200"
                onClick={() => setSelectedImagePreview(img)}
              >
                <div className="aspect-square bg-gray-100">
                  <img 
                    src={img.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500'} 
                    alt={img.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500';
                    }}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <p className="text-white font-semibold truncate drop-shadow-sm">{img.title}</p>
                  <p className="text-primary-light text-xs truncate uppercase tracking-wider font-bold">{img.description}</p>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(img.id);
                    }}
                    className="absolute top-3 right-3 p-2 bg-red-600/80 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                    title="Delete Image"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
