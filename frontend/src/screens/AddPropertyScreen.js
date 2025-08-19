import React from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, TouchableHighlight, Modal } from 'react-native';
import { colors, typography, spacing, layout } from '../styles';
import Footer from '../components/Footer';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function AddPropertyScreen() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [propertyType, setPropertyType] = useState('');
    const [furnishingStatus, setFurnishingStatus] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [monthlyRent, setMonthlyRent] = useState('');
    const [securityDeposit, setSecurityDeposit] = useState('');
    const [maintenanceFee, setMaintenanceFee] = useState('');
    const [bedRooms, setBedRooms] = useState('');
    const [bathRooms, setBathRooms] = useState('');
    // const [parking, setParking] = useState('');
    const [area, setArea] = useState('');
    const [floor, setFloor] = useState('');
    const [availableFrom, setAvailableFrom] = useState('');
    const [amenities, setAmenities] = useState([]);
    const [amenityInput, setAmenityInput] = useState('');
    
    // Dropdown states
    const [showPropertyTypeDropdown, setShowPropertyTypeDropdown] = useState(false);
    const [showFurnishingDropdown, setShowFurnishingDropdown] = useState(false);
    
    // Date picker states
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Property type options
    const propertyTypeOptions = ["house", "apartment", "villa", "room", "pg", "studio", "office", "warehouse", "other"];
    
    // Furnishing status options
    const furnishingOptions = ["fullyFurnished", "semiFurnished", "unfurnished"];

    // Add amenity function
    const addAmenity = () => {
        if (amenityInput.trim() && amenities.length < 20) {
            setAmenities([...amenities, amenityInput.trim()]);
            setAmenityInput('');
        }
    };

    // Remove amenity function
    const removeAmenity = (index) => {
        setAmenities(amenities.filter((_, i) => i !== index));
    };

    // Date picker functions
    const showDatePickerModal = () => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        
        const nextMonth = new Date(today);
        nextMonth.setMonth(today.getMonth() + 1);
        
        const nextQuarter = new Date(today);
        nextQuarter.setMonth(today.getMonth() + 3);
        
        const alertButtons = [
            {
                text: 'Cancel',
                style: 'cancel'
            }
        ];
        
        // Add clear option if date is already selected
        if (availableFrom) {
            alertButtons.push({
                text: 'Clear Date',
                style: 'destructive',
                onPress: () => {
                    setAvailableFrom('');
                }
            });
        }
        
        // Add date options
        alertButtons.push(
            {
                text: 'Tomorrow',
                onPress: () => {
                    setAvailableFrom(tomorrow.toISOString().split('T')[0]);
                }
            },
            {
                text: 'Next Week',
                onPress: () => {
                    setAvailableFrom(nextWeek.toISOString().split('T')[0]);
                }
            },
            {
                text: 'Next Month',
                onPress: () => {
                    setAvailableFrom(nextMonth.toISOString().split('T')[0]);
                }
            },
            {
                text: 'Next Quarter',
                onPress: () => {
                    setAvailableFrom(nextQuarter.toISOString().split('T')[0]);
                }
            }
        );
        
        Alert.alert(
            'Select Available Date',
            'Choose when your property will be available',
            alertButtons
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        // Check if it's today, tomorrow, or format normally
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else {
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            return date.toLocaleDateString('en-US', options);
        }
    };

    // Handle form submission
    const handleSubmit = () => {
        // TODO: Implement form submission logic
        console.log('Form submitted with:', {
            title, description, propertyType, furnishingStatus, address, city, state, postalCode,
            latitude, longitude, monthlyRent, securityDeposit, maintenanceFee, bedRooms, bathRooms,
            area, floor, availableFrom, amenities
        });
        Alert.alert('Success', 'Property form submitted! (Backend integration coming soon)');
    };

    return (
        <View style={layout.container}>
            <KeyboardAvoidingView 
                style={layout.container} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView 
                    style={layout.scrollContainer} 
                    contentContainerStyle={layout.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header Section */}
                    <View style={[layout.headerCentered, { paddingTop: spacing.xl }]}>
                        <Text style={{ fontSize: typography.fontSize['5xl'], marginBottom: spacing.md }}>🏠</Text>
                        <Text style={[typography.textStyles.h1, { color: colors.text.inverse, textAlign: 'center' }]}>
                            Add New Property
                        </Text>
                        <Text style={[typography.textStyles.body, { 
                            color: colors.primary.light, 
                            textAlign: 'center',
                            opacity: 0.9,
                            marginTop: spacing.xs 
                        }]}>
                            List your property for rent
                        </Text>
                    </View>

                    {/* Form Container */}
                    <View style={layout.formContainer}>
                        {/* Basic Details */}
                        <View style={layout.cardLarge}>
                            <Text style={[typography.textStyles.h3, { 
                                textAlign: 'center', 
                                marginBottom: spacing.xl,
                                color: colors.text.primary
                            }]}>
                                Basic Details
                            </Text>
                            
                            <View style={layout.inputGroup}>
                                <Text style={typography.textStyles.label}>
                                    Property Title
                                </Text>
                                <TextInput
                                    style={layout.input}
                                    placeholder="Enter property title"
                                    placeholderTextColor={colors.text.tertiary}
                                    value={title}
                                    onChangeText={setTitle}
                                />
                            </View>

                            <View style={layout.inputGroup}>
                                <Text style={typography.textStyles.label}>
                                    Description
                                </Text>
                                <TextInput
                                    style={[layout.input, { height: 80, textAlignVertical: 'top' }]}
                                    placeholder="Describe your property..."
                                    placeholderTextColor={colors.text.tertiary}
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>

                            <View style={layout.inputGroup}>
                                <Text style={typography.textStyles.label}>
                                    Property Type
                                </Text>
                                <TouchableOpacity 
                                    style={[layout.input, { 
                                        backgroundColor: propertyType ? colors.primary.background : colors.neutral[50],
                                        borderColor: propertyType ? colors.primary.main : colors.border.light,
                                        borderWidth: propertyType ? 2 : 2,
                                        shadowColor: propertyType ? colors.primary.main : colors.shadow,
                                        shadowOffset: { width: 0, height: propertyType ? 2 : 1 },
                                        shadowOpacity: propertyType ? 0.1 : 0.05,
                                        shadowRadius: propertyType ? 4 : 2,
                                        elevation: propertyType ? 4 : 2
                                    }]}
                                    onPress={() => setShowPropertyTypeDropdown(true)}
                                    activeOpacity={0.7}
                                >
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            {!propertyType && (
                                                <View style={{
                                                    width: 6,
                                                    height: 6,
                                                    borderRadius: 3,
                                                    backgroundColor: colors.neutral[300],
                                                    marginRight: spacing.sm
                                                }} />
                                            )}
                                            {propertyType && (
                                                <View style={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: 4,
                                                    backgroundColor: colors.primary.main,
                                                    marginRight: spacing.sm
                                                }} />
                                            )}
                                            <Text style={{ 
                                                color: propertyType ? colors.primary.dark : colors.text.tertiary,
                                                fontWeight: propertyType ? '600' : '400',
                                                fontStyle: propertyType ? 'normal' : 'italic'
                                            }}>
                                                {propertyType ? propertyType.charAt(0).toUpperCase() + propertyType.slice(1) : 'Select property type'}
                                            </Text>
                                        </View>
                                        <View style={{
                                            backgroundColor: propertyType ? colors.primary.main : colors.neutral[400],
                                            borderRadius: 12,
                                            padding: 4
                                        }}>
                                            <Ionicons 
                                                name="caret-down-outline"
                                                size={16} 
                                                color={colors.text.inverse} 
                                            />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                                

                            </View>

                            <View style={layout.inputGroup}>
                                <Text style={typography.textStyles.label}>
                                    Furnishing Status
                                </Text>
                                <TouchableOpacity 
                                    style={[layout.input, { 
                                        backgroundColor: furnishingStatus ? colors.primary.background : colors.neutral[50],
                                        borderColor: furnishingStatus ? colors.primary.main : colors.border.light,
                                        borderWidth: furnishingStatus ? 2 : 2,
                                        shadowColor: furnishingStatus ? colors.primary.main : colors.shadow,
                                        shadowOffset: { width: 0, height: furnishingStatus ? 2 : 1 },
                                        shadowOpacity: furnishingStatus ? 0.1 : 0.05,
                                        shadowRadius: furnishingStatus ? 4 : 2,
                                        elevation: furnishingStatus ? 4 : 2
                                    }]}
                                    onPress={() => setShowFurnishingDropdown(true)}
                                    activeOpacity={0.7}
                                >
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            {!furnishingStatus && (
                                                <View style={{
                                                    width: 6,
                                                    height: 6,
                                                    borderRadius: 3,
                                                    backgroundColor: colors.neutral[300],
                                                    marginRight: spacing.sm
                                                }} />
                                            )}
                                            {furnishingStatus && (
                                                <View style={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: 4,
                                                    backgroundColor: colors.primary.main,
                                                    marginRight: spacing.sm
                                                }} />
                                            )}
                                            <Text style={{ 
                                                color: furnishingStatus ? colors.primary.dark : colors.text.tertiary,
                                                fontWeight: furnishingStatus ? '600' : '400',
                                                fontStyle: furnishingStatus ? 'normal' : 'italic'
                                            }}>
                                                {furnishingStatus ? furnishingStatus.replace(/([A-Z])/g, ' $1').trim() : 'Select furnishing status'}
                                            </Text>
                                        </View>
                                        <View style={{
                                            backgroundColor: furnishingStatus ? colors.primary.main : colors.neutral[400],
                                            borderRadius: 12,
                                            padding: 4
                                        }}>
                                            <Ionicons 
                                                name="caret-down-outline"
                                                size={16} 
                                                color={colors.text.inverse} 
                                            />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                                

                            </View>

                            <View style={layout.inputGroup}>
                                <Text style={typography.textStyles.label}>
                                    Available From
                                </Text>
                                <TouchableOpacity 
                                    style={[layout.input, { 
                                        backgroundColor: availableFrom ? colors.primary.background : colors.neutral[50],
                                        borderColor: availableFrom ? colors.primary.main : colors.border.light,
                                        borderWidth: availableFrom ? 2 : 2,
                                        shadowColor: availableFrom ? colors.primary.main : colors.shadow,
                                        shadowOffset: { width: 0, height: availableFrom ? 2 : 1 },
                                        shadowOpacity: availableFrom ? 0.1 : 0.05,
                                        shadowRadius: availableFrom ? 4 : 2,
                                        elevation: availableFrom ? 4 : 2
                                    }]}
                                    onPress={showDatePickerModal}
                                    activeOpacity={0.7}
                                >
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            {!availableFrom && (
                                                <View style={{
                                                    width: 6,
                                                    height: 6,
                                                    borderRadius: 3,
                                                    backgroundColor: colors.neutral[300],
                                                    marginRight: spacing.sm
                                                }} />
                                            )}
                                            {availableFrom && (
                                                <View style={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: 4,
                                                    backgroundColor: colors.primary.main,
                                                    marginRight: spacing.sm
                                                }} />
                                            )}
                                            <Text style={{ 
                                                color: availableFrom ? colors.primary.dark : colors.text.tertiary,
                                                fontWeight: availableFrom ? '600' : '400',
                                                fontStyle: availableFrom ? 'normal' : 'italic'
                                            }}>
                                                {availableFrom ? formatDate(availableFrom) : 'Select available date'}
                                            </Text>
                                        </View>
                                        <View style={{
                                            backgroundColor: availableFrom ? colors.primary.main : colors.neutral[400],
                                            borderRadius: 12,
                                            padding: 4
                                        }}>
                                            <Ionicons 
                                                name="calendar-outline"
                                                size={16} 
                                                color={colors.text.inverse} 
                                            />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                                
                                {availableFrom && (
                                    <View style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginTop: spacing.xs,
                                        paddingHorizontal: spacing.sm
                                    }}>
                                        <Ionicons 
                                            name="checkmark-circle" 
                                            size={16} 
                                            color={colors.success.main} 
                                        />
                                        <Text style={{
                                            color: colors.success.main,
                                            fontSize: 12,
                                            marginLeft: spacing.xs,
                                            fontWeight: '500'
                                        }}>
                                            Property will be available from {formatDate(availableFrom)}
                                        </Text>
                                        <TouchableOpacity 
                                            style={{ marginLeft: spacing.sm }}
                                            onPress={() => {
                                                Alert.alert(
                                                    'Date Details',
                                                    `Selected Date: ${availableFrom}\nFormatted: ${formatDate(availableFrom)}`,
                                                    [{ text: 'OK' }]
                                                );
                                            }}
                                        >
                                            <Ionicons 
                                                name="information-circle" 
                                                size={14} 
                                                color={colors.success.main} 
                                            />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Location Details */}
                        <View style={layout.cardLarge}>
                            <Text style={[typography.textStyles.h3, { 
                                textAlign: 'center', 
                                marginBottom: spacing.xl,
                                color: colors.text.primary
                            }]}>
                                Location Details
                            </Text>
                            
                            <View style={layout.inputGroup}>
                                <Text style={typography.textStyles.label}>
                                    Address
                                </Text>
                                <TextInput
                                    style={layout.input}
                                    placeholder="Enter full address"
                                    placeholderTextColor={colors.text.tertiary}
                                    value={address}
                                    onChangeText={setAddress}
                                />
                            </View>

                            <View style={layout.inputGroup}>
                                <Text style={typography.textStyles.label}>
                                    City
                                </Text>
                                <TextInput
                                    style={layout.input}
                                    placeholder="Enter city"
                                    placeholderTextColor={colors.text.tertiary}
                                    value={city}
                                    onChangeText={setCity}
                                />
                            </View>

                            <View style={layout.inputGroup}>
                                <Text style={typography.textStyles.label}>
                                    State
                                </Text>
                                <TextInput
                                    style={layout.input}
                                    placeholder="Enter state"
                                    placeholderTextColor={colors.text.tertiary}
                                    value={state}
                                    onChangeText={setState}
                                />
                            </View>

                            <View style={layout.inputGroup}>
                                <Text style={typography.textStyles.label}>
                                    Postal Code
                                </Text>
                                <TextInput
                                    style={layout.input}
                                    placeholder="Enter postal code"
                                    placeholderTextColor={colors.text.tertiary}
                                    value={postalCode}
                                    onChangeText={setPostalCode}
                                />
                            </View>

                            <View style={layout.inputGroup}>
                                <Text style={typography.textStyles.label}>
                                    Coordinates
                                    <TouchableOpacity onPress={() => {
                                        Alert.alert('Coordinates Help', 'Find latitude and longitude on Google Maps by long pressing on the map location.');
                                    }}>
                                        <Ionicons name="information-circle" size={16} color={colors.text.secondary} style={{ marginLeft: spacing.xs }} />
                                    </TouchableOpacity>
                                </Text>
                                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                                    <View style={{ flex: 1 }}>
                                        <TextInput
                                            style={layout.input}
                                            placeholder="Latitude"
                                            placeholderTextColor={colors.text.tertiary}
                                            value={latitude}
                                            onChangeText={setLatitude}
                                            keyboardType="numeric"
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <TextInput
                                            style={layout.input}
                                            placeholder="Longitude"
                                            placeholderTextColor={colors.text.tertiary}
                                            value={longitude}
                                            onChangeText={setLongitude}
                                            keyboardType="numeric"
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Rent Details */}
                        <View style={layout.cardLarge}>
                            <Text style={[typography.textStyles.h3, { 
                                textAlign: 'center', 
                                marginBottom: spacing.xl,
                                color: colors.text.primary
                            }]}>
                                Financial Details
                            </Text>
                            
                            <View style={layout.inputGroup}>
                                <Text style={typography.textStyles.label}>
                                    Monthly Rent
                                </Text>
                                <TextInput
                                    style={layout.input}
                                    placeholder="Enter monthly rent amount"
                                    placeholderTextColor={colors.text.tertiary}
                                    value={monthlyRent}
                                    onChangeText={setMonthlyRent}
                                    keyboardType="numeric"
                                />
                            </View>

                            <View style={layout.inputGroup}>
                                <Text style={typography.textStyles.label}>
                                    Security Deposit
                                </Text>
                                <TextInput
                                    style={layout.input}
                                    placeholder="Enter security deposit amount"
                                    placeholderTextColor={colors.text.tertiary}
                                    value={securityDeposit}
                                    onChangeText={setSecurityDeposit}
                                    keyboardType="numeric"
                                />
                            </View>

                            <View style={layout.inputGroup}>
                                <Text style={typography.textStyles.label}>
                                    Maintenance Fee
                                </Text>
                                <TextInput
                                    style={layout.input}    
                                    placeholder="Enter maintenance fee (optional)"
                                    placeholderTextColor={colors.text.tertiary}
                                    value={maintenanceFee}
                                    onChangeText={setMaintenanceFee}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        {/* Property Details */}
                        <View style={layout.cardLarge}>
                            <Text style={[typography.textStyles.h3, { 
                                textAlign: 'center', 
                                marginBottom: spacing.xl,
                                color: colors.text.primary
                            }]}>
                                Property Specifications
                            </Text>
                            
                            <View style={layout.inputGroup}>
                                <Text style={typography.textStyles.label}>
                                    Bedrooms
                                </Text>
                                <TextInput
                                    style={layout.input}
                                    placeholder="Enter number of bedrooms"
                                    placeholderTextColor={colors.text.tertiary}
                                    value={bedRooms}
                                    onChangeText={setBedRooms}
                                    keyboardType="numeric"
                                />
                            </View>

                            <View style={layout.inputGroup}>
                                <Text style={typography.textStyles.label}>
                                    Bathrooms
                                </Text>
                                <TextInput
                                    style={layout.input}
                                    placeholder="Enter number of bathrooms"
                                    placeholderTextColor={colors.text.tertiary}
                                    value={bathRooms}
                                    onChangeText={setBathRooms}
                                    keyboardType="numeric"
                                />
                            </View>

                            <View style={layout.inputGroup}>
                                <Text style={typography.textStyles.label}>
                                    Area (sq ft)
                                </Text>
                                <TextInput
                                    style={layout.input}
                                    placeholder="Enter area in square feet"
                                    placeholderTextColor={colors.text.tertiary}
                                    value={area}
                                    onChangeText={setArea}
                                    keyboardType="numeric"
                                />
                            </View>

                            <View style={layout.inputGroup}>
                                <Text style={typography.textStyles.label}>
                                    Floor
                                </Text>
                                <TextInput
                                    style={layout.input}
                                    placeholder="Enter floor number (optional)"
                                    placeholderTextColor={colors.text.tertiary}
                                    value={floor}
                                    onChangeText={setFloor}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        {/* Amenities */}
                        <View style={layout.cardLarge}>
                            <Text style={[typography.textStyles.h3, { 
                                textAlign: 'center', 
                                marginBottom: spacing.xl,
                                color: colors.text.primary
                            }]}>
                                Amenities
                            </Text>
                            
                            <View style={layout.inputGroup}>
                                <Text style={typography.textStyles.label}>
                                    Add Amenity
                                </Text>
                                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                                    <TextInput
                                        style={[layout.input, { flex: 1 }]}
                                        placeholder="e.g., WiFi, Parking, Gym"
                                        placeholderTextColor={colors.text.tertiary}
                                        value={amenityInput}
                                        onChangeText={setAmenityInput}
                                    />
                                    <TouchableOpacity 
                                        style={[layout.buttonPrimary, { 
                                            paddingHorizontal: spacing.lg,
                                            minWidth: 80
                                        }]}
                                        onPress={addAmenity}
                                    >
                                        <Text style={[typography.textStyles.button, { color: colors.text.inverse }]}>
                                            Add
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            
                            {/* Display added amenities */}
                            {amenities.length > 0 && (
                                <View style={{ marginTop: spacing.md }}>
                                    <Text style={[typography.textStyles.body, { 
                                        color: colors.text.secondary,
                                        marginBottom: spacing.sm
                                    }]}>
                                        Added Amenities ({amenities.length}/20):
                                    </Text>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
                                        {amenities.map((amenity, index) => (
                                            <View key={index} style={{
                                                backgroundColor: colors.primary.light,
                                                paddingHorizontal: spacing.sm,
                                                paddingVertical: spacing.xs,
                                                borderRadius: 20,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                gap: spacing.xs
                                            }}>
                                                <Text style={{ color: colors.primary.dark, fontSize: 12 }}>
                                                    {amenity}
                                                </Text>
                                                <TouchableOpacity onPress={() => removeAmenity(index)}>
                                                    <Ionicons name="close-circle" size={16} color={colors.error.main} />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}
                        </View>

                        {/* Submit Button */}
                        <View style={layout.cardLarge}>
                            <TouchableOpacity 
                                style={[layout.buttonPrimary, { 
                                    paddingVertical: spacing.lg,
                                    alignItems: 'center'
                                }]}
                                onPress={handleSubmit}
                            >
                                <Text style={[typography.textStyles.button, { 
                                    color: colors.text.inverse,
                                    fontWeight: 'bold'
                                }]}>
                                    Submit Property
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Bottom Spacer */}
                        <View style={{ height: spacing.xl }} />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
            
            <Footer />

            {showPropertyTypeDropdown && (
                <TouchableWithoutFeedback onPress={() => setShowPropertyTypeDropdown(false)}>
                    <View style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000
                    }}>
                        <View style={{
                            backgroundColor: colors.background.primary,
                            borderRadius: 16,
                            padding: spacing.lg,
                            width: '90%',
                            maxWidth: 400,
                            shadowColor: colors.shadow,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.2,
                            shadowRadius: 16,
                            elevation: 10,
                            alignItems: 'center'
                        }}>
                            <Text style={[typography.textStyles.h3, { 
                                marginBottom: spacing.md,
                                color: colors.text.primary,
                                textAlign: 'center'
                            }]}>
                                Select Property Type
                            </Text>
                            
                            {/* Quick Date Options */}
                            <View style={{ 
                                flexDirection: 'row', 
                                flexWrap: 'wrap', 
                                gap: spacing.sm, 
                                marginBottom: spacing.md,
                                justifyContent: 'center'
                            }}>
                                {propertyTypeOptions.map((option, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={{
                                            backgroundColor: colors.primary.light,
                                            paddingHorizontal: spacing.md,
                                            paddingVertical: spacing.sm,
                                            borderRadius: 20,
                                            borderWidth: 1,
                                            borderColor: colors.primary.main
                                        }}
                                        onPress={() => {
                                            setPropertyType(option);
                                            setShowPropertyTypeDropdown(false);
                                        }}
                                    >
                                        <Text style={{
                                            color: colors.primary.dark,
                                            fontSize: 12,
                                            fontWeight: '600'
                                        }}>
                                            {option.charAt(0).toUpperCase() + option.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            
                            <TouchableOpacity 
                                style={[layout.buttonPrimary, { 
                                    paddingVertical: spacing.sm,
                                    paddingHorizontal: spacing.lg,
                                    width: '100%'
                                }]}
                                onPress={() => setShowPropertyTypeDropdown(false)}
                            >
                                <Text style={[typography.textStyles.button, { color: colors.text.inverse }]}>
                                    Done
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            )}

            {showFurnishingDropdown && (
                <TouchableWithoutFeedback onPress={() => setShowFurnishingDropdown(false)}>
                    <View style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000
                    }}>
                        <View style={{
                            backgroundColor: colors.background.primary,
                            borderRadius: 16,
                            padding: spacing.lg,
                            width: '90%',
                            maxWidth: 400,
                            shadowColor: colors.shadow,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.2,
                            shadowRadius: 16,
                            elevation: 10,
                            alignItems: 'center'
                        }}>
                            <Text style={[typography.textStyles.h3, { 
                                marginBottom: spacing.md,
                                color: colors.text.primary,
                                textAlign: 'center'
                            }]}>
                                Select Furnishing Status
                            </Text>
                            
                            {/* Quick Date Options */}
                            <View style={{ 
                                flexDirection: 'row', 
                                flexWrap: 'wrap', 
                                gap: spacing.sm, 
                                marginBottom: spacing.md,
                                justifyContent: 'center'
                            }}>
                                {furnishingOptions.map((option, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={{
                                            backgroundColor: colors.primary.light,
                                            paddingHorizontal: spacing.md,
                                            paddingVertical: spacing.sm,
                                            borderRadius: 20,
                                            borderWidth: 1,
                                            borderColor: colors.primary.main
                                        }}
                                        onPress={() => {
                                            setFurnishingStatus(option);
                                            setShowFurnishingDropdown(false);
                                        }}
                                    >
                                        <Text style={{
                                            color: colors.primary.dark,
                                            fontSize: 12,
                                            fontWeight: '600'
                                        }}>
                                            {option.charAt(0).toUpperCase() + option.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            
                            <TouchableOpacity 
                                style={[layout.buttonPrimary, { 
                                    paddingVertical: spacing.sm,
                                    paddingHorizontal: spacing.lg,
                                    width: '100%'
                                }]}
                                onPress={() => setShowFurnishingDropdown(false)}
                            >
                                <Text style={[typography.textStyles.button, { color: colors.text.inverse }]}>
                                    Done
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            )}

            {showDatePicker && (
                <TouchableWithoutFeedback onPress={() => setShowDatePicker(false)}>
                    <View style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000
                    }}>
                        <View style={{
                            backgroundColor: colors.background.primary,
                            borderRadius: 16,
                            padding: spacing.lg,
                            width: '90%',
                            maxWidth: 400,
                            shadowColor: colors.shadow,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.2,
                            shadowRadius: 16,
                            elevation: 10,
                            alignItems: 'center'
                        }}>
                            <Text style={[typography.textStyles.h3, { 
                                marginBottom: spacing.md,
                                color: colors.text.primary,
                                textAlign: 'center'
                            }]}>
                                Select Available Date
                            </Text>
                            
                            {/* Quick Date Options */}
                            <View style={{ 
                                flexDirection: 'row', 
                                flexWrap: 'wrap', 
                                gap: spacing.sm, 
                                marginBottom: spacing.md,
                                justifyContent: 'center'
                            }}>
                                {[
                                    { label: 'Tomorrow', days: 1 },
                                    { label: 'Next Week', days: 7 },
                                    { label: 'Next Month', days: 30 },
                                    { label: 'Next Quarter', days: 90 }
                                ].map((option, index) => {
                                    const date = new Date();
                                    date.setDate(date.getDate() + option.days);
                                    const dateString = date.toISOString().split('T')[0];
                                    
                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            style={{
                                                backgroundColor: colors.primary.light,
                                                paddingHorizontal: spacing.md,
                                                paddingVertical: spacing.sm,
                                                borderRadius: 20,
                                                borderWidth: 1,
                                                borderColor: colors.primary.main
                                            }}
                                            onPress={() => {
                                                setAvailableFrom(dateString);
                                                setShowDatePicker(false);
                                            }}
                                        >
                                            <Text style={{
                                                color: colors.primary.dark,
                                                fontSize: 12,
                                                fontWeight: '600'
                                            }}>
                                                {option.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                            
                            <TouchableOpacity 
                                style={[layout.buttonPrimary, { 
                                    paddingVertical: spacing.sm,
                                    paddingHorizontal: spacing.lg,
                                    width: '100%'
                                }]}
                                onPress={() => setShowDatePicker(false)}
                            >
                                <Text style={[typography.textStyles.button, { color: colors.text.inverse }]}>
                                    Done
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            )}
        </View>
    );
}
