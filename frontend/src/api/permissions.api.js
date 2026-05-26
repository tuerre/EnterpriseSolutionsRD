import api from './config';
import { getAllRoles } from './roles.api';

export { getAllRoles as getRoles };
export const getRole = (roleId) => api.get(`/api/users/roles/${roleId}`);
export const getRolePermissions = (roleId) => api.get(`/api/users/roles/${roleId}/permissions`);
export const updateRolePermissions = (roleId, permissions) => api.put(`/api/users/roles/${roleId}/permissions`, { permissions });
export const updateUserRole = (userId, role_id) => api.put(`/api/users/users/${userId}/role`, { role_id });
