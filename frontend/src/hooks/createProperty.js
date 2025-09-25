import { useMutation } from '@tanstack/react-query';
import { client } from '../api/client';
import { useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/authSlice';

export default function useCreateProperty() {
    const queryClient = useQueryClient();
    // const isAuthenticated = useSelector(selectIsAuthenticated);?

    return useMutation({
        mutationFn: async (property) => {
            console.log('🚀 Creating property with data type:', typeof property);
            console.log('🚀 Is FormData?', property instanceof FormData);
            console.log('🔗 Making request to:', client.defaults.baseURL + '/properties');
            console.log('🔐 Auth header:', client.defaults.headers.common.Authorization ? 'Present' : 'Missing');
            
            // Log FormData contents if it's FormData
            if (property instanceof FormData) {
                console.log('📋 FormData contents:');
                for (let [key, value] of property.entries()) {
                    if (typeof value === 'object' && value.uri) {
                        console.log(`${key}: [File] ${value.name || 'unnamed'}`);
                    } else {
                        console.log(`${key}: ${value}`);
                    }
                }
            }
            
            try {
                // Set the content type for FormData
                const config = {};
                if (property instanceof FormData) {
                    config.headers = {
                        'Content-Type': 'multipart/form-data',
                    };
                }
                
                const response = await client.post('/properties', property, config);
                console.log('✅ Property creation successful:', response.data);
                return response.data;
            } catch (error) {
                console.error('❌ Property creation failed:');
                console.error('Error type:', error.name);
                console.error('Error message:', error.message);
                console.error('Network error code:', error.code);
                
                if (error.response) {
                    console.error('Response status:', error.response.status);
                    console.error('Response headers:', error.response.headers);
                    console.error('Response data:', error.response.data);
                } else if (error.request) {
                    console.error('No response received. Request details:');
                    console.error('Request URL:', error.config?.url);
                    console.error('Request method:', error.config?.method);
                    console.error('Request timeout:', error.config?.timeout);
                } else {
                    console.error('Request setup error:', error.message);
                }
                throw error;
            }
        },
        onSuccess: (data) => {
            console.log('🎉 Property created successfully, invalidating queries');
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        },
        onError: (error) => {
            console.error('🔥 Mutation error callback:', error);
        },
    });
}   