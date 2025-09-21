import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useProperties from '../hooks/useProperties';
import { colors, typography, spacing, layout } from '../styles';
import Footer from '../components/Footer';

export default function PropertyListScreen() {
    const { data, isLoading, error, refetch } = useProperties();
    const navigation = useNavigation();
    const properties = data?.properties;
    const pagination = data?.pagination;

    // Loading state with skeleton design
    if (isLoading) {
        return (
            <SafeAreaView style={layout.safeArea}>
                <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} />
                
                {/* Header */}
                <View style={layout.header}>
                    <Text style={[typography.textStyles.h1, { color: colors.text.inverse, textAlign: 'center' }]}>
                        Available Properties
                    </Text>
                </View>

                <View style={layout.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary.main} />
                    <Text style={[typography.textStyles.body, { 
                        marginTop: spacing.md,
                        color: colors.text.secondary,
                        fontWeight: typography.fontWeight.medium
                    }]}>
                        Loading properties...
                    </Text>
                </View>
            </SafeAreaView>
        )
    }

    // Error state with retry button
    if (error) {
        return (
            <SafeAreaView style={layout.safeArea}>
                <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} />
                
                <View style={[layout.centeredContainer, { padding: spacing.lg }]}>
                    <View style={[layout.card, { 
                        alignItems: 'center',
                        width: '100%',
                        maxWidth: 300
                    }]}>
                        <Text style={{ fontSize: typography.fontSize['5xl'], marginBottom: spacing.md }}>😕</Text>
                        <Text style={[typography.textStyles.h5, { 
                            color: colors.error.main,
                            marginBottom: spacing.xs,
                            textAlign: 'center'
                        }]}>
                            Something went wrong
                        </Text>
                        <Text style={[typography.textStyles.bodySmall, { 
                            color: colors.text.secondary,
                            textAlign: 'center',
                            marginBottom: spacing.lg
                        }]}>
                            Unable to load properties. Please check your connection and try again.
                        </Text>
                        <TouchableOpacity
                            style={[layout.buttonPrimary, { width: '100%' }]}
                            onPress={refetch}
                        >
                            <Text style={[typography.textStyles.button, { color: colors.text.inverse }]}>
                                Try Again
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        )
    }

    // Empty state with illustration
    if (!properties || properties.length === 0) {
        return (
            <SafeAreaView style={layout.safeArea}>
                <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} />
                
                {/* Header */}
                <View style={layout.header}>
                    <Text style={[typography.textStyles.h1, { color: colors.text.inverse, textAlign: 'center' }]}>
                        Available Properties
                    </Text>
                </View>

                <View style={[layout.centeredContainer, { padding: spacing.lg }]}>
                    <View style={[layout.card, { 
                        alignItems: 'center',
                        width: '100%',
                        maxWidth: 300
                    }]}>
                        <Text style={{ fontSize: typography.fontSize['6xl'], marginBottom: spacing.md }}>🏠</Text>
                        <Text style={[typography.textStyles.h4, { 
                            marginBottom: spacing.xs,
                            textAlign: 'center'
                        }]}>
                            No Properties Found
                        </Text>
                        <Text style={[typography.textStyles.bodySmall, { 
                            color: colors.text.secondary,
                            textAlign: 'center'
                        }]}>
                            There are no properties available at the moment. Check back later!
                        </Text>
                    </View>
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={layout.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} />
            
            {/* Header */}
            <View style={layout.header}>
                <Text style={[typography.textStyles.h1, { color: colors.text.inverse, textAlign: 'center' }]}>
                    Available Properties
                </Text>
                <Text style={[typography.textStyles.bodySmall, { 
                    color: colors.primary.light,
                    textAlign: 'center',
                    marginTop: spacing.xs,
                    opacity: 0.9
                }]}>
                    {properties.length} {properties.length === 1 ? 'property' : 'properties'} found
                </Text>
            </View>

            <FlatList
                style={layout.listContainer}
                contentContainerStyle={layout.listContent}
                refreshing={isLoading}
                onRefresh={refetch}
                data={properties}
                keyExtractor={(item) => item._id || item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={layout.cardProperty}
                        onPress={() => {
                            navigation.navigate('PropertyDetail', { propertyId: item._id || item.id });

                        }}
                        activeOpacity={0.7}
                    >
                        {/* Property Header */}
                        <View style={[layout.rowBetween, { alignItems: 'flex-start', marginBottom: spacing.input }]}>
                            <View style={[layout.flex1, { marginRight: spacing.input }]}>
                                <Text style={[typography.textStyles.h5, { marginBottom: spacing.xs }]}>
                                    {item.title}
                                </Text>
                                
                                {/* Property Type Badge */}
                                <View style={[layout.badge, { backgroundColor: colors.accent.main }]}>
                                    <Text style={[typography.textStyles.caption, { 
                                        color: colors.text.inverse,
                                        fontWeight: typography.fontWeight.semibold,
                                        textTransform: 'capitalize'
                                    }]}>
                                        {item.propertyType || 'Property'}
                                    </Text>
                                </View>
                            </View>
                            
                            {/* Price */}
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={[typography.textStyles.h4, { 
                                    color: colors.success.main,
                                    marginBottom: 2
                                }]}>
                                    ₹{item.monthlyRent?.toLocaleString()}
                                </Text>
                                <Text style={[typography.textStyles.caption, { color: colors.text.secondary }]}>
                                    per month
                                </Text>
                            </View>
                        </View>

                        {/* Address */}
                        <View style={[layout.row, { marginBottom: spacing.input }]}>
                            <Text style={{ fontSize: typography.fontSize.sm, marginRight: spacing.xs }}>📍</Text>
                            <Text style={[typography.textStyles.bodySmall, { 
                                color: colors.text.secondary,
                                flex: 1
                            }]}>
                                {item.address || 'Address not specified'}
                            </Text>
                        </View>

                        {/* Property Details */}
                        <View style={layout.rowBetween}>
                            <View style={[layout.row, { gap: spacing.md }]}>
                                {item.bedRooms && (
                                    <View style={layout.row}>
                                        <Text style={{ fontSize: typography.fontSize.xs, marginRight: spacing.xs }}>🛏️</Text>
                                        <Text style={[typography.textStyles.caption, { color: colors.text.secondary }]}>
                                            {item.bedRooms} bed{item.bedRooms > 1 ? 's' : ''}
                                        </Text>
                                    </View>
                                )}
                                
                                {item.bathRooms && (
                                    <View style={layout.row}>
                                        <Text style={{ fontSize: typography.fontSize.xs, marginRight: spacing.xs }}>🚿</Text>
                                        <Text style={[typography.textStyles.caption, { color: colors.text.secondary }]}>
                                            {item.bathRooms} bath{item.bathRooms > 1 ? 's' : ''}
                                        </Text>
                                    </View>
                                )}
                                
                                {item.squareFeet && (
                                    <View style={layout.row}>
                                        <Text style={{ fontSize: typography.fontSize.xs, marginRight: spacing.xs }}>📐</Text>
                                        <Text style={[typography.textStyles.caption, { color: colors.text.secondary }]}>
                                            {item.squareFeet} sq ft
                                        </Text>
                                    </View>
                                )}
                            </View>
                            
                            {/* Arrow indicator */}
                            <Text style={[typography.textStyles.body, { color: colors.text.secondary }]}>→</Text>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={() => (
                    <View style={{ alignItems: 'center', marginTop: spacing['3xl'] }}>
                        <Text style={{ fontSize: typography.fontSize['5xl'], marginBottom: spacing.md }}>🏠</Text>
                        <Text style={[typography.textStyles.body, { color: colors.text.secondary, textAlign: 'center' }]}>
                            No properties available
                        </Text>
                    </View>
                )}
            />
            <Footer />
        </SafeAreaView>
    )
}