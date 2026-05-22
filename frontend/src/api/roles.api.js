import api from './config';

export const getAllRoles = () => api.get('/api/users/roles');
export const getRoleById = (id) => api.get(`/api/users/roles/${id}`);
export const createRole = (data) => api.post('/api/users/roles', data);
export const updateRole = (id, data) => api.put(`/api/users/roles/${id}`, data);
