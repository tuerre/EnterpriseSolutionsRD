import api from './config';

export const getRoles = () => api.get('/api/users/roles');
export const getRole = (roleId) => api.get(`/api/users/roles/${roleId}`);
export const getRolePermissions = (roleId) => api.get(`/api/users/roles/${roleId}/permissions`);
export const updateRolePermissions = (roleId, permissions) => api.put(`/api/users/roles/${roleId}/permissions`, { permissions });
export const updateUserRole = (userId, role_id) => api.put(`/api/users/users/${userId}/role`, { role_id });
