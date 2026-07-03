import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, X } from 'lucide-react';
import { fetchGallery, createGalleryImage, deleteGalleryImage, API_URL } from '../services/api';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newImage, setNewImage] = useState({
    title: '',
    image_url: '',
    description: '', // Using description as category
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
        title: img.alt_text,
        description: img.category
      }));
      setImages(mappedImages);
    } catch (error) {
      console.error('Failed to load gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setNewImage({ title: '', image_url: '', description: '', image: null });
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
      setNewImage({ title: '', image_url: '', description: '', image: null });
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-dark">Gallery Management</h1>
        <button 
          onClick={openAddModal}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Add New Image
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-lg flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-dark">Add Gallery Image</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Interior View"
                      required
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      value={newImage.title}
                      onChange={e => setNewImage({...newImage, title: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input
                      type="text"
                      placeholder="e.g. Atmosphere"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      value={newImage.description}
                      onChange={e => setNewImage({...newImage, description: e.target.value})}
                    />
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
                        placeholder="https://..."
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        value={newImage.image_url}
                        onChange={e => setNewImage({...newImage, image_url: e.target.value})}
                      />
                    </div>
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
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search gallery..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Grid View for Gallery */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
          {images.map((img) => (
            <div key={img.id} className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="aspect-square bg-gray-100">
                <img 
                  src={img.image_url || 'https://via.placeholder.com/300?text=No+Image'} 
                  alt={img.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <p className="text-white font-medium truncate">{img.title}</p>
                <p className="text-gray-300 text-xs truncate">{img.description}</p>
                <button 
                  onClick={() => handleDelete(img.id)}
                  className="absolute top-2 right-2 p-2 bg-white/20 text-white rounded hover:bg-red-500 hover:text-white transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gallery;
