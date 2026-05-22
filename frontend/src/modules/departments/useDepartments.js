import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { createDepartment, deleteDepartment, getAllDepartments, reactivateDepartment, updateDepartment } from '../../api/departments.api';

export const useDepartments = (params = {}) => {
	const queryClient = useQueryClient();

	const query = useQuery({
		queryKey: ['departments', params],
		queryFn: async () => (await getAllDepartments(params)).data
	});

	const create = useMutation({
		mutationFn: createDepartment,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['departments'] });
			toast.success('Departamento creado exitosamente');
		},
		onError: (error) => toast.error(error.response?.data?.error || error.message || 'Error al crear el departamento')
	});

	const update = useMutation({
		mutationFn: ({ id, data }) => updateDepartment(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['departments'] });
			toast.success('Departamento actualizado exitosamente');
		},
		onError: (error) => toast.error(error.response?.data?.error || error.message || 'Error al actualizar el departamento')
	});

	const remove = useMutation({
		mutationFn: deleteDepartment,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['departments'] });
			toast.success('Departamento desactivado exitosamente');
		},
		onError: (error) => toast.error(error.response?.data?.error || error.message || 'Error al desactivar el departamento')
	});

	const reactivate = useMutation({
		mutationFn: reactivateDepartment,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['departments'] });
			toast.success('Departamento activado exitosamente');
		},
		onError: (error) => toast.error(error.response?.data?.error || error.message || 'Error al activar el departamento')
	});

	return { query, create, update, remove, reactivate };
};
