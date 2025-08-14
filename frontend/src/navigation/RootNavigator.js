import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/authSlice';
import PropertyListScreen from '../screens/PropertyListScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    return (
        <Stack.Navigator initialRouteName={isAuthenticated ? 'Home' : 'Login'}>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="PropertyList" component={PropertyListScreen} />
        </Stack.Navigator>
    );
}