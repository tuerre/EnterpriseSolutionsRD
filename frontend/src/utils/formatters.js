import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatCurrency = (amount) =>
  new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(Number(amount || 0));

export const formatDate = (date) =>
  date ? format(new Date(date), 'dd/MM/yyyy', { locale: es }) : '—';

export const formatDateTime = (date) =>
  date ? format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: es }) : '—';

export const formatPercentage = (value) => `${parseFloat(value || 0).toFixed(2)}%`;

export const formatNumber = (value) => new Intl.NumberFormat('es-DO').format(Number(value || 0));
