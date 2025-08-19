import React from 'react';
import { View, Text, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { selectAuth } from '../store/authSlice';
import { colors, typography, spacing, layout } from '../styles';
import Footer from '../components/Footer';

export default function MyProfileScreen() {
    const { user } = useSelector(selectAuth);
    return (
        <SafeAreaView style={layout.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} />
            
            <ScrollView style={layout.scrollContainer} contentContainerStyle={layout.scrollContent}>
                {/* Header */}
                <View style={layout.headerCentered}>
                    <Text style={[typography.textStyles.h2, { color: colors.text.inverse, textAlign: 'center' }]}>
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