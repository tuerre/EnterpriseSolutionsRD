import api from './config';

export const getAllDepartments = (params) => api.get('/api/departments', { params });
export const getDepartmentById = (id) => api.get(`/api/departments/${id}`);
export const createDepartment = (data) => api.post('/api/departments', data);
export const updateDepartment = (id, data) => api.put(`/api/departments/${id}`, data);
export const deleteDepartment = (id) => api.put(`/api/departments/delete/${id}`);
export const reactivateDepartment = (id) => api.put(`/api/departments/reactivate/${id}`);
