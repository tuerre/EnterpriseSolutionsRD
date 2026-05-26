import api from './config';

export const getSystemMovements = () => api.get('/api/system-movements/list');
