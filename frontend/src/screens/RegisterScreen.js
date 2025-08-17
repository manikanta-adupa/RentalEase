import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView, StatusBar, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerStart, registerSuccess, registerFailure, selectAuth } from "../store/authSlice";
import { client, setAuthToken } from "../api/client";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, typography, spacing, layout } from "../styles";


export default function RegisterScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    // Focus states for inputs
    const [nameFocused, setNameFocused] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [phoneFocused, setPhoneFocused] = useState(false);
    const [addressFocused, setAddressFocused] = useState(false);
    
    // Validation states
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [phoneError, setPhoneError] = useState('');

    const { status, error } = useSelector(selectAuth);
    const isLoading = status === 'loading';
    const dispatch = useDispatch();
    const navigation = useNavigation();

    // Validation functions
    const validateName = (value) => {
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        if (value.trim().length > 50) return 'Name must be less than 50 characters';
        return '';
    };

    const validateEmail = (value) => {
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email';
        return '';
    };

    const validatePassword = (value) => {
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        return '';
    };

    const validatePhone = (value) => {
        if (!value.trim()) return 'Phone number is required';
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) return 'Please enter a valid 10-digit phone number';
        return '';
    };

    // Real-time validation handlers
    const handleNameChange = (value) => {
        setName(value);
        if (nameError) setNameError(validateName(value));
    };

    const handleEmailChange = (value) => {
        setEmail(value);
        if (emailError) setEmailError(validateEmail(value));
    };

    const handlePasswordChange = (value) => {
        setPassword(value);
        if (passwordError) setPasswordError(validatePassword(value));
    };

    const handlePhoneChange = (value) => {
        setPhone(value);
        if (phoneError) setPhoneError(validatePhone(value));
    };


    const handleRegister = async () => {
        // Validate all fields before submission
        const nameErr = validateName(name);
        const emailErr = validateEmail(email);
        const passwordErr = validatePassword(password);
        const phoneErr = validatePhone(phone);

        setNameError(nameErr);
        setEmailError(emailErr);
        setPasswordError(passwordErr);
        setPhoneError(phoneErr);

        // Check if there are any validation errors
        if (nameErr || emailErr || passwordErr || phoneErr || !address.trim()) {
            Alert.alert('Validation Error', 'Please fix all errors before submitting');
            return;
        }

        dispatch(registerStart());
        try{
            const response = await client.post('/auth/register', {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password,
                phone: phone.replace(/\s/g, ''),
                address: address.trim(),
            });
            const {token, user} = response.data;
            await AsyncStorage.multiSet([
                ['@token', token],
                ['@user', JSON.stringify(user)]
            ]);
            setAuthToken(token);
            dispatch(registerSuccess({user, token}));
            navigation.navigate('Home');   
        }
        catch(error){
            const message = error?.response?.data?.message || "Registration failed";
            dispatch(registerFailure(message));
            Alert.alert('Registration failed', message);
        }
    };

    // Form validation check
    const isFormValid = name.trim() && 
                       email.trim() && 
                       password && 
                       phone.trim() && 
                       address.trim() && 
                       !nameError && 
                       !emailError && 
                       !passwordError && 
                       !phoneError && 
                       !isLoading;
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
                            Join RentalEase
                        </Text>
                        <Text style={[typography.textStyles.body, { 
                            color: colors.primary.light, 
                            textAlign: 'center',
                            opacity: 0.9,
                            marginTop: spacing.xs 
                        }]}>
                            Create your account to get started
                        </Text>
                    </View>

                    {/* Registration Form */}
                    <View style={layout.formContainer}>
                        <View style={layout.cardLarge}>
                            <Text style={[typography.textStyles.h3, { textAlign: 'center', marginBottom: spacing['2xl'] }]}>
                                Create Account
                            </Text>



                            {/* Name Input */}
                            <View style={layout.inputGroup}>
                                <Text style={typography.textStyles.label}>
                                    Full Name
                                </Text>
                                <TextInput
                                    placeholder="Enter your full name"
                                    placeholderTextColor={colors.text.tertiary}
                                    value={name}
                                    onChangeText={handleNameChange}
                                    onFocus={() => setNameFocused(true)}
                                    onBlur={() => {
                                        setNameFocused(false);
                                        setNameError(validateName(name));
                                    }}
                                    autoCapitalize="words"
                                    autoCorrect={false}
                                    style={[
                                        layout.input,
                                        nameFocused && layout.inputFocused,
                                        nameError && { borderColor: colors.error.main }
                                    ]}
                                />
                                {nameError ? (
                                    <Text style={[typography.textStyles.caption, { color: colors.error.main, marginTop: spacing.xs }]}>
                                        {nameError}
                                    </Text>
                                ) : null}
                            </View>

                            {/* Email Input */}
                            <View style={layout.inputGroup}>
                                <Text style={typography.textStyles.label}>
                                    Email Address
                                </Text>
                                <TextInput
                                    placeholder="Enter your email"
                                    placeholderTextColor={colors.text.tertiary}
                                    value={email}
                                    onChangeText={handleEmailChange}
                                    onFocus={() => setEmailFocused(true)}
                                    onBlur={() => {
                                        setEmailFocused(false);
                                        setEmailError(validateEmail(email));
                                    }}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    style={[
                                        layout.input,
                                        emailFocused && layout.inputFocused,
                                        emailError && { borderColor: colors.error.main }
                                    ]}
                                />
                                {emailError ? (
                                    <Text style={[typography.textStyles.caption, { color: colors.error.main, marginTop: spacing.xs }]}>
                                        {emailError}
                                    </Text>
                                ) : null}
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
                                        value={password}
                                        onChangeText={handlePasswordChange}
                                        onFocus={() => setPasswordFocused(true)}
                                        onBlur={() => {
                                            setPasswordFocused(false);
                                            setPasswordError(validatePassword(password));
                                        }}
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        style={[
                                            layout.input,
                                            layout.inputWithIcon,
                                            passwordFocused && layout.inputFocused,
                                            passwordError && { borderColor: colors.error.main }
                                        ]}
                                    />
                                    <TouchableOpacity
                                        style={layout.iconButton}
                                        onPress={() => setShowPassword(!showPassword)}
                                    >
                                        <Text style={{ fontSize: 18, color: colors.neutral[500] }}>
                                            {showPassword ? '👀' : '👁️‍🗨️'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                {passwordError ? (
                                    <Text style={[typography.textStyles.caption, { color: colors.error.main, marginTop: spacing.xs }]}>
                                        {passwordError}
                                    </Text>
                                ) : null}
                            </View>

                            {/* Phone Input */}
                            <View style={layout.inputGroup}>
                                <Text style={typography.textStyles.label}>
                                    Phone Number
                                </Text>
                                <TextInput
                                    placeholder="Enter your phone number"
                                    placeholderTextColor={colors.text.tertiary}
                                    value={phone}
                                    onChangeText={handlePhoneChange}
                                    onFocus={() => setPhoneFocused(true)}
                                    onBlur={() => {
                                        setPhoneFocused(false);
                                        setPhoneError(validatePhone(phone));
                                    }}
                                    keyboardType="phone-pad"
                                    autoCorrect={false}
                                    style={[
                                        layout.input,
                                        phoneFocused && layout.inputFocused,
                                        phoneError && { borderColor: colors.error.main }
                                    ]}
                                />
                                {phoneError ? (
                                    <Text style={[typography.textStyles.caption, { color: colors.error.main, marginTop: spacing.xs }]}>
                                        {phoneError}
                                    </Text>
                                ) : null}
                            </View>

                            {/* Address Input */}
                            <View style={layout.inputGroup}>
                                <Text style={typography.textStyles.label}>
                                    Address
                                </Text>
                                <TextInput
                                    placeholder="Enter your address"
                                    placeholderTextColor={colors.text.tertiary}
                                    value={address}
                                    onChangeText={setAddress}
                                    onFocus={() => setAddressFocused(true)}
                                    onBlur={() => setAddressFocused(false)}
                                    multiline
                                    numberOfLines={2}
                                    autoCapitalize="words"
                                    autoCorrect={false}
                                    style={[
                                        layout.input,
                                        addressFocused && layout.inputFocused,
                                        { height: 70, textAlignVertical: 'top' }
                                    ]}
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

                            {/* Register Button */}
                            <TouchableOpacity
                                style={[
                                    isFormValid ? layout.buttonPrimary : layout.buttonDisabled,
                                    { marginBottom: spacing.lg }
                                ]}
                                onPress={handleRegister}
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
                                            Creating Account...
                                        </Text>
                                    </View>
                                ) : (
                                    <Text style={[typography.textStyles.button, { 
                                        color: isFormValid ? colors.text.inverse : colors.text.secondary
                                    }]}>
                                        Create Account
                                    </Text>
                                )}
                            </TouchableOpacity>

                            {/* Login Link */}
                            <View style={layout.row}>
                                <Text style={typography.textStyles.body}>
                                    Already have an account?{' '}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Login')}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[typography.textStyles.body, { 
                                        color: colors.primary.main,
                                        fontWeight: typography.fontWeight.semibold
                                    }]}>
                                        Sign In
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}