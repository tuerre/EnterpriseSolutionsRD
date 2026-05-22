import { useQuery } from '@tanstack/react-query';
import { getInventoryHistory } from '../../api/system_movements.api';

export const useMovements = () => {
	const query = useQuery({
		queryKey: ['movements'],
		queryFn: async () => (await getInventoryHistory()).data
	});

	return { query };
};
