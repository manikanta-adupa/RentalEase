import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { logout, selectAuth, selectIsAuthenticated } from '../store/authSlice';
import { clearAuthToken } from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import useHealthCheck from '../hooks/useHealthCheck';
import { colors, typography, spacing, layout } from '../styles';

export default function HomeScreen() {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const { user } = useSelector(selectAuth);
    const isAuthenticated = useSelector(selectIsAuthenticated);

    const handleLogout = async () => {
        await AsyncStorage.multiRemove(['@token', '@user']);
        clearAuthToken();
        dispatch(logout());
        navigation.navigate('Login');
    }

    const { data: healthCheckData, isLoading: healthCheckLoading, isError: healthCheckError } = useHealthCheck();
    const healthCheckStatus = healthCheckData?.success ? 'Healthy' : 'Unhealthy';
    const isHealthy = healthCheckData?.success;

    return (
        <SafeAreaView style={layout.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} />
            
            <ScrollView style={layout.scrollContainer} contentContainerStyle={layout.scrollContent}>
                {/* Header Section */}
                <View style={layout.header}>
                    <Text style={[typography.textStyles.h2, { color: colors.text.inverse, marginBottom: spacing.xs }]}>
                        Welcome to RentalEase
                    </Text>
                    {isAuthenticated && (
                        <Text style={[typography.textStyles.body, { 
                            color: colors.primary.light, 
                            opacity: 0.9 
                        }]}>
                            Hi {user?.name}, ready to explore properties?
                        </Text>
                    )}
                </View>

                {/* Status Card */}
                <View style={layout.card}>
                    <View style={[layout.row, { marginBottom: spacing.md }]}>
                        <View style={[
                            layout.statusIndicator,
                            { backgroundColor: isHealthy ? colors.success.main : colors.error.main }
                        ]} />
                        <Text style={typography.textStyles.h5}>
                            System Status
                        </Text>
                    </View>
                    
                    <Text style={[typography.textStyles.body, { 
                        color: isHealthy ? colors.success.main : colors.error.main,
                        fontWeight: typography.fontWeight.medium,
                        marginBottom: spacing.xs 
                    }]}>
                        {healthCheckLoading ? 'Checking...' : healthCheckStatus}
                    </Text>
                    
                    <Text style={[typography.textStyles.bodySmall, { color: colors.text.secondary }]}>
                        {healthCheckError ? 'Unable to connect to server' : 
                         healthCheckData?.message || 'All systems operational'}
                    </Text>
                </View>

                {/* User Profile Card */}
                {isAuthenticated && (
                    <View style={layout.card}>
                        <Text style={[typography.textStyles.h5, { marginBottom: spacing.md }]}>
                            Profile Information
                        </Text>
                        
                        <View style={{ marginBottom: spacing.xs }}>
                            <Text style={typography.textStyles.caption}>NAME</Text>
                            <Text style={[typography.textStyles.body, { fontWeight: typography.fontWeight.medium }]}>
                                {user?.name}
                            </Text>
                        </View>
                        
                        <View style={{ marginBottom: spacing.xs }}>
                            <Text style={typography.textStyles.caption}>EMAIL</Text>
                            <Text style={[typography.textStyles.body, { fontWeight: typography.fontWeight.medium }]}>
                                {user?.email}
                            </Text>
                        </View>
                        
                        <View>
                            <Text style={typography.textStyles.caption}>ROLE</Text>
                            <View style={[
                                layout.badge,
                                { backgroundColor: user?.role === 'owner' ? colors.accent.main : colors.secondary.main }
                            ]}>
                                <Text style={[typography.textStyles.buttonSmall, { 
                                    color: colors.text.inverse,
                                    textTransform: 'capitalize'
                                }]}>
                                    {user?.role}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Spacer to push buttons to bottom */}
                <View style={layout.spacer} />

                {/* Action Buttons */}
                <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
                    {isAuthenticated ? (
                        <View style={layout.buttonGroup}>
                            <TouchableOpacity
                                style={layout.buttonPrimary}
                                onPress={() => navigation.navigate('PropertyList')}
                            >
                                <Text style={[typography.textStyles.button, { color: colors.text.inverse }]}>
                                    🏠 View Properties
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={layout.buttonSecondary}
                                onPress={handleLogout}
                            >
                                <Text style={[typography.textStyles.button, { color: colors.error.main }]}>
                                    Logout
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={layout.buttonPrimary}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={[typography.textStyles.button, { color: colors.text.inverse }]}>
                                Login to Continue
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}