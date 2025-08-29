import { useMutation } from '@tanstack/react-query';
import { client } from '../api/client';
import { useQueryClient } from '@tanstack/react-query';

export default function useCreateProperty() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (property) => client.post('/properties', property).then(res => res.data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        },
        onError: (error) => {
        },
    });
}   