import { useMutation } from '@tanstack/react-query';
import { client } from '../api/client';
import { useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/authSlice';

export default function useCreateProperty() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (property) => {
            // Set the content type for FormData
            const config = {};
            if (property instanceof FormData) {
                config.headers = {
                    'Content-Type': 'multipart/form-data',
                };
            }
            
            const response = await client.post('/properties', property, config);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        },
        onError: (error) => {
            console.error('Property creation error:', error.response?.status, error.response?.data);
        },
    });
}   