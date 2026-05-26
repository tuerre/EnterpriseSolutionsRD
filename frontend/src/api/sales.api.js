import api from './config';

export const getAllSales = () => api.get('/api/sales/list');
export const createSale = (data) => api.post('/api/sales/add', data);
