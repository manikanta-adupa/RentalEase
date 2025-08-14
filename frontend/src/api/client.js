import axios from 'axios';
import { API_BASE_URL } from '../config/api';

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

const registerOnUnauthorized = (callback) => {
    client.interceptors.response.use(response => response, error =>{
        if (error?.response?.status === 401) {
            callback?.();
        }
        return Promise.reject(error);
    })
}

export { client, setAuthToken, clearAuthToken, registerOnUnauthorized };