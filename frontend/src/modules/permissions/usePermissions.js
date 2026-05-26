import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { getRolePermissions, updateRolePermissions } from '../../api/permissions.api';
import { getAllRoles } from '../../api/roles.api';
import { getAllModules } from '../../api/modules.api';

export const usePermissions = (roleId) => {
	const queryClient = useQueryClient();

	const rolesQuery = useQuery({
		queryKey: ['permissions-roles'],
		queryFn: async () => (await getAllRoles()).data
	});

	const modulesQuery = useQuery({
		queryKey: ['permissions-modules'],
		queryFn: async () => (await getAllModules()).data
	});

	const permissionsQuery = useQuery({
		queryKey: ['permissions-matrix', roleId],
		enabled: Boolean(roleId),
		queryFn: async () => (await getRolePermissions(roleId)).data
	});

	const save = useMutation({
		mutationFn: ({ id, permissions }) => updateRolePermissions(id, permissions),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['permissions-matrix'] });
			toast.success('Permisos actualizados exitosamente');
		},
		onError: (error) => toast.error(error.response?.data?.error || error.message || 'Error al guardar permisos')
	});

	return { rolesQuery, modulesQuery, permissionsQuery, save };
};
