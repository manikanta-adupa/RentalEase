import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/authSlice';
import PropertyListScreen from '../screens/PropertyListScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import RegisterScreen from '../screens/RegisterScreen';
import AddPropertyScreen from '../screens/AddPropertyScreen';
import PropertyDetailScreen from '../screens/PropertyDetailScreen';
import MyProfileScreen from '../screens/MyProfileScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    return (
        <Stack.Navigator initialRouteName={isAuthenticated ? 'Home' : 'Login'}>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="PropertyList" component={PropertyListScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} /> 
            <Stack.Screen name="AddProperty" component={AddPropertyScreen} />
            <Stack.Screen name="MyProfile" component={MyProfileScreen} />
            <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
        </Stack.Navigator>
    );
}