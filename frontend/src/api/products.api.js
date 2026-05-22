import api from './config';

export const getAllProducts = (params) => api.get('/api/products', { params });
export const getProductById = (id) => api.get(`/api/products/${id}`);
export const createProduct = (data) => api.post('/api/products', data);
export const updateProduct = (id, data) => api.put(`/api/products/${id}`, data);
export const deleteProduct = (id) => api.put(`/api/products/${id}`);
export const updateStock = (data) => api.patch('/products/stock', data);
export const getLowStockProducts = () => api.get('/products/low-stock');
export const getInventoryHistory = () => api.get('/products/history');
