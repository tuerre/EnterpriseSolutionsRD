import api from './config';

export const getAllSuppliers = (params) => api.get('/api/suppliers', { params });
export const getSupplierById = (id) => api.get(`/api/suppliers/${id}`);
export const createSupplier = (data) => api.post('/api/suppliers', data);
export const updateSupplier = (id, data) => api.put(`/api/suppliers/${id}`, data);
export const deleteSupplier = (id) => api.put(`/api/suppliers/${id}`);
export const reactivateSupplier = (id) => api.put(`/api/suppliers/${id}`);
