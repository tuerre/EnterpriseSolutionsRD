import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { createSupplier, getAllSuppliers, updateSupplier } from '../../api/suppliers.api';

export const useSuppliers = (params = {}) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['suppliers', params],
    queryFn: async () => (await getAllSuppliers(params)).data
  });

  const create = useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Proveedor creado exitosamente');
    },
    onError: (error) => toast.error(error.response?.data?.error || error.message || 'Error al crear el proveedor')
  });

  const update = useMutation({
    mutationFn: ({ id, data }) => updateSupplier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Proveedor actualizado exitosamente');
    },
    onError: (error) => toast.error(error.response?.data?.error || error.message || 'Error al actualizar el proveedor')
  });

  return { query, create, update };
};
