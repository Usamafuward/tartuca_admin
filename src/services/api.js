export const API_URL = 'http://localhost:8000/api';

export const loginAdmin = async (credentials) => {
    const formData = new FormData();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);
  
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Login failed');
      return await response.json();
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  };
  
  export const createAdmin = async (token, userData) => {
    try {
        const response = await fetch(`${API_URL}/auth/create-admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });
        if (!response.ok) throw new Error('Failed to create admin');
        return await response.json();
    } catch (error) {
        console.error('Error creating admin:', error);
        throw error;
    }
  };
  
  export const fetchAdminProfile = async (token) => {
      try {
          const response = await fetch(`${API_URL}/auth/me`, {
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });
          if (!response.ok) throw new Error('Failed to fetch profile');
          return await response.json();
      } catch (error) {
          console.error('Error fetching profile:', error);
          throw error;
      }
  };

const toFormData = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });
  return formData;
};

export const fetchMenuItems = async () => {
  try {
    const response = await fetch(`${API_URL}/menu-items`);
    if (!response.ok) throw new Error('Failed to fetch menu items');
    return await response.json();
  } catch (error) {
    console.error('Error fetching menu items:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status) => {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });
        if (!response.ok) throw new Error('Failed to update order status');
        return await response.json();
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
};

export const fetchOrders = async () => {
  try {
    const response = await fetch(`${API_URL}/orders`);
    if (!response.ok) throw new Error('Failed to fetch orders');
    return await response.json();
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const fetchReservations = async () => {
  try {
    const response = await fetch(`${API_URL}/reservations`);
    if (!response.ok) throw new Error('Failed to fetch reservations');
    return await response.json();
  } catch (error) {
    console.error('Error fetching reservations:', error);
    throw error;
  }
};

export const fetchReviews = async () => {
    try {
        // fetching admin reviews (all reviews)
      const response = await fetch(`${API_URL}/reviews/admin`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      return await response.json();
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  };

export const approveReview = async (reviewId, isApproved) => {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_URL}/reviews/${reviewId}/approve`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ is_approved: isApproved })
        });
        if (!response.ok) throw new Error('Failed to update review status');
        return await response.json();
    } catch (error) {
        console.error('Error updating review status:', error);
        throw error;
    }
};

export const fetchCategories = async () => {
  try {
    const response = await fetch(`${API_URL}/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const createMenuItem = async (itemData) => {
    try {
        const response = await fetch(`${API_URL}/menu-items`, {
            method: 'POST',
            body: toFormData(itemData)
        });
        if (!response.ok) throw new Error('Failed to create menu item');
        return await response.json();
    } catch (error) {
        console.error('Error creating menu item:', error);
        throw error;
    }
};

export const updateMenuItem = async (id, itemData) => {
    try {
        const response = await fetch(`${API_URL}/menu-items/${id}`, {
            method: 'PUT',
            body: toFormData(itemData)
        });
        if (!response.ok) throw new Error('Failed to update menu item');
        return await response.json();
    } catch (error) {
        console.error('Error updating menu item:', error);
        throw error;
    }
};

export const deleteMenuItem = async (id) => {
    try {
        const response = await fetch(`${API_URL}/menu-items/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete menu item');
        return await response.json();
    } catch (error) {
        console.error('Error deleting menu item:', error);
        throw error;
    }
};

export const fetchSpecialOffers = async () => {
    try {
        const response = await fetch(`${API_URL}/special-offers/`);
        if (!response.ok) throw new Error('Failed to fetch special offers');
        return await response.json();
    } catch (error) {
        console.error('Error fetching special offers:', error);
        throw error;
    }
};

export const createSpecialOffer = async (offerData) => {
    try {
        const response = await fetch(`${API_URL}/special-offers/`, {
            method: 'POST',
            body: toFormData(offerData)
        });
        if (!response.ok) throw new Error('Failed to create special offer');
        return await response.json();
    } catch (error) {
        console.error('Error creating special offer:', error);
        throw error;
    }
};

export const deleteSpecialOffer = async (id) => {
    try {
        const response = await fetch(`${API_URL}/special-offers/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete special offer');
        return await response.json();
    } catch (error) {
        console.error('Error deleting special offer:', error);
        throw error;
    }
};

export const fetchGallery = async () => {
    try {
        const response = await fetch(`${API_URL}/gallery/`);
        if (!response.ok) throw new Error('Failed to fetch gallery');
        return await response.json();
    } catch (error) {
        console.error('Error fetching gallery:', error);
        throw error;
    }
};

export const createGalleryImage = async (imageData) => {
    try {
        const response = await fetch(`${API_URL}/gallery/`, {
            method: 'POST',
            body: toFormData(imageData)
        });
        if (!response.ok) throw new Error('Failed to create gallery image');
        return await response.json();
    } catch (error) {
        console.error('Error creating gallery image:', error);
        throw error;
    }
};

export const deleteGalleryImage = async (id) => {
    try {
        const response = await fetch(`${API_URL}/gallery/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete gallery image');
        return await response.json();
    } catch (error) {
        console.error('Error deleting gallery image:', error);
        throw error;
    }
};

export const updateSpecialOffer = async (id, offerData) => {
    try {
        const response = await fetch(`${API_URL}/special-offers/${id}`, {
            method: 'PUT',
            body: toFormData(offerData)
        });
        if (!response.ok) throw new Error('Failed to update special offer');
        return await response.json();
    } catch (error) {
        console.error('Error updating special offer:', error);
        throw error;
    }
};

