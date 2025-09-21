import { useQuery } from '@tanstack/react-query';
import {client} from '../api/client';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/authSlice';

//useProperties hook to fetch properties from the API
export default function useProperties() {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    return useQuery({
        queryKey: ['properties'],
        queryFn: () => client.get('/properties').then(res => res.data),
        select: (data) => ({
            properties: data.properties || [],
            pagination: data.pagination || {},
            success: data.success,
        }),
        //options   
        staleTime: 5 * 60 * 1000,
        gcTime: 20 * 60 * 1000,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        retry: 3,
        retryDelay: 1000,
        enabled: isAuthenticated,
    });
}