import api from './config';

export const login = (username, password) => api.post('/api/users/login', { username, password });
export const logout = () => api.post('/api/users/logout');
export const me = () => api.get('/api/users/me');
