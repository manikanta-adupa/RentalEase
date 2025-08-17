import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { colors, typography, spacing, layout } from '../../styles';

export default function Footer() {
    const navigation = useNavigation();
    const route = useRoute();
    const [activeTab, setActiveTab] = useState('home');

    // Update active tab when route changes
    useEffect(() => {
        const currentRoute = route.name;
        let tabName = 'home';
        
        switch (currentRoute) {
            case 'Home':
                tabName = 'home';
                break;
            case 'PropertyList':
                tabName = 'properties';
                break;
            case 'AddProperty':
                tabName = 'addProperty';
                break;
            case 'MyProfile':
                tabName = 'profile';
                break;
            default:
                tabName = 'home';
        }
        
        setActiveTab(tabName);
    }, [route.name]);

    const handleTabPress = (tabName, screenName) => {
        setActiveTab(tabName);
        navigation.navigate(screenName);
    };

    return (
        <View style={[layout.footer, { 
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: colors.background.primary,
            borderTopWidth: 1,
            borderTopColor: colors.neutral[200],
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            shadowColor: colors.neutral[900],
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 8,
            zIndex: 1000
        }]}>
            
            <TouchableOpacity 
                style={[
                    layout.footerTab,
                    { 
                        alignItems: 'center',
                        paddingVertical: spacing.sm,
                        paddingHorizontal: spacing.md,
                        borderTopWidth: 3,
                        borderTopColor: activeTab === 'home' ? colors.primary.main : 'transparent'
                    }
                ]}
                onPress={() => handleTabPress('home', 'Home')}
                activeOpacity={0.7}
            >
                <Text style={[
                    typography.textStyles.caption,
                    { 
                        color: activeTab === 'home' ? colors.primary.main : colors.text.secondary,
                        fontWeight: activeTab === 'home' ? typography.fontWeight.semibold : typography.fontWeight.regular
                    }
                ]}>
                    🏠 Home
                </Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[
                    layout.footerTab,
                    { 
                        alignItems: 'center',
                        paddingVertical: spacing.sm,
                        paddingHorizontal: spacing.md,
                        borderTopWidth: 3,
                        borderTopColor: activeTab === 'properties' ? colors.primary.main : 'transparent'
                    }
                ]}
                onPress={() => handleTabPress('properties', 'PropertyList')}
                activeOpacity={0.7}
            >
                <Text style={[
                    typography.textStyles.caption,
                    { 
                        color: activeTab === 'properties' ? colors.primary.main : colors.text.secondary,
                        fontWeight: activeTab === 'properties' ? typography.fontWeight.semibold : typography.fontWeight.regular
                    }
                ]}>
                    🏘️ Properties
                </Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[
                    layout.footerTab,
                    { 
                        alignItems: 'center',
                        paddingVertical: spacing.sm,
                        paddingHorizontal: spacing.md,
                        borderTopWidth: 3,
                        borderTopColor: activeTab === 'addProperty' ? colors.primary.main : 'transparent'
                    }
                ]}
                onPress={() => handleTabPress('addProperty', 'AddProperty')}
                activeOpacity={0.7}
            >
                <Text style={[
                    typography.textStyles.caption,
                    { 
                        color: activeTab === 'addProperty' ? colors.primary.main : colors.text.secondary,
                        fontWeight: activeTab === 'addProperty' ? typography.fontWeight.semibold : typography.fontWeight.regular
                    }
                ]}>
                    ➕ Add Property
                </Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[
                    layout.footerTab,
                    { 
                        alignItems: 'center',
                        paddingVertical: spacing.sm,
                        paddingHorizontal: spacing.md,
                        borderTopWidth: 3,
                        borderTopColor: activeTab === 'profile' ? colors.primary.main : 'transparent'
                    }
                ]}
                onPress={() => handleTabPress('profile', 'MyProfile')}
                activeOpacity={0.7}
            >
                <Text style={[
                    typography.textStyles.caption,
                    { 
                        color: activeTab === 'profile' ? colors.primary.main : colors.text.secondary,
                        fontWeight: activeTab === 'profile' ? typography.fontWeight.semibold : typography.fontWeight.regular
                    }
                ]}>
                    👤 Profile
                </Text>
            </TouchableOpacity>
        </View>
    );
}