import { useQuery } from '@tanstack/react-query';
import { getSystemMovements } from '../../api/system_movements.api';

export const useMovements = () => {
	const query = useQuery({
		queryKey: ['movements'],
		queryFn: async () => (await getSystemMovements()).data
	});

	return { query };
};
