import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { createPurchase, getAllPurchases } from '../../api/purchases.api';

export const usePurchases = () => {
	const queryClient = useQueryClient();

	const query = useQuery({
		queryKey: ['purchases'],
		queryFn: async () => (await getAllPurchases()).data
	});

	const create = useMutation({
		mutationFn: createPurchase,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['purchases'] });
			toast.success('Compra registrada exitosamente');
		},
		onError: (error) => toast.error(error.response?.data?.error || error.message || 'Error al registrar la compra')
	});

	return { query, create };
};
