import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { createTaxType, getLatestTaxType } from '../../api/tax_types.api';

export const useTaxTypes = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['tax-types'],
    queryFn: async () => (await getLatestTaxType()).data
  });

  const create = useMutation({
    mutationFn: createTaxType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-types'] });
      toast.success('Tipo de impuesto actualizado exitosamente');
    },
    onError: (error) => toast.error(error.response?.data?.error || error.message || 'Error al guardar el impuesto')
  });

  return { query, create };
};
