import api from './config';

export const getAllPurchases = () => api.get('/api/purchases/list');
export const createPurchase = (data) => api.post('/api/purchases/add', data);
