import { useMutation } from '@tanstack/react-query';
import { client, clearAuthToken } from '../api/client';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';

export default function useLogout() {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    return useMutation({
        mutationFn: (payload) => client.post('/auth/logout', payload),
        onSuccess: async () => {
            await AsyncStorage.multiRemove(['@token', '@user']);
            clearAuthToken();   
            dispatch(logout());
            navigation.navigate('Login');
        },
        onError: (error) => {
            console.log(error.message);
            Alert.alert('Logout Failed', 'Could not log out from the server. Please check your connection and try again.');
        },
    });
}