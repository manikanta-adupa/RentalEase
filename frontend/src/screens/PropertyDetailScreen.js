import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { colors, typography, spacing, layout } from '../styles';
import useProperty from '../hooks/useProperty';
import { Ionicons } from '@expo/vector-icons';

export default function PropertyDetailScreen() {
    const route = useRoute();
    const { propertyId } = route.params;
    const { data, isLoading, error } = useProperty(propertyId);
    
    const propertyData = data?.property;
    const ownerData = data?.owner;

    if (isLoading) {
        return (
            <View style={layout.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary.main} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={layout.centeredContainer}>
                <Text style={typography.textStyles.error}>Error: {error.message}</Text>
            </View>
        );
    }

    if (!propertyData) {
        return (
            <View style={layout.centeredContainer}>
                <Text>Property not found.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={layout.scrollContainer} contentContainerStyle={layout.scrollContent}>
            {/* Header */}
            <View style={[layout.headerCentered, { paddingBottom: spacing.xl }]}>
                <Text style={[typography.textStyles.h1, { 
                    color: colors.text.inverse, 
                    textAlign: 'center',
                    marginBottom: spacing.lg,
                    paddingHorizontal: spacing.md
                }]}>
                    {propertyData.title}
                </Text>
                
                <Text style={[typography.textStyles.bodyLarge, { 
                    color: colors.primary.light, 
                    textAlign: 'center',
                    opacity: 0.95,
                    fontWeight: typography.fontWeight.medium,
                    marginBottom: spacing.xs
                }]}>
                    📍 {propertyData.address}
                </Text>
                
                <Text style={[typography.textStyles.body, { 
                    color: colors.primary.light, 
                    textAlign: 'center',
                    marginTop: spacing.xs,
                    opacity: 0.8,
                    fontWeight: typography.fontWeight.medium
                }]}>
                    {propertyData.city}, {propertyData.state}
                </Text>
            </View>

            {/* Property Details Section */}
            <View style={layout.cardLarge}>
                <Text style={styles.sectionTitle}>Property Details</Text>
                <Text style={styles.description}>{propertyData.description}</Text>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Property Type</Text>
                    <Text style={styles.detailValue}>{propertyData.propertyType}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Furnishing</Text>
                    <Text style={styles.detailValue}>{propertyData.furnishingStatus}</Text>
                </View>
                 <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Bedrooms</Text>
                    <Text style={styles.detailValue}>{propertyData.bedRooms}</Text>
                </View>
                 <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Bathrooms</Text>
                    <Text style={styles.detailValue}>{propertyData.bathRooms}</Text>
                </View>
                 <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Area</Text>
                    <Text style={styles.detailValue}>{propertyData.area} sqft</Text>
                </View>
            </View>

            {/* Rent Details Section */}
            <View style={layout.cardLarge}>
                <Text style={styles.sectionTitle}>Rent Details</Text>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Monthly Rent</Text>
                    <Text style={[styles.detailValue, { color: colors.success.main, fontWeight: 'bold' }]}>₹{propertyData.monthlyRent?.toLocaleString()}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Security Deposit</Text>
                    <Text style={styles.detailValue}>₹{propertyData.securityDeposit?.toLocaleString()}</Text>
                </View>
                {propertyData.maintenanceFee > 0 && (
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Maintenance</Text>
                        <Text style={styles.detailValue}>₹{propertyData.maintenanceFee?.toLocaleString()}</Text>
                    </View>
                )}
            </View>

            {/* Amenities Section */}
            {propertyData.amenities && propertyData.amenities.length > 0 && (
                <View style={layout.cardLarge}>
                    <Text style={styles.sectionTitle}>Amenities</Text>
                    <View style={styles.amenitiesContainer}>
                        {propertyData.amenities.map((amenity, index) => (
                            <View key={index} style={styles.amenityPill}>
                                <Text style={styles.amenityText}>{amenity}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* Owner Details Section */}
            {ownerData ? (
                <View style={layout.cardLarge}>
                    <Text style={styles.sectionTitle}>Owner Details</Text>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Name</Text>
                        <Text style={styles.detailValue}>{ownerData.name || 'Not available'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Email</Text>
                        <Text style={styles.detailValue}>{ownerData.email || 'Not available'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Phone</Text>
                        <Text style={styles.detailValue}>{ownerData.phone || 'Not available'}</Text>
                    </View>
                </View>
            ) : (
                <View style={layout.cardLarge}>
                    <Text style={styles.sectionTitle}>Owner Details</Text>
                    <Text style={[typography.textStyles.body, { 
                        textAlign: 'center',
                        color: colors.text.secondary,
                        fontStyle: 'italic'
                    }]}>
                        Owner information not available
                    </Text>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    sectionTitle: {
        ...typography.textStyles.h3,
        color: colors.text.primary,
        marginBottom: spacing.lg,
        textAlign: 'center',
    },
    description: {
        ...typography.textStyles.body,
        color: colors.text.secondary,
        marginBottom: spacing.lg,
        lineHeight: 24,
    },
    detailRow: {
        ...layout.rowBetween,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
    },
    detailLabel: {
        ...typography.textStyles.label,
        color: colors.text.secondary,
    },
    detailValue: {
        ...typography.textStyles.body,
        fontWeight: typography.fontWeight.medium,
        color: colors.text.primary,
    },
    amenitiesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    amenityPill: {
        backgroundColor: colors.primary.background,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.primary.light,
    },
    amenityText: {
        ...typography.textStyles.bodySmall,
        color: colors.primary.main,
        fontWeight: typography.fontWeight.medium,
    },
});