import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create axios instance

const client = axios.create({
    baseURL: API_BASE_URL,
});

const setAuthToken = (token) => {
    if (token) {
        client.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
}

const clearAuthToken = () => {
    delete client.defaults.headers.common.Authorization;
}

const setRefreshToken = (refreshToken) => {
    if (refreshToken) {
        client.defaults.headers.common['x-refresh-token'] = refreshToken;
    }
}

const refreshResetToken = () => {
    client.defaults.headers.common['x-refresh-token'] = null;
}

const registerOnUnauthorized = (callback) => {
    client.interceptors.response.use(response => response, async error => {
        if (error?.response?.status === 401) {
            // Try to refresh token first
            try {
                const refreshToken = await AsyncStorage.getItem('@refreshToken');
                if (refreshToken) {
                    const response = await client.post('/auth/refresh-token', { refreshToken });
                    if (response.data.success) {
                        // Store new token
                        await AsyncStorage.setItem('@token', response.data.token);
                        setAuthToken(response.data.token);
                        
                        // Retry original request
                        const originalRequest = error.config;
                        originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
                        return client(originalRequest);
                    }
                }
            } catch (refreshError) {
                console.log('Token refresh failed:', refreshError);
            }
            
            // If refresh fails, call the callback (logout)
            callback?.();
        }
        return Promise.reject(error);
    })
}

export { client, setAuthToken, clearAuthToken, registerOnUnauthorized, setRefreshToken, refreshResetToken };