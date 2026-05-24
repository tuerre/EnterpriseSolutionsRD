import api from './config';

export const registerUser = (data) => api.post('/api/users/register', data);
export const getAllUsers = () => api.get('/api/users');
export const disableUser = (userId) => api.put(`/api/users/${userId}/disable`);
export const enableUser = (userId) => api.put(`/api/users/${userId}/enable`);
export const getCurrentUser = () => api.get('/api/users/me');
export const assignUserRole = (userId, role_id) => api.put(`/api/users/users/${userId}/role`, { role_id });
