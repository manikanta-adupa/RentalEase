import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView, StatusBar, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { client } from '../api/client';
import { colors, typography, spacing, layout } from '../styles';

export default function ResetPasswordScreen() {
    const [token, setToken] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
    const [tokenFocused, setTokenFocused] = useState(false);

    const navigation = useNavigation();
    const route = useRoute();

    // Extract token from deep link or route params
    useEffect(() => {
        if (route.params?.token) {
            setToken(route.params.token);
            console.log('Token received from deep link:', route.params.token.substring(0, 8) + '...');
        }
    }, [route.params]);

    const validateInputs = () => {
        if (!token.trim()) {
            Alert.alert('Error', 'Please enter your reset token');
            return false;
        }

        if (!password) {
            Alert.alert('Error', 'Please enter your new password');
            return false;
        }

        if (password.length < 8) {
            Alert.alert('Error', 'Password must be at least 8 characters long');
            return false;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return false;
        }

        // Password strength validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
        if (!passwordRegex.test(password)) {
            Alert.alert('Error', 'Password must contain at least one uppercase letter, one lowercase letter, and one number');
            return false;
        }

        return true;
    };

    const handleResetPassword = async () => {
        console.log('=== RESET PASSWORD DEBUG START ===');
        console.log('Token length:', token.length);
        console.log('Password length:', password.length);
        console.log('Passwords match:', password === confirmPassword);

        if (!validateInputs()) return;

        setIsLoading(true);
        try {
            console.log('Making API call to /auth/reset-password...');
            const response = await client.post('/auth/reset-password', {
                token: token.trim(),
                password
            });

            console.log('Reset password response:', response.data);

            Alert.alert(
                'Success!', 
                'Your password has been reset successfully. Please login with your new password.',
                [
                    {
                        text: 'Login Now',
                        onPress: () => navigation.navigate('Login')
                    }
                ]
            );
        } catch (error) {
            console.log('=== RESET PASSWORD ERROR ===');
            console.log('Error:', error);
            
            let errorMessage = 'Failed to reset password. Please try again.';
            
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            Alert.alert('Error', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={layout.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={layout.flex}
            >
                <ScrollView 
                    contentContainerStyle={layout.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={layout.formContainer}>
                        <Text style={[typography.h1, { color: colors.primary, marginBottom: spacing.lg }]}>
                            Reset Password
                        </Text>
                        
                        <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing.xl }]}>
                            Enter your reset token and choose a new password
                        </Text>

                        {/* Reset Token Input */}
                        <View style={layout.inputGroup}>
                            <Text style={layout.inputLabel}>Reset Token</Text>
                            <TextInput
                                style={[
                                    layout.textInput,
                                    tokenFocused && layout.textInputFocused,
                                    { fontFamily: 'monospace', fontSize: 14 }
                                ]}
                                placeholder="Enter your reset token"
                                value={token}
                                onChangeText={setToken}
                                onFocus={() => setTokenFocused(true)}
                                onBlur={() => setTokenFocused(false)}
                                autoCapitalize="none"
                                autoCorrect={false}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.xs }]}>
                                Copy and paste the token from your email
                            </Text>
                        </View>

                        {/* New Password Input */}
                        <View style={layout.inputGroup}>
                            <Text style={layout.inputLabel}>New Password</Text>
                            <View style={layout.passwordContainer}>
                                <TextInput
                                    style={[
                                        layout.passwordInput,
                                        passwordFocused && layout.textInputFocused
                                    ]}
                                    placeholder="Enter new password"
                                    value={password}
                                    onChangeText={setPassword}
                                    onFocus={() => setPasswordFocused(true)}
                                    onBlur={() => setPasswordFocused(false)}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                                <TouchableOpacity
                                    style={layout.passwordToggle}
                                    onPress={() => setShowPassword(!showPassword)}
                                >
                                    <Text style={layout.passwordToggleText}>
                                        {showPassword ? '👁️' : '👁️‍🗨️'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Confirm Password Input */}
                        <View style={layout.inputGroup}>
                            <Text style={layout.inputLabel}>Confirm New Password</Text>
                            <View style={layout.passwordContainer}>
                                <TextInput
                                    style={[
                                        layout.passwordInput,
                                        confirmPasswordFocused && layout.textInputFocused
                                    ]}
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    onFocus={() => setConfirmPasswordFocused(true)}
                                    onBlur={() => setConfirmPasswordFocused(false)}
                                    secureTextEntry={!showConfirmPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                                <TouchableOpacity
                                    style={layout.passwordToggle}
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <Text style={layout.passwordToggleText}>
                                        {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            {password && confirmPassword && password !== confirmPassword && (
                                <Text style={[typography.caption, { color: colors.error, marginTop: spacing.xs }]}>
                                    Passwords do not match
                                </Text>
                            )}
                        </View>

                        {/* Reset Button */}
                        <TouchableOpacity
                            style={[
                                layout.primaryButton,
                                (isLoading || !token || !password || !confirmPassword) && layout.disabledButton
                            ]}
                            onPress={handleResetPassword}
                            disabled={isLoading || !token || !password || !confirmPassword}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={colors.white} />
                            ) : (
                                <Text style={layout.primaryButtonText}>Reset Password</Text>
                            )}
                        </TouchableOpacity>

                        {/* Back to Login */}
                        <TouchableOpacity
                            style={layout.secondaryButton}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={layout.secondaryButtonText}>Back to Login</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
