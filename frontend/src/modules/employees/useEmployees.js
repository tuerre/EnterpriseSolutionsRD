import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { createEmployee, deleteEmployee, getAllEmployees, reactivateEmployee, updateEmployee } from '../../api/employees.api';

export const useEmployees = (params = {}) => {
	const queryClient = useQueryClient();

	const query = useQuery({
		queryKey: ['employees', params],
		queryFn: async () => (await getAllEmployees(params)).data
	});

	const create = useMutation({
		mutationFn: createEmployee,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['employees'] });
			toast.success('Empleado creado exitosamente');
		},
		onError: (error) => toast.error(error.response?.data?.error || error.message || 'Error al crear el empleado')
	});

	const update = useMutation({
		mutationFn: ({ id, data }) => updateEmployee(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['employees'] });
			toast.success('Empleado actualizado exitosamente');
		},
		onError: (error) => toast.error(error.response?.data?.error || error.message || 'Error al actualizar el empleado')
	});

	const remove = useMutation({
		mutationFn: deleteEmployee,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['employees'] });
			toast.success('Empleado desactivado exitosamente');
		},
		onError: (error) => toast.error(error.response?.data?.error || error.message || 'Error al desactivar el empleado')
	});

	const reactivate = useMutation({
		mutationFn: reactivateEmployee,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['employees'] });
			toast.success('Empleado activado exitosamente');
		},
		onError: (error) => toast.error(error.response?.data?.error || error.message || 'Error al activar el empleado')
	});

	return { query, create, update, remove, reactivate };
};
