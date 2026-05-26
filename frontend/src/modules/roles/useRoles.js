import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { createRole, getAllRoles, updateRole } from '../../api/roles.api';

export const useRoles = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['roles'],
    queryFn: async () => (await getAllRoles()).data
  });

  const create = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Rol creado exitosamente');
    },
    onError: (error) => toast.error(error.response?.data?.error || error.message || 'Error al crear el rol')
  });

  const update = useMutation({
    mutationFn: ({ id, data }) => updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Rol actualizado exitosamente');
    },
    onError: (error) => toast.error(error.response?.data?.error || error.message || 'Error al actualizar el rol')
  });

  return { query, create, update };
};
