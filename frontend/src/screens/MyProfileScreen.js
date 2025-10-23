import React from 'react';
import { View, Text, StatusBar, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { selectAuth } from '../store/authSlice';
import { colors, typography, spacing, layout } from '../styles';
import Footer from '../components/Footer';
import useLogout from '../hooks/useLogout';

export default function MyProfileScreen() {
    const { user, refreshToken } = useSelector(selectAuth);
    const { mutate: logout } = useLogout();

    const handleLogout = async () => {
        if(refreshToken){
            logout({refreshToken});
        }
        else{
            Alert.alert('Logout Failed', 'Could not log out from the server. Please check your connection and try again.');
        }
    }
    return (
        <SafeAreaView style={layout.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} />
            
            <ScrollView style={layout.scrollContainer} contentContainerStyle={layout.scrollContent}>
                {/* Header */}
                <View style={layout.headerCentered}>
                    <Text style={[typography.textStyles.h1, { color: colors.text.inverse, textAlign: 'center' }]}>
                        My Profile
                    </Text>
                    <Text style={[typography.textStyles.body, { 
                        color: colors.primary.light, 
                        opacity: 0.9,
                        textAlign: 'center',
                        marginTop: spacing.sm
                    }]}>
                        Manage your account settings
                    </Text>
                </View>

                {/* Simple Profile Content */}
                <View style={layout.formContainer}>
                    <View style={layout.cardLarge}>
                        {/* User Name */}
                        <View style={[layout.inputGroup, { alignItems: 'center', marginBottom: spacing.xl }]}>
                            <Text style={[typography.textStyles.h3, { 
                                color: colors.text.primary,
                                marginBottom: spacing.md
                            }]}>
                                Profile of {user?.name || 'User'}
                            </Text>
                        </View>

                        {/* Logout Button */}
                        <TouchableOpacity style={layout.button} onPress={handleLogout}>
                            <Text style={typography.textStyles.button}>Logout</Text>
                        </TouchableOpacity>

                        {/* Features Coming Soon */}
                        <View style={{ alignItems: 'center' }}>
                            <Text style={[typography.textStyles.h4, { 
                                textAlign: 'center', 
                                marginBottom: spacing.lg,
                                color: colors.text.secondary
                            }]}>
                                🚧 Features Coming Soon
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
            
            <Footer />
        </SafeAreaView>
    );
}