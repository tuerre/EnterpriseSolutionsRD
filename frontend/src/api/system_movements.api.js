import api from './config';

export const getInventoryHistory = () => api.get('/products/history');
export const getSystemMovements = () => api.get('/products/history');
