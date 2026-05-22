import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { createCategory, getAllCategories, updateCategory } from '../../api/categories.api';

export const useCategories = (params = {}) => {
	const queryClient = useQueryClient();

	const query = useQuery({
		queryKey: ['categories', params],
		queryFn: async () => (await getAllCategories(params)).data
	});

	const create = useMutation({
		mutationFn: createCategory,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['categories'] });
			toast.success('Categoría creada exitosamente');
		},
		onError: (error) => toast.error(error.response?.data?.error || error.message || 'Error al crear la categoría')
	});

	const update = useMutation({
		mutationFn: ({ id, data }) => updateCategory(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['categories'] });
			toast.success('Categoría actualizada exitosamente');
		},
		onError: (error) => toast.error(error.response?.data?.error || error.message || 'Error al actualizar la categoría')
	});

	return { query, create, update };
};
