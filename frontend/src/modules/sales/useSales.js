import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { createSale, getAllSales } from '../../api/sales.api';

export const useSales = () => {
	const queryClient = useQueryClient();

	const query = useQuery({
		queryKey: ['sales'],
		queryFn: async () => (await getAllSales()).data
	});

	const create = useMutation({
		mutationFn: createSale,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['sales'] });
			toast.success('Venta registrada exitosamente');
		},
		onError: (error) => toast.error(error.response?.data?.error || error.message || 'Error al registrar la venta')
	});

	return { query, create };
};
