import React from 'react';
import { View, Text, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { colors, typography, spacing, layout } from '../styles';
import Footer from '../components/Footer';

export default function AddPropertyScreen() {
    return (
        <SafeAreaView style={layout.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} />
            
            <ScrollView style={layout.scrollContainer} contentContainerStyle={layout.scrollContent}>
                {/* Header */}
                <View style={layout.headerCentered}>
                    <Text style={[typography.textStyles.h2, { color: colors.text.inverse, textAlign: 'center' }]}>
                        Add New Property
                    </Text>
                    <Text style={[typography.textStyles.body, { 
                        color: colors.primary.light, 
                        opacity: 0.9,
                        textAlign: 'center',
                        marginTop: spacing.sm
                    }]}>
                        List your property for rent
                    </Text>
                </View>

                {/* Placeholder Content */}
                <View style={layout.formContainer}>
                    <View style={layout.cardLarge}>
                        <Text style={[typography.textStyles.h4, { 
                            textAlign: 'center', 
                            marginBottom: spacing.lg,
                            color: colors.text.secondary
                        }]}>
                            🏠 Property Form Coming Soon
                        </Text>
                        
                        <Text style={[typography.textStyles.body, { 
                            textAlign: 'center',
                            color: colors.text.secondary,
                            lineHeight: 24
                        }]}>
                            This screen will contain a form to add new properties with fields like:
                        </Text>
                        
                        <View style={{ marginTop: spacing.lg }}>
                            <Text style={[typography.textStyles.body, { 
                                color: colors.text.secondary,
                                marginBottom: spacing.sm
                            }]}>
                                • Property Title & Description
                            </Text>
                            <Text style={[typography.textStyles.body, { 
                                color: colors.text.secondary,
                                marginBottom: spacing.sm
                            }]}>
                                • Property Type & Rent
                            </Text>
                            <Text style={[typography.textStyles.body, { 
                                color: colors.text.secondary,
                                marginBottom: spacing.sm
                            }]}>
                                • Location & Address
                            </Text>
                            <Text style={[typography.textStyles.body, { 
                                color: colors.text.secondary,
                                marginBottom: spacing.sm
                            }]}>
                                • Bedrooms, Bathrooms, Area
                            </Text>
                            <Text style={[typography.textStyles.body, { 
                                color: colors.text.secondary,
                                marginBottom: spacing.sm
                            }]}>
                                • Images & Documents
                            </Text>
                        </View>
                        
                        <Text style={[typography.textStyles.body, { 
                            textAlign: 'center',
                            color: colors.primary.main,
                            marginTop: spacing.xl,
                            fontWeight: typography.fontWeight.semibold
                        }]}>
                            Build this form step by step!
                        </Text>
                    </View>
                </View>
            </ScrollView>
            
            <Footer />
        </SafeAreaView>
    );
}