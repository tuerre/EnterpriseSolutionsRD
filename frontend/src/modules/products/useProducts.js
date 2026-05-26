import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { createProduct, getAllProducts, updateProduct } from '../../api/products.api';

export const useProducts = (params = {}) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['products', params],
    queryFn: async () => (await getAllProducts(params)).data
  });

  const create = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Producto creado exitosamente');
    },
    onError: (error) => toast.error(error.response?.data?.error || error.message || 'Error al crear el producto')
  });

  const update = useMutation({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Producto actualizado exitosamente');
    },
    onError: (error) => toast.error(error.response?.data?.error || error.message || 'Error al actualizar el producto')
  });

  return { query, create, update };
};
