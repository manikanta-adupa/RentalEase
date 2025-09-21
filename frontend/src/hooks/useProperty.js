import { useQuery } from '@tanstack/react-query';
import { client } from '../api/client';

const fetchPropertyById = async (id) => {
    const res = await client.get(`/properties/${id}`);
    return res.data;
}

export default function useProperty(id) {
    return useQuery({
        queryKey: ['property', id],
        queryFn: () => fetchPropertyById(id),
        enabled: !!id,
    });
}