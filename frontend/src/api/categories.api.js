import api from './config';

export const getAllCategories = (params) => api.get('/api/categories', { params });
export const getCategoryById = (id) => api.get(`/api/categories/${id}`);
export const createCategory = (data) => api.post('/api/categories', data);
export const updateCategory = (id, data) => api.put(`/api/categories/${id}`, data);
export const deleteCategory = (id) => api.put(`/api/categories/${id}`);
export const reactivateCategory = (id) => api.put(`/api/categories/${id}`);
