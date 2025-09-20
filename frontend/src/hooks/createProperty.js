import { useMutation } from '@tanstack/react-query';
import { client } from '../api/client';
import { useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/authSlice';

export default function useCreateProperty() {
    const queryClient = useQueryClient();
    const isAuthenticated = useSelector(selectIsAuthenticated);

    return useMutation({
        mutationFn: (property) => {
            return client.post('/properties', property).then(res => res.data);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        },
        onError: (error) => {
            console.error('Property creation error:', error.response?.status, error.response?.data);
        },
    });
}   