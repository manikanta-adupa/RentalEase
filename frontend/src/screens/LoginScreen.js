import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView, StatusBar, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../store/authSlice';
import { client, setAuthToken } from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { selectAuth } from '../store/authSlice';
import { colors, typography, spacing, layout } from '../styles';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const dispatch = useDispatch();
    const navigation = useNavigation();
    const { status, error } = useSelector(selectAuth);
    const isLoading = status === 'loading';

    const handleLogin = async () => {
        console.log('=== LOGIN DEBUG START ===');
        console.log('Email:', email);
        console.log('Password length:', password.length);
        console.log('Password (first 3 chars):', password.substring(0, 3) + '***');
        console.log('API URL:', client.defaults.baseURL);
        console.log('Client config:', {
            baseURL: client.defaults.baseURL,
            timeout: client.defaults.timeout,
            headers: client.defaults.headers
        });
        
        dispatch(loginStart());
        try {
            console.log('Making API call to /auth/login...');
            console.log('Request payload:', { email, password: '***' });
            
            const res = await client.post('/auth/login', { email, password });
            console.log('=== API RESPONSE SUCCESS ===');
            console.log('Response status:', res.status);
            console.log('Response data:', res.data);
            console.log('Response headers:', res.headers);
            
            const { token, user } = res.data;
            console.log('Token present:', !!token);
            console.log('Token length:', token ? token.length : 0);
            console.log('User data:', user);
            
            console.log('Saving to AsyncStorage...');
            await AsyncStorage.multiSet([
                ['@token', token],
                ['@user', JSON.stringify(user)]
            ]);
            console.log('AsyncStorage save completed');
            
            console.log('Setting auth token...');
            setAuthToken(token);
            console.log('Auth token set');
            
            console.log('Dispatching login success...');
            dispatch(loginSuccess({ user, token }));
            console.log('Login success dispatched');
            
            console.log('Navigating to Home...');
            navigation.navigate('Home');
            console.log('Navigation completed');
            console.log('=== LOGIN SUCCESS COMPLETE ===');
        } catch (error) {
            console.log('=== LOGIN ERROR ===');
            console.log('Error object:', error);
            console.log('Error name:', error.name);
            console.log('Error message:', error.message);
            console.log('Error stack:', error.stack);
            
            if (error.response) {
                console.log('Error response status:', error.response.status);
                console.log('Error response data:', error.response.data);
                console.log('Error response headers:', error.response.headers);
            } else if (error.request) {
                console.log('Error request:', error.request);
                console.log('No response received');
            } else {
                console.log('Error setting up request:', error.message);
            }
            
            const message = error?.response?.data?.message || "Login failed";
            console.log('Final error message:', message);
            
            dispatch(loginFailure(message));
            Alert.alert('Login failed', message);
            console.log('=== LOGIN ERROR HANDLED ===');
        }
    }

    const isFormValid = email.trim() && password.trim() && !isLoading;

    return (
        <SafeAreaView style={layout.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} />
            
            <KeyboardAvoidingView 
                style={layout.flex1} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView 
                    style={layout.scrollContainer} 
                    contentContainerStyle={layout.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header Section */}
                    <View style={[layout.headerCentered, { paddingTop: spacing['3xl'] }]}>
                        <Text style={{ fontSize: typography.fontSize['5xl'], marginBottom: spacing.md }}>🏠</Text>
                        <Text style={[typography.textStyles.h1, { color: colors.text.inverse, textAlign: 'center' }]}>
                            Welcome Back
                        </Text>
                        <Text style={[typography.textStyles.body, { 
                            color: colors.primary.light, 
                            textAlign: 'center',
                            opacity: 0.9,
                            marginTop: spacing.xs 
                        }]}>
                            Sign in to access your RentalEase account
                        </Text>
                    </View>

                    {/* Login Form */}
                    <View style={layout.formContainer}>
                        <View style={layout.cardLarge}>
                            <Text style={[typography.textStyles.h3, { textAlign: 'center', marginBottom: spacing['2xl'] }]}>
                                Login to Continue
                            </Text>

                            {/* Email Input */}
                            <View style={layout.inputGroup}>
                                <Text style={typography.textStyles.label}>
                                    Email Address
                                </Text>
                                <TextInput
                                    placeholder="Enter your email"
                                    placeholderTextColor={colors.text.tertiary}
                                    value={email}
                                    onChangeText={setEmail}
                                    onFocus={() => setEmailFocused(true)}
                                    onBlur={() => setEmailFocused(false)}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    style={[
                                        layout.input,
                                        emailFocused && layout.inputFocused
                                    ]}
                                />
                            </View>

                            {/* Password Input */}
                            <View style={layout.inputGroup}>
                                <Text style={typography.textStyles.label}>
                                    Password
                                </Text>
                                <View style={layout.inputContainer}>
                                    <TextInput
                                        placeholder="Enter your password"
                                        placeholderTextColor={colors.text.tertiary}
                                        secureTextEntry={!showPassword}
                                        value={password}
                                        onChangeText={setPassword}
                                        onFocus={() => setPasswordFocused(true)}
                                        onBlur={() => setPasswordFocused(false)}
                                        style={[
                                            layout.input,
                                            layout.inputWithIcon,
                                            passwordFocused && layout.inputFocused
                                        ]}
                                    />
                                    <TouchableOpacity
                                        style={layout.iconButton}
                                        onPress={() => setShowPassword(!showPassword)}
                                        activeOpacity={0.6}
                                    >
                                        <Text style={[typography.textStyles.body, { color: colors.text.secondary }]}>
                                            {showPassword ? '👀' : '👁️‍🗨️'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Error Message */}
                            {error && (
                                <View style={layout.errorContainer}>
                                    <Text style={typography.textStyles.error}>
                                        {error}
                                    </Text>
                                </View>
                            )}

                            {/* Login Button */}
                            <TouchableOpacity
                                style={[
                                    isFormValid ? layout.buttonPrimary : layout.buttonDisabled,
                                    { marginBottom: spacing.lg }
                                ]}
                                onPress={handleLogin}
                                disabled={!isFormValid}
                                activeOpacity={0.8}
                            >
                                {isLoading ? (
                                    <View style={layout.row}>
                                        <ActivityIndicator size="small" color={colors.text.inverse} />
                                        <Text style={[typography.textStyles.button, { 
                                            color: colors.text.inverse, 
                                            marginLeft: spacing.xs 
                                        }]}>
                                            Signing In...
                                        </Text>
                                    </View>
                                ) : (
                                    <Text style={[typography.textStyles.button, { 
                                        color: isFormValid ? colors.text.inverse : colors.text.secondary
                                    }]}>
                                        Sign In
                                    </Text>
                                )}
                            </TouchableOpacity>

                            {/* Forgot Password Link */}
                            <TouchableOpacity
                                style={{ alignItems: 'center' }}
                                onPress={() => {
                                    navigation.navigate('ForgotPassword');
                                }}
                            >
                                <Text style={typography.textStyles.link}>
                                    Forgot your password?
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Register Link */}
                        <View style={layout.card}>
                            <Text style={[typography.textStyles.bodySmall, { 
                                color: colors.text.secondary, 
                                marginBottom: spacing.xs,
                                textAlign: 'center'
                            }]}>
                                Don't have an account?
                            </Text>
                            <TouchableOpacity
                                style={{ alignItems: 'center' }}
                                onPress={() => {
                                    Alert.alert('Registration', 'Registration feature will be available soon!');
                                }}
                            >
                                <Text style={[typography.textStyles.body, { 
                                    color: colors.primary.main,
                                    fontWeight: typography.fontWeight.semibold
                                }]}>
                                    Create Account
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Bottom Spacer */}
                        <View style={{ height: spacing['2xl'] }} />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}