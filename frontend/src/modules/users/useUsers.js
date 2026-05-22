import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { assignUserRole, disableUser, enableUser, registerUser } from '../../api/users.api';
import { getAllRoles } from '../../api/roles.api';
import { getAllEmployees } from '../../api/employees.api';

export const useUsers = () => {
	const queryClient = useQueryClient();

	const rolesQuery = useQuery({
		queryKey: ['user-roles'],
		queryFn: async () => (await getAllRoles()).data
	});

	const employeesQuery = useQuery({
		queryKey: ['user-employees'],
		queryFn: async () => (await getAllEmployees({ limit: 100 })).data
	});

	const create = useMutation({
		mutationFn: registerUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user-employees'] });
			toast.success('Usuario creado exitosamente');
		},
		onError: (error) => toast.error(error.response?.data?.error || error.message || 'Error al crear el usuario')
	});

	const disable = useMutation({
		mutationFn: disableUser,
		onSuccess: () => toast.success('Usuario desactivado exitosamente'),
		onError: (error) => toast.error(error.response?.data?.error || error.message || 'Error al desactivar el usuario')
	});

	const enable = useMutation({
		mutationFn: enableUser,
		onSuccess: () => toast.success('Usuario activado exitosamente'),
		onError: (error) => toast.error(error.response?.data?.error || error.message || 'Error al activar el usuario')
	});

	const updateRole = useMutation({
		mutationFn: ({ userId, role_id }) => assignUserRole(userId, role_id),
		onSuccess: () => toast.success('Rol asignado exitosamente'),
		onError: (error) => toast.error(error.response?.data?.error || error.message || 'Error al asignar el rol')
	});

	return { rolesQuery, employeesQuery, create, disable, enable, updateRole };
};
