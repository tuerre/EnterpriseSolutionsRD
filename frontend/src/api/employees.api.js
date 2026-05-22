import api from './config';

export const getAllEmployees = (params) => api.get('/api/employees', { params });
export const getEmployeeById = (id) => api.get(`/api/employees/${id}`);
export const createEmployee = (data) => api.post('/api/employees', data);
export const updateEmployee = (id, data) => api.put(`/api/employees/${id}`, data);
export const deleteEmployee = (id) => api.put(`/api/employees/delete/${id}`);
export const reactivateEmployee = (id) => api.put(`/api/employees/reactivate/${id}`);
