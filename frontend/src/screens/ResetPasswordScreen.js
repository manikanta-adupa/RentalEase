import { View, Text, TextInput, TouchableOpacity, Alert, StatusBar, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
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
    const [userEmail, setUserEmail] = useState('');
    const [fromForgotPassword, setFromForgotPassword] = useState(false);

    const navigation = useNavigation();
    const route = useRoute();

    // Extract parameters from route
    useEffect(() => {
        if (route.params?.token) {
            setToken(route.params.token);
        }
        if (route.params?.email) {
            setUserEmail(route.params.email);
        }
        if (route.params?.fromForgotPassword) {
            setFromForgotPassword(true);
        }
    }, [route.params]);

    // Handle back button press with warning
    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                Alert.alert(
                    "⚠️ Wait!",
                    "Going back will lose your progress. Make sure you've copied the reset token from your email before leaving.\n\nAre you sure you want to go back?",
                    [
                        {
                            text: "Stay Here",
                            onPress: () => null,
                            style: "cancel"
                        },
                        {
                            text: "Go Back",
                            onPress: () => navigation.goBack(),
                            style: "destructive"
                        }
                    ]
                );
                return true; // Prevent default behavior
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [navigation])
    );

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
        if (!validateInputs()) return;

        setIsLoading(true);
        try {
            const response = await client.post('/auth/reset-password', {
                token: token.trim(),
                password
            });

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
                        <Text style={{ fontSize: typography.fontSize['5xl'], marginBottom: spacing.md }}>🔑</Text>
                        <Text style={[typography.textStyles.h1, { color: colors.text.inverse, textAlign: 'center' }]}>
                            Reset Password
                        </Text>
                        <Text style={[typography.textStyles.body, { 
                            color: colors.primary.light, 
                            textAlign: 'center',
                            opacity: 0.9,
                            marginTop: spacing.xs 
                        }]}>
                            Create a new secure password
                        </Text>
                    </View>

                    {/* Main Content */}
                    <View style={layout.formContainer}>
                        {fromForgotPassword && userEmail && (
                            <View style={layout.card}>
                                <Text style={[typography.textStyles.body, { color: colors.success.dark, textAlign: 'center' }]}>
                                    📧 Reset instructions sent to{'\n'}
                                    <Text style={{ fontWeight: 'bold' }}>{userEmail}</Text>
                                </Text>
                                <Text style={[typography.textStyles.caption, { color: colors.success.dark, textAlign: 'center', marginTop: spacing.xs }]}>
                                    Check your email for the reset token
                                </Text>
                            </View>
                        )}

                        <View style={layout.cardLarge}>
                            <Text style={[typography.textStyles.h3, { textAlign: 'center', marginBottom: spacing['2xl'] }]}>
                                Enter Reset Details
                            </Text>

                            {/* Important Instructions Banner */}
                            <View style={{ 
                                backgroundColor: colors.warning.light, 
                                borderWidth: 1,
                                borderColor: colors.warning.main,
                                padding: spacing.md, 
                                borderRadius: 12, 
                                marginBottom: spacing.lg 
                            }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
                                    <Text style={{ fontSize: 18, marginRight: spacing.xs }}>⚠️</Text>
                                    <Text style={[typography.textStyles.caption, { 
                                        color: colors.warning.dark, 
                                        fontWeight: 'bold',
                                        textTransform: 'uppercase',
                                        letterSpacing: 0.5
                                    }]}>
                                        Important Instructions
                                    </Text>
                                </View>
                                <Text style={[typography.textStyles.caption, { color: colors.warning.dark, lineHeight: 18 }]}>
                                    • Copy the reset token from your email{'\n'}
                                    • Paste it below and set your new password{'\n'}
                                    • <Text style={{ fontWeight: 'bold' }}>Don't close this screen</Text> until complete{'\n'}
                                    • <Text style={{ fontWeight: 'bold' }}>Don't go back</Text> - you'll lose progress
                                </Text>
                            </View>

                        {/* Reset Token Input */}
                        <View style={layout.inputGroup}>
                            <Text style={typography.textStyles.label}>
                                Reset Token
                            </Text>
                            <TextInput
                                placeholder="Enter your reset token"
                                placeholderTextColor={colors.text.tertiary}
                                value={token}
                                onChangeText={setToken}
                                onFocus={() => setTokenFocused(true)}
                                onBlur={() => setTokenFocused(false)}
                                autoCapitalize="none"
                                autoCorrect={false}
                                multiline
                                numberOfLines={3}
                                style={[
                                    layout.input,
                                    tokenFocused && layout.inputFocused,
                                    { fontFamily: 'monospace', fontSize: 14, textAlignVertical: 'top' }
                                ]}
                            />
                            <Text style={[typography.textStyles.caption, { color: colors.text.secondary, marginTop: spacing.xs }]}>
                                Copy and paste the token from your email
                            </Text>
                        </View>

                            {/* New Password Input */}
                            <View style={layout.inputGroup}>
                                <Text style={typography.textStyles.label}>
                                    New Password
                                </Text>
                                <View style={layout.inputContainer}>
                                    <TextInput
                                        placeholder="Enter new password"
                                        placeholderTextColor={colors.text.tertiary}
                                        value={password}
                                        onChangeText={setPassword}
                                        onFocus={() => setPasswordFocused(true)}
                                        onBlur={() => setPasswordFocused(false)}
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        style={[
                                            layout.input,
                                            layout.inputWithIcon,
                                            passwordFocused && layout.inputFocused
                                        ]}
                                    />
                                    <TouchableOpacity
                                        style={layout.iconButton}
                                        onPress={() => setShowPassword(!showPassword)}
                                    >
                                        <Text style={{ fontSize: 18, color: colors.neutral[500] }}>
                                            {showPassword ? '🙈' : '👁️'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                        {/* Confirm Password Input */}
                        <View style={layout.inputGroup}>
                            <Text style={typography.textStyles.label}>
                                Confirm New Password
                            </Text>
                            <View style={layout.inputContainer}>
                                <TextInput
                                    placeholder="Confirm new password"
                                    placeholderTextColor={colors.text.tertiary}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    onFocus={() => setConfirmPasswordFocused(true)}
                                    onBlur={() => setConfirmPasswordFocused(false)}
                                    secureTextEntry={!showConfirmPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    style={[
                                        layout.input,
                                        layout.inputWithIcon,
                                        confirmPasswordFocused && layout.inputFocused
                                    ]}
                                />
                                <TouchableOpacity
                                    style={layout.iconButton}
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <Text style={{ fontSize: 18, color: colors.neutral[500] }}>
                                        {showConfirmPassword ? '🙈' : '👁️'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            {password && confirmPassword && password !== confirmPassword && (
                                <Text style={[typography.textStyles.caption, { color: colors.error.main, marginTop: spacing.xs }]}>
                                    Passwords do not match
                                </Text>
                            )}
                        </View>

                            {/* Reset Button */}
                            <TouchableOpacity
                                style={[
                                    (token && password && confirmPassword && !isLoading) ? layout.buttonPrimary : layout.buttonDisabled,
                                    { marginBottom: spacing.lg }
                                ]}
                                onPress={handleResetPassword}
                                disabled={isLoading || !token || !password || !confirmPassword}
                                activeOpacity={0.8}
                            >
                                {isLoading ? (
                                    <View style={layout.row}>
                                        <ActivityIndicator size="small" color={colors.text.inverse} />
                                        <Text style={[typography.textStyles.button, { 
                                            color: colors.text.inverse, 
                                            marginLeft: spacing.xs 
                                        }]}>
                                            Resetting...
                                        </Text>
                                    </View>
                                ) : (
                                    <Text style={[typography.textStyles.button, { 
                                        color: (token && password && confirmPassword) ? colors.text.inverse : colors.text.secondary
                                    }]}>
                                        Reset Password
                                    </Text>
                                )}
                            </TouchableOpacity>

                            {/* Back to Login */}
                            <TouchableOpacity
                                style={layout.buttonSecondary}
                                onPress={() => navigation.navigate('Login')}
                                activeOpacity={0.8}
                            >
                                <Text style={[typography.textStyles.button, { color: colors.error.main }]}>
                                    Back to Login
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
