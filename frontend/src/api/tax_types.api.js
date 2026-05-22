import api from './config';

export const getLatestTaxType = () => api.get('/api/tax-types/list');
export const createTaxType = (data) => api.post('/api/tax-types/add', data);
