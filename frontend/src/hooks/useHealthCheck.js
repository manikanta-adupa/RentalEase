import { useQuery } from '@tanstack/react-query';
import {API_ROOT} from '../config/api';

export default function useHealthCheck() {
    return useQuery({
        queryKey: ['healthCheck'],
        queryFn: async () => {
            console.log('🏥 Health check - calling:', `${API_ROOT}/health`);
            try {
                const response = await fetch(`${API_ROOT}/health`);
                console.log('🏥 Health check - response status:', response.status);
                console.log('🏥 Health check - response ok:', response.ok);
                
                const data = await response.json();
                console.log('🏥 Health check - response data:', data);
                console.log('🏥 Health check - data.success:', data.success);
                
                return data;
            } catch (error) {
                console.error('🏥 Health check - error:', error);
                throw error;
            }
        },
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        staleTime: 1000 * 60 * 5,
    });
}