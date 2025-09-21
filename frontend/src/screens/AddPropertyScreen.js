import React from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, TouchableHighlight, Modal, ActivityIndicator } from 'react-native';
import { colors, typography, spacing, layout } from '../styles';
import Footer from '../components/Footer';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';
import { Calendar } from 'react-native-calendars';
import useCreateProperty from '../hooks/createProperty';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/authSlice';

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
    const [area, setArea] = useState('');
    const [floor, setFloor] = useState('');
    const [availableFrom, setAvailableFrom] = useState('');
    const [amenities, setAmenities] = useState([]);
    const [amenityInput, setAmenityInput] = useState('');

    const [errors, setErrors] = useState({});
    const [showErrors, setShowErrors] = useState(false);

    const { mutate: createProperty, isLoading, error, isSuccess } = useCreateProperty();   
    const validateForm = () => {
        const errors = {};
        if (!title.trim()) {
            errors.title = 'Property title is required';
        }
        if (!description.trim()) {
            errors.description = 'Description is required';
        }
        if (!propertyType) {
            errors.propertyType = 'Property type is required';
        }
        if (!furnishingStatus) {
            errors.furnishingStatus = 'Furnishing status is required';
        }
        if (!address.trim()) {
            errors.address = 'Address is required';
        }
        if (!city.trim()) {
            errors.city = 'City is required';
        }
        if (!state.trim()) {
            errors.state = 'State is required';
        }
        if (!postalCode.trim()) {
            errors.postalCode = 'Postal code is required';
        }
        if (!monthlyRent) {
            errors.monthlyRent = 'Monthly rent is required';
        }
        if (!securityDeposit) {
            errors.securityDeposit = 'Security deposit is required';
        }
        if (!bedRooms) {
            errors.bedRooms = 'Number of bedrooms is required';
        }
        if (!bathRooms) {
            errors.bathRooms = 'Number of bathrooms is required';
        }
        if (!area) {
            errors.area = 'Property area is required';
        }   
        // Latitude and Longitude are optional but must be valid if provided
        if (latitude && (parseFloat(latitude) < -90 || parseFloat(latitude) > 90)) {
            errors.latitude = 'Latitude must be between -90 and 90';
        }
        if (longitude && (parseFloat(longitude) < -180 || parseFloat(longitude) > 180)) {
            errors.longitude = 'Longitude must be between -180 and 180';
        }
        if (!monthlyRent || parseFloat(monthlyRent) <= 0) {
            errors.monthlyRent = 'Monthly rent must be greater than 0';
        }
        if (!securityDeposit || parseFloat(securityDeposit) < 0) {
            errors.securityDeposit = 'Security deposit cannot be negative';
        }
        if (!maintenanceFee && parseFloat(maintenanceFee) < 0) {
            errors.maintenanceFee = 'Maintenance fee cannot be negative';
        }
        if (!bedRooms || parseInt(bedRooms) < 0) {
            errors.bedRooms = 'Bedrooms cannot be negative';
        }
        if (!bathRooms || parseInt(bathRooms) < 1) {
            errors.bathRooms = 'Bathrooms must be at least 1';
        }
        if (!area || parseFloat(area) < 50) {
            errors.area = 'Area must be at least 50 square feet';
        }
        // Floor is optional but must be valid if provided
        if (floor && parseInt(floor) < 0) {
            errors.floor = 'Floor number cannot be negative';
        }
        // Available From is optional but should be a valid date if provided
        if (availableFrom) {
            const selectedDate = new Date(availableFrom);
            const today = new Date();
            if (selectedDate < today) {
                errors.availableFrom = 'Available date cannot be in the past';
            }
        }
        setErrors(errors);
        setShowErrors(true);
        return Object.keys(errors).length === 0;
    };
    
    // Dropdown states
    const [propertyTypeOpen, setPropertyTypeOpen] = useState(false);
    const [furnishingOpen, setFurnishingOpen] = useState(false);
    
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

    // Form sections data for FlatList
    const formSections = [
        {
            id: 'header',
            type: 'header',
            title: 'Add New Property',
            subtitle: 'List your property for rent'
        },
        {
            id: 'basic',
            type: 'section',
            title: 'Basic Details'
        },
        {
            id: 'location',
            type: 'section',
            title: 'Location Details'
        },
        {
            id: 'pricing',
            type: 'section',
            title: 'Pricing & Details'
        },
        {
            id: 'amenities',
            type: 'section',
            title: 'Amenities'
        }
    ];

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

    const isAuthenticated = useSelector(selectIsAuthenticated);
    if (!isAuthenticated) {
        Alert.alert('Error', 'You must be logged in to create a property');
        return;
    }
    // Handle form submission
    const handleSubmit = () => {
        if (!validateForm()) {
            return;
        }
        
        // TODO: Implement form submission logic
        createProperty({
            title, 
            description, 
            propertyType, 
            furnishingStatus, 
            address, 
            city, 
            state, 
            postalCode,
            coordinates: {  
                latitude: parseFloat(latitude) || undefined,
                longitude: parseFloat(longitude) || undefined
            },
            monthlyRent: parseFloat(monthlyRent),  
            securityDeposit: parseFloat(securityDeposit),  
            maintenanceFee: parseFloat(maintenanceFee) || undefined,  
            bedRooms: parseInt(bedRooms),  
            bathRooms: parseInt(bathRooms),  
            area: parseFloat(area),  
            floor: parseInt(floor) || undefined,  
            availableFrom, 
            amenities
        });
    };
    //useEffect to show success or error message after submission
    useEffect(() => {
        if (isSuccess) {
            Alert.alert('Success', 'Property submitted!');
            //reset form after 3 seconds
            setTimeout(() => {
                setTitle('');
                setDescription('');
                setPropertyType('');
                setFurnishingStatus('');
                setAddress('');
                setCity('');
                setState('');
                setPostalCode('');
                setLatitude('');
                setLongitude('');
                setMonthlyRent('');
                setSecurityDeposit('');
                setMaintenanceFee('');
                setBedRooms('');
                setBathRooms('');
                setArea('');
                setFloor('');
                setAvailableFrom('');
                setAmenities([]);
                setAmenityInput('');
            }, 3000);
        }
    }, [isSuccess]);
    useEffect(() => {
        if (error) {
            Alert.alert('Error: ', error.message || 'Failed to submit.');
        }
    }, [error]);

    // Render form section
    const renderFormSection = ({ item }) => {
        switch (item.type) {
            case 'header':
                return (
                    <View style={[layout.headerCentered, { paddingTop: spacing.xl, paddingHorizontal: spacing.md }]}>
                        <Text style={[typography.textStyles.h1, { color: colors.text.inverse, textAlign: 'center', width: '100%' }]}>
                            {item.title}
                        </Text>
                        <Text style={[typography.textStyles.body, { 
                            color: colors.primary.light, 
                            textAlign: 'center',
                            opacity: 0.9,
                            marginTop: spacing.xs 
                        }]}>
                            {item.subtitle}
                        </Text>
                    </View>
                );
            
            case 'section':
                return (
                    <View style={layout.cardLarge}>
                        <Text style={[typography.textStyles.h3, { 
                            textAlign: 'center', 
                            marginBottom: spacing.xl,
                            color: colors.text.primary
                        }]}>
                            {item.title}
                        </Text>
                        
                        {item.id === 'basic' && (
                            <>
                                <View style={layout.inputGroup}>
                                    <Text style={typography.textStyles.label}>
                                        Property Title
                                    </Text>
                                    <TextInput
                                        style={[
                                            layout.input,
                                            showErrors && errors.title && { 
                                                borderColor: colors.error.main,
                                                backgroundColor: colors.error.light 
                                            }
                                        ]}
                                        placeholder="Enter property title"
                                        placeholderTextColor={colors.text.tertiary}
                                        value={title}
                                        onChangeText={setTitle}
                                    />
                                    {showErrors && errors.title && (
                                        <Text style={{ color: colors.error.main, fontSize: 12, marginTop: spacing.xs }}>
                                            {errors.title}
                                        </Text>
                                    )}
                                </View>

                                <View style={layout.inputGroup}>
                                    <Text style={typography.textStyles.label}>
                                        Description
                                    </Text>
                                    <TextInput
                                        style={[
                                            layout.input, 
                                            { height: 80, textAlignVertical: 'top' },
                                            showErrors && errors.description && { 
                                                borderColor: colors.error.main,
                                                backgroundColor: colors.error.light 
                                            }
                                        ]}
                                        placeholder="Describe your property..."
                                        placeholderTextColor={colors.text.tertiary}
                                        value={description}
                                        onChangeText={setDescription}
                                        multiline
                                        numberOfLines={3}
                                    />
                                    {showErrors && errors.description && (
                                        <Text style={{ color: colors.error.main, fontSize: 12, marginTop: spacing.xs }}>
                                            {errors.description}
                                        </Text>
                                    )}
                                </View>

                                <View style={layout.inputGroup}>
                                    <Text style={typography.textStyles.label}>
                                        Property Type
                                    </Text>
                                                                            <DropDownPicker
                                        open={propertyTypeOpen}
                                        value={propertyType}
                                        items={propertyTypeOptions.map(type => ({
                                            label: type.charAt(0).toUpperCase() + type.slice(1),
                                            value: type
                                        }))}
                                        setOpen={setPropertyTypeOpen}
                                        onOpen={() => setFurnishingOpen(false)}
                                        setValue={setPropertyType}
                                        style={[
                                            layout.input,
                                            showErrors && errors.propertyType && { 
                                                borderColor: colors.error.main,
                                                backgroundColor: colors.error.light 
                                            }
                                        ]}
                                        dropDownContainerStyle={{
                                            borderColor: showErrors && errors.propertyType ? colors.error.main : colors.border.light,
                                            borderWidth: 2,
                                            backgroundColor: showErrors && errors.propertyType ? colors.error.light : colors.neutral[50],
                                            shadowColor: colors.shadow,
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.1,
                                            shadowRadius: 4,
                                            elevation: 4,
                                        }}
                                        placeholder="Select property type"
                                        placeholderStyle={{ color: colors.text.tertiary }}
                                        zIndex={3000}
                                        zIndexInverse={1000}
                                        listMode="SCROLLVIEW"
                                        scrollViewProps={{
                                            nestedScrollEnabled: true,
                                        }}
                                    />
                                    {showErrors && errors.propertyType && (
                                        <Text style={{ color: colors.error.main, fontSize: 12, marginTop: spacing.xs }}>
                                            {errors.propertyType}
                                        </Text>
                                    )}
                                </View>

                                <View style={layout.inputGroup}>
                                    <Text style={typography.textStyles.label}>
                                        Furnishing Status
                                    </Text>
                                                                            <DropDownPicker
                                        open={furnishingOpen}
                                        value={furnishingStatus}
                                        items={furnishingOptions.map(status => ({
                                            label: status.charAt(0).toUpperCase() + status.slice(1).replace(/([A-Z])/g, ' $1'),
                                            value: status
                                        }))}
                                        setOpen={setFurnishingOpen}
                                        onOpen={() => setPropertyTypeOpen(false)}
                                        setValue={setFurnishingStatus}
                                        style={[
                                            layout.input,
                                            showErrors && errors.furnishingStatus && { 
                                                borderColor: colors.error.main,
                                                backgroundColor: colors.error.light 
                                            }
                                        ]}
                                        dropDownContainerStyle={{
                                            borderColor: showErrors && errors.furnishingStatus ? colors.error.main : colors.border.light,
                                            borderWidth: 2,
                                            backgroundColor: showErrors && errors.furnishingStatus ? colors.error.light : colors.neutral[50],
                                            shadowColor: colors.shadow,
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.1,
                                            shadowRadius: 4,
                                            elevation: 4,
                                        }}
                                        placeholder="Select furnishing status"
                                        placeholderStyle={{ color: colors.text.tertiary }}
                                        zIndex={2000}
                                        zIndexInverse={2000}
                                        listMode="SCROLLVIEW"
                                        scrollViewProps={{
                                            nestedScrollEnabled: true,
                                        }}
                                    />
                                    {showErrors && errors.furnishingStatus && (
                                        <Text style={{ color: colors.error.main, fontSize: 12, marginTop: spacing.xs }}>
                                            {errors.furnishingStatus}
                                        </Text>
                                    )}
                                </View>

                                <View style={layout.inputGroup}>
                                    <Text style={typography.textStyles.label}>
                                        Available From
                                    </Text>
                                    <TouchableOpacity 
                                        style={[
                                            layout.input, 
                                            { 
                                                backgroundColor: showErrors && errors.availableFrom ? colors.error.light : (availableFrom ? colors.primary.background : colors.neutral[50]),
                                                borderColor: showErrors && errors.availableFrom ? colors.error.main : (availableFrom ? colors.primary.main : colors.border.light),
                                                borderWidth: 2,
                                                shadowColor: showErrors && errors.availableFrom ? colors.error.main : (availableFrom ? colors.primary.main : colors.shadow),
                                                shadowOffset: { width: 0, height: availableFrom ? 2 : 1 },
                                                shadowOpacity: availableFrom ? 0.1 : 0.05,
                                                shadowRadius: availableFrom ? 4 : 2,
                                                elevation: availableFrom ? 4 : 2,
                                                justifyContent: 'center',
                                                alignItems: 'center'
                                            }
                                        ]}
                                        onPress={() => setShowDatePicker(true)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={{ 
                                            flexDirection: 'row', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center',
                                            width: '100%'
                                        }}>
                                            <View style={{ 
                                                flexDirection: 'row', 
                                                alignItems: 'center',
                                                flex: 1
                                            }}>
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
                                                    fontStyle: availableFrom ? 'normal' : 'italic',
                                                    fontSize: 16,
                                                    flex: 1
                                                }}>
                                                    {availableFrom ? formatDate(availableFrom) : 'Select available date'}
                                                </Text>
                                            </View>
                                            <View style={{
                                                backgroundColor: availableFrom ? colors.primary.main : colors.neutral[400],
                                                borderRadius: 12,
                                                padding: 6,
                                                marginLeft: spacing.sm
                                            }}>
                                                <Ionicons 
                                                    name="calendar-outline"
                                                    size={18} 
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
                                        </View>
                                    )}
                                    {showErrors && errors.availableFrom && (
                                        <Text style={{ color: colors.error.main, fontSize: 12, marginTop: spacing.xs }}>
                                            {errors.availableFrom}
                                        </Text>
                                    )}
                                </View>
                            </>
                        )}
                        
                        {item.id === 'location' && (
                            <>
                                <View style={layout.inputGroup}>
                                    <Text style={typography.textStyles.label}>
                                        Address
                                    </Text>
                                    <TextInput
                                        style={[
                                            layout.input,
                                            showErrors && errors.address && { 
                                                borderColor: colors.error.main,
                                                backgroundColor: colors.error.light 
                                            }
                                        ]}
                                        placeholder="Enter full address"
                                        placeholderTextColor={colors.text.tertiary}
                                        value={address}
                                        onChangeText={setAddress}
                                    />
                                    {showErrors && errors.address && (
                                        <Text style={{ color: colors.error.main, fontSize: 12, marginTop: spacing.xs }}>
                                            {errors.address}
                                        </Text>
                                    )}
                                </View>

                                <View style={layout.inputGroup}>
                                    <Text style={typography.textStyles.label}>
                                        City
                                    </Text>
                                    <TextInput
                                        style={[
                                            layout.input,
                                            showErrors && errors.city && { 
                                                borderColor: colors.error.main,
                                                backgroundColor: colors.error.light 
                                            }
                                        ]}
                                        placeholder="Enter city"
                                        placeholderTextColor={colors.text.tertiary}
                                        value={city}
                                        onChangeText={setCity}
                                    />
                                    {showErrors && errors.city && (
                                        <Text style={{ color: colors.error.main, fontSize: 12, marginTop: spacing.xs }}>
                                            {errors.city}
                                        </Text>
                                    )}
                                </View>

                                <View style={layout.inputGroup}>
                                    <Text style={typography.textStyles.label}>
                                        State
                                    </Text>
                                    <TextInput
                                        style={[
                                            layout.input,
                                            showErrors && errors.state && { 
                                                borderColor: colors.error.main,
                                                backgroundColor: colors.error.light 
                                            }
                                        ]}
                                        placeholder="Enter state"
                                        placeholderTextColor={colors.text.tertiary}
                                        value={state}
                                        onChangeText={setState}
                                    />
                                    {showErrors && errors.state && (
                                        <Text style={{ color: colors.error.main, fontSize: 12, marginTop: spacing.xs }}>
                                            {errors.state}
                                        </Text>
                                    )}
                                </View>

                                <View style={layout.inputGroup}>
                                    <Text style={typography.textStyles.label}>
                                        Postal Code
                                    </Text>
                                    <TextInput
                                        style={[
                                            layout.input,
                                            showErrors && errors.postalCode && { 
                                                borderColor: colors.error.main,
                                                backgroundColor: colors.error.light 
                                            }
                                        ]}
                                        placeholder="Enter postal code"
                                        placeholderTextColor={colors.text.tertiary}
                                        value={postalCode}
                                        onChangeText={setPostalCode}
                                    />
                                    {showErrors && errors.postalCode && (
                                        <Text style={{ color: colors.error.main, fontSize: 12, marginTop: spacing.xs }}>
                                            {errors.postalCode}
                                        </Text>
                                    )}
                                </View>

                                <View style={layout.inputGroup}>
                                    <Text style={[typography.textStyles.label, { 
                                        fontSize: 16, 
                                        fontWeight: '600',
                                        color: colors.text.secondary,
                                        marginBottom: spacing.sm,
                                        marginTop: spacing.md
                                    }]}>
                                        Coordinates
                                    </Text>
                                    <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[typography.textStyles.label, { fontSize: 14, marginBottom: spacing.xs }]}>
                                                Latitude
                                            </Text>
                                            <TextInput
                                                style={[
                                                    layout.input,
                                                    showErrors && errors.latitude && { 
                                                        borderColor: colors.error.main,
                                                        backgroundColor: colors.error.light 
                                                    }
                                                ]}
                                                placeholder="40.7128"
                                                placeholderTextColor={colors.text.tertiary}
                                                value={latitude}
                                                onChangeText={setLatitude}
                                                keyboardType="numeric"
                                            />
                                            {showErrors && errors.latitude && (
                                                <Text style={{ color: colors.error.main, fontSize: 12, marginTop: spacing.xs }}>
                                                    {errors.latitude}
                                                </Text>
                                            )}
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[typography.textStyles.label, { fontSize: 14, marginBottom: spacing.xs }]}>
                                                Longitude
                                            </Text>
                                            <TextInput
                                                style={[
                                                    layout.input,
                                                    showErrors && errors.longitude && { 
                                                        borderColor: colors.error.main,
                                                        backgroundColor: colors.error.light 
                                                    }
                                                ]}
                                                placeholder="-74.0060"
                                                placeholderTextColor={colors.text.tertiary}
                                                value={longitude}
                                                onChangeText={setLongitude}
                                                keyboardType="numeric"
                                            />
                                            {showErrors && errors.longitude && (
                                                <Text style={{ color: colors.error.main, fontSize: 12, marginTop: spacing.xs }}>
                                                    {errors.longitude}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                    
                                </View>
                            </>
                        )}
                        
                        {item.id === 'pricing' && (
                            <>
                                <View style={layout.inputGroup}>
                                    <Text style={typography.textStyles.label}>
                                        Monthly Rent
                                    </Text>
                                    <TextInput
                                        style={[
                                            layout.input,
                                            showErrors && errors.monthlyRent && { 
                                                borderColor: colors.error.main,
                                                backgroundColor: colors.error.light 
                                            }
                                        ]}
                                        placeholder="Enter monthly rent amount"
                                        placeholderTextColor={colors.text.tertiary}
                                        value={monthlyRent}
                                        onChangeText={setMonthlyRent}
                                        keyboardType="numeric"
                                    />
                                    {showErrors && errors.monthlyRent && (
                                        <Text style={{ color: colors.error.main, fontSize: 12, marginTop: spacing.xs }}>
                                            {errors.monthlyRent}
                                        </Text>
                                    )}
                                </View>

                                <View style={layout.inputGroup}>
                                    <Text style={typography.textStyles.label}>
                                        Security Deposit
                                    </Text>
                                    <TextInput
                                        style={[
                                            layout.input,
                                            showErrors && errors.securityDeposit && { 
                                                borderColor: colors.error.main,
                                                backgroundColor: colors.error.light 
                                            }
                                        ]}
                                        placeholder="Enter security deposit amount"
                                        placeholderTextColor={colors.text.tertiary}
                                        value={securityDeposit}
                                        onChangeText={setSecurityDeposit}
                                        keyboardType="numeric"
                                    />
                                    {showErrors && errors.securityDeposit && (
                                        <Text style={{ color: colors.error.main, fontSize: 12, marginTop: spacing.xs }}>
                                            {errors.securityDeposit}
                                        </Text>
                                    )}
                                </View>

                                <View style={layout.inputGroup}>
                                    <Text style={typography.textStyles.label}>
                                        Maintenance Fee
                                    </Text>
                                    <TextInput
                                        style={[
                                            layout.input,
                                            showErrors && errors.maintenanceFee && { 
                                                borderColor: colors.error.main,
                                                backgroundColor: colors.error.light 
                                            }
                                        ]}
                                        placeholder="Enter maintenance fee (optional)"
                                        placeholderTextColor={colors.text.tertiary}
                                        value={maintenanceFee}
                                        onChangeText={setMaintenanceFee}
                                        keyboardType="numeric"
                                    />
                                    {showErrors && errors.maintenanceFee && (
                                        <Text style={{ color: colors.error.main, fontSize: 12, marginTop: spacing.xs }}>
                                            {errors.maintenanceFee}
                                        </Text>
                                    )}
                                </View>

                                <View style={layout.inputGroup}>
                                    <Text style={typography.textStyles.label}>
                                        Bedrooms
                                    </Text>
                                    <TextInput
                                        style={[
                                            layout.input,
                                            showErrors && errors.bedRooms && { 
                                                borderColor: colors.error.main,
                                                backgroundColor: colors.error.light 
                                            }
                                        ]}
                                        placeholder="Number of bedrooms"
                                        placeholderTextColor={colors.text.tertiary}
                                        value={bedRooms}
                                        onChangeText={setBedRooms}
                                        keyboardType="numeric"
                                    />
                                    {showErrors && errors.bedRooms && (
                                        <Text style={{ color: colors.error.main, fontSize: 12, marginTop: spacing.xs }}>
                                            {errors.bedRooms}
                                        </Text>
                                    )}
                                </View>

                                <View style={layout.inputGroup}>
                                    <Text style={typography.textStyles.label}>
                                        Bathrooms
                                    </Text>
                                    <TextInput
                                        style={[
                                            layout.input,
                                            showErrors && errors.bathRooms && { 
                                                borderColor: colors.error.main,
                                                backgroundColor: colors.error.light 
                                            }
                                        ]}
                                        placeholder="Number of bathrooms"
                                        placeholderTextColor={colors.text.tertiary}
                                        value={bathRooms}
                                        onChangeText={setBathRooms}
                                        keyboardType="numeric"
                                    />
                                    {showErrors && errors.bathRooms && (
                                        <Text style={{ color: colors.error.main, fontSize: 12, marginTop: spacing.xs }}>
                                            {errors.bathRooms}
                                        </Text>
                                    )}
                                </View>

                                <View style={layout.inputGroup}>
                                    <Text style={typography.textStyles.label}>
                                        Area (sq ft)
                                    </Text>
                                    <TextInput
                                        style={[
                                            layout.input,
                                            showErrors && errors.area && { 
                                                borderColor: colors.error.main,
                                                backgroundColor: colors.error.light 
                                            }
                                        ]}
                                        placeholder="Property area in square feet"
                                        placeholderTextColor={colors.text.tertiary}
                                        value={area}
                                        onChangeText={setArea}
                                        keyboardType="numeric"
                                    />
                                    {showErrors && errors.area && (
                                        <Text style={{ color: colors.error.main, fontSize: 12, marginTop: spacing.xs }}>
                                            {errors.area}
                                        </Text>
                                    )}
                                </View>

                                <View style={layout.inputGroup}>
                                    <Text style={typography.textStyles.label}>
                                        Floor
                                    </Text>
                                    <TextInput
                                        style={[
                                            layout.input,
                                            showErrors && errors.floor && { 
                                                borderColor: colors.error.main,
                                                backgroundColor: colors.error.light 
                                            }
                                        ]}
                                        placeholder="Floor number (optional)"
                                        placeholderTextColor={colors.text.tertiary}
                                        value={floor}
                                        onChangeText={setFloor}
                                        keyboardType="numeric"
                                    />
                                    {showErrors && errors.floor && (
                                        <Text style={{ color: colors.error.main, fontSize: 12, marginTop: spacing.xs }}>
                                            {errors.floor}
                                        </Text>
                                    )}
                                </View>
                            </>
                        )}
                        
                        {item.id === 'amenities' && (
                            <>
                                <View style={layout.inputGroup}>
                                    <Text style={typography.textStyles.label}>
                                        Amenities
                                    </Text>
                                    <View style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginBottom: spacing.sm
                                    }}>
                                        <TextInput
                                            style={[layout.input, { flex: 1, marginRight: spacing.sm }]}
                                            placeholder="Add an amenity..."
                                            placeholderTextColor={colors.text.tertiary}
                                            value={amenityInput}
                                            onChangeText={setAmenityInput}
                                        />
                                        <TouchableOpacity
                                            style={[layout.buttonPrimary, { paddingHorizontal: spacing.md }]}
                                            onPress={addAmenity}
                                        >
                                            <Text style={[typography.textStyles.button, { color: colors.text.inverse }]}>
                                                Add
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                    
                                    {amenities.length > 0 && (
                                        <View style={{
                                            flexDirection: 'row',
                                            flexWrap: 'wrap',
                                            gap: spacing.sm
                                        }}>
                                            {amenities.map((amenity, index) => (
                                                <View key={index} style={{
                                                    backgroundColor: colors.primary.light,
                                                    paddingHorizontal: spacing.md,
                                                    paddingVertical: spacing.sm,
                                                    borderRadius: 20,
                                                    flexDirection: 'row',
                                                    alignItems: 'center'
                                                }}>
                                                    <Text style={{
                                                        color: colors.primary.dark,
                                                        fontSize: 12,
                                                        fontWeight: '600',
                                                        marginRight: spacing.xs
                                                    }}>
                                                        {amenity}
                                                    </Text>
                                                    <TouchableOpacity onPress={() => removeAmenity(index)}>
                                                        <Ionicons 
                                                            name="close-circle" 
                                                            size={16} 
                                                            color={colors.primary.dark} 
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                        </View>
                                    )}

                                </View>

                                <TouchableOpacity 
                                    style={[
                                        layout.buttonPrimary, 
                                        { 
                                            marginTop: spacing.lg,
                                            width: '100%'
                                        },
                                        isLoading && { opacity: 0.7 }
                                    ]}
                                    onPress={handleSubmit}
                                    disabled={isLoading}
                                >
                                    <Text style={[typography.textStyles.button, { color: colors.text.inverse }]}>
                                        {isLoading ? <ActivityIndicator size="small" color={colors.text.inverse} /> : isSuccess ? 'Property submitted' : 'Submit Property'}
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                );
            
            default:
                return null;
        }
    };

    return (
        <View style={layout.container}>
            <KeyboardAvoidingView 
                style={layout.container} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <FlatList
                    data={formSections}
                    renderItem={renderFormSection}
                    keyExtractor={(item) => item.id}
                    style={layout.scrollContainer}
                    contentContainerStyle={layout.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                    ListFooterComponent={() => (
                        <View style={{ height: spacing.xl }} />
                    )}
                />
            </KeyboardAvoidingView>
            
            <Footer />



            {/* Calendar Modal */}
            {showDatePicker && (
                <Modal
                    visible={showDatePicker}
                    transparent={true}
                    animationType="slide"
                >
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
                            maxHeight: '80%',
                            shadowColor: colors.shadow,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.2,
                            shadowRadius: 16,
                            elevation: 10
                        }}>
                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: spacing.md
                            }}>
                                <Text style={[typography.textStyles.h3, { 
                                    color: colors.text.primary
                                }]}>
                                    Select Available Date
                                </Text>
                                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                    <Ionicons name="close" size={24} color={colors.text.primary} />
                                </TouchableOpacity>
                            </View>
                            
                            <Calendar
                                onDayPress={(day) => {
                                    setAvailableFrom(day.dateString);
                                    setShowDatePicker(false);
                                }}
                                markedDates={{
                                    [availableFrom]: {
                                        selected: true,
                                        selectedColor: colors.primary.main
                                    }
                                }}
                                minDate={new Date().toISOString().split('T')[0]}
                                theme={{
                                    selectedDayBackgroundColor: colors.primary.main,
                                    selectedDayTextColor: colors.text.inverse,
                                    todayTextColor: colors.primary.main,
                                    dayTextColor: colors.text.primary,
                                    textDisabledColor: colors.text.tertiary,
                                    monthTextColor: colors.text.primary,
                                    indicatorColor: colors.primary.main
                                }}
                            />
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
}
