import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './src/navigation/RootNavigator';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import store from './src/store';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginSuccess, logout, bootstrapDone, selectAuth } from './src/store/authSlice';
import { setAuthToken, clearAuthToken, registerOnUnauthorized, setRefreshToken, refreshResetToken } from './src/api/client';
import { View, Text, Linking } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const useAppDispatch = () => useDispatch();
const useAppSelector = useSelector;

const queryClient = new QueryClient();

// Simple deep linking configuration for React Navigation
const linking = {
  prefixes: ['rentalease://'],
  config: {
    screens: {
      ResetPassword: {
        path: '/reset-password',
        parse: {
          token: (token) => token,
        },
      },
      Login: 'login',
      Home: 'home',
      PropertyList: 'properties', 
      ForgotPassword: 'forgot-password',
    },
  },
};

function AppShell(){
  const dispatch = useAppDispatch();
  const {bootstrapped} = useAppSelector(selectAuth);
  useEffect(() =>{
    registerOnUnauthorized(async () => {
      // Clear everything and logout
      clearAuthToken();
      dispatch(logout());
      await AsyncStorage.multiRemove(['@token', '@user', '@refreshToken']);
      refreshResetToken();
    });
  }, [dispatch]);

  useEffect(() =>{
    (async () => {
      const entries = await AsyncStorage.multiGet(['@token', '@user', '@refreshToken']);
      const map= Object.fromEntries(entries);
      const token = map['@token'];
      const user = map['@user'];
      const refreshToken = map['@refreshToken'];
      if(token && refreshToken){
        setAuthToken(token);
        setRefreshToken(refreshToken);
        dispatch(loginSuccess({user: user ? JSON.parse(user) : null, token, refreshToken}));
      }
      dispatch(bootstrapDone());
    })();
  }, [dispatch]);

  if(!bootstrapped) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer linking={linking}> 
          <RootNavigator />
        </NavigationContainer>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppShell />
    </Provider>
  );
}




