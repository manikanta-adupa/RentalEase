import { useQuery } from '@tanstack/react-query';
import {API_ROOT} from '../config/api';

export default function useHealthCheck() {
    return useQuery({
        queryKey: ['healthCheck'],
        queryFn: () => fetch(`${API_ROOT}/health`).then(res => res.json()),   
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        staleTime: 1000 * 60 * 5,
    });
}