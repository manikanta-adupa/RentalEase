import { View, Text, TextInput, TouchableOpacity, StatusBar, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, layout } from '../styles';
import { client } from '../api/client';

export default function ForgotPasswordScreen() {

    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleForgotPassword = async () => {
        // Basic email validation
        if (!email.trim()) {
            setError('Please enter your email address');
            return;
        }
        if (!email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }
        
        setError(null);
        setIsLoading(true);
        
        try{
            const response = await client.post(`/auth/forgot-password`, { email });
            
            if(response.data.success){
                setSuccess(response.data.message || 'Reset email sent successfully!');
                
                // Auto-navigate to Reset Password screen after a brief delay
                setTimeout(() => {
                    navigation.navigate('ResetPassword', { 
                        email: email,
                        fromForgotPassword: true 
                    });
                }, 1500); // 1.5 second delay to show success message
            }
            else{
                setError(response.data.message);
            }
        }
        catch(error){
            setError(error.response?.data?.message || 'An error occurred');
        }
        finally {
            setIsLoading(false);
        }
    }
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
                        <Text style={{ fontSize: typography.fontSize['5xl'], marginBottom: spacing.md }}>🔐</Text>
                        <Text style={[typography.textStyles.h1, { color: colors.text.inverse, textAlign: 'center' }]}>
                            Forgot Password
                        </Text>
                        <Text style={[typography.textStyles.body, { 
                            color: colors.primary.light, 
                            textAlign: 'center',
                            opacity: 0.9,
                            marginTop: spacing.xs 
                        }]}>
                            Don't worry, we'll help you reset it
                        </Text>
                    </View>

                    {/* Main Content */}
                    <View style={layout.formContainer}>
                    {!success ? (
                        <>
                            <View style={layout.cardLarge}>
                                <Text style={[typography.textStyles.h3, { textAlign: 'center', marginBottom: spacing['2xl'] }]}>
                                    Reset Your Password
                                </Text>

                                {/* Email Input */}
                                <View style={layout.inputGroup}>
                                    <Text style={typography.textStyles.label}>
                                        Email Address
                                    </Text>
                                    <TextInput
                                        placeholder="Enter your registered email"
                                        placeholderTextColor={colors.text.tertiary}
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        style={layout.input}
                                    />
                                </View>

                                {/* Error Message */}
                                {error && (
                                    <View style={layout.errorContainer}>
                                        <Text style={typography.textStyles.error}>
                                            {error}
                                        </Text>
                                    </View>
                                )}

                                {/* Submit Button */}
                                <TouchableOpacity
                                    style={[
                                        layout.buttonPrimary,
                                        { marginBottom: spacing.lg },
                                        isLoading && { opacity: 0.7 }
                                    ]}
                                    onPress={handleForgotPassword}
                                    disabled={isLoading}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[typography.textStyles.button, { color: colors.text.inverse }]}>
                                        {isLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={{ alignItems: 'center', marginTop: spacing.md }}
                                    onPress={() => navigation.navigate('ResetPassword')}
                                    disabled={isLoading}
                                    activeOpacity={0.8}
                                >
                                    <Text style={typography.textStyles.link}>
                                        Open Reset Password Screen
                                    </Text>
                                </TouchableOpacity>

                                {/* Back to Login Link */}
                                <TouchableOpacity
                                    style={{ alignItems: 'center' }}
                                    onPress={() => navigation.goBack()}
                                >
                                    <Text style={typography.textStyles.link}>
                                        Back to Login
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        <View style={layout.cardLarge}>
                            <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
                                <Text style={{ fontSize: typography.fontSize['4xl'], marginBottom: spacing.md }}>📧</Text>
                                <Text style={[typography.textStyles.h3, { textAlign: 'center', marginBottom: spacing.md }]}>
                                    Check Your Email
                                </Text>
                            </View>
                            
                            <Text style={[typography.textStyles.body, { 
                                textAlign: 'center',
                                marginBottom: spacing.lg,
                                color: colors.text.secondary
                            }]}>
                                We've sent password reset instructions to your email address. Please check your inbox and follow the link to reset your password.
                            </Text>

                            <TouchableOpacity
                                style={[layout.buttonPrimary, { marginBottom: spacing.md }]}
                                onPress={() => navigation.goBack()}
                            >
                                <Text style={[typography.textStyles.button, { color: colors.text.inverse }]}>
                                    Back to Login
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{ alignItems: 'center' }}
                                onPress={() => {
                                    setSuccess(null);
                                    setEmail('');
                                }}
                            >
                                <Text style={typography.textStyles.link}>
                                    Send to different email
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Bottom Spacer */}
                    <View style={{ height: spacing['2xl'] }} />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}