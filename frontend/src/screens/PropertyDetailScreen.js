import React from "react";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  Image,
  Dimensions,
  ScrollView,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import {
  colors,
  typography,
  spacing,
  layout,
  createCarouselStyles,
} from "../styles";
import useProperty from "../hooks/useProperty";

export default function PropertyDetailScreen() {
  const route = useRoute();
  const { propertyId } = route.params;
  const { data, isLoading, error } = useProperty(propertyId);

  const propertyData = data?.property;
  const ownerData = data?.owner;

  const { width } = Dimensions.get("window");
  const carouselStyles = createCarouselStyles(width);

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

  const renderImages = () => {
    return (<FlatList horizontal={true}
      data={propertyData.images}
      keyExtractor={(img) => img}
      showsHorizontalScrollIndicator={false}
      renderItem={({ item: imgUrl }) => (
        <Image source={{ uri: imgUrl }} style={carouselStyles.carouselImage} />
      )}
    />);
  }

  const renderHeader = () => (
    <>
      <View style={[layout.headerCentered, { paddingBottom: spacing.xl }]}>
        <Text
          style={[
            typography.textStyles.h1,
            {
              color: colors.text.inverse,
              textAlign: "center",
              marginBottom: spacing.lg,
              paddingHorizontal: spacing.md,
            },
          ]}
        >
          {propertyData.title}
        </Text>

        <Text
          style={[
            typography.textStyles.bodyLarge,
            {
              color: colors.primary.light,
              textAlign: "center",
              opacity: 0.95,
              fontWeight: typography.fontWeight.medium,
              marginBottom: spacing.xs,
            },
          ]}
        >
          📍 {propertyData.address}
        </Text>
        <Text
          style={[
            typography.textStyles.body,
            {
              color: colors.primary.light,
              textAlign: "center",
              marginTop: spacing.xs,
              opacity: 0.8,
              fontWeight: typography.fontWeight.medium,
            },
          ]}
        >
          {propertyData.city}, {propertyData.state}
        </Text>
      </View>

      {/* Property Details Section */}
      <View style={layout.cardLarge}>
        <Text style={layout.sectionTitle}>Property Details</Text>
        <Text style={layout.description}>{propertyData.description}</Text>
        <View style={layout.detailRow}>
          <Text style={layout.detailLabel}>Property Type</Text>
          <Text style={layout.detailValue}>{propertyData.propertyType}</Text>
        </View>
        <View style={layout.detailRow}>
          <Text style={layout.detailLabel}>Furnishing</Text>
          <Text style={layout.detailValue}>
            {propertyData.furnishingStatus}
          </Text>
        </View>
        <View style={layout.detailRow}>
          <Text style={layout.detailLabel}>Bedrooms</Text>
          <Text style={layout.detailValue}>{propertyData.bedRooms}</Text>
        </View>
        <View style={layout.detailRow}>
          <Text style={layout.detailLabel}>Bathrooms</Text>
          <Text style={layout.detailValue}>{propertyData.bathRooms}</Text>
        </View>
        <View style={layout.detailRow}>
          <Text style={layout.detailLabel}>Area</Text>
          <Text style={layout.detailValue}>{propertyData.area} sqft</Text>
        </View>
      </View>

      {/* Rent Details Section */}
      <View style={layout.cardLarge}>
        <Text style={layout.sectionTitle}>Rent Details</Text>
        <View style={layout.detailRow}>
          <Text style={layout.detailLabel}>Monthly Rent</Text>
          <Text
            style={[
              layout.detailValue,
              { color: colors.success.main, fontWeight: "bold" },
            ]}
          >
            ₹{propertyData.monthlyRent?.toLocaleString()}
          </Text>
        </View>
        <View style={layout.detailRow}>
          <Text style={layout.detailLabel}>Security Deposit</Text>
          <Text style={layout.detailValue}>
            ₹{propertyData.securityDeposit?.toLocaleString()}
          </Text>
        </View>
        {propertyData.maintenanceFee > 0 && (
          <View style={layout.detailRow}>
            <Text style={layout.detailLabel}>Maintenance</Text>
            <Text style={layout.detailValue}>
              ₹{propertyData.maintenanceFee?.toLocaleString()}
            </Text>
          </View>
        )}
      </View>

      {/* Amenities Section */}
      {propertyData.amenities && propertyData.amenities.length > 0 && (
        <View style={layout.cardLarge}>
          <Text style={layout.sectionTitle}>Amenities</Text>
          <View style={layout.amenitiesContainer}>
            {propertyData.amenities.map((amenity, index) => (
              <View key={index} style={layout.amenityPill}>
                <Text style={layout.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Owner Details Section */}
      {ownerData ? (
        <View style={layout.cardLarge}>
          <Text style={layout.sectionTitle}>Owner Details</Text>
          <View style={layout.detailRow}>
            <Text style={layout.detailLabel}>Name</Text>
            <Text style={layout.detailValue}>
              {ownerData.name || "Not available"}
            </Text>
          </View>
          <View style={layout.detailRow}>
            <Text style={layout.detailLabel}>Email</Text>
            <Text style={layout.detailValue}>
              {ownerData.email || "Not available"}
            </Text>
          </View>
          <View style={layout.detailRow}>
            <Text style={layout.detailLabel}>Phone</Text>
            <Text style={layout.detailValue}>
              {ownerData.phone || "Not available"}
            </Text>
          </View>
        </View>
      ) : (
        <View style={layout.cardLarge}>
          <Text style={layout.sectionTitle}>Owner Details</Text>
          <Text
            style={[
              typography.textStyles.body,
              {
                textAlign: "center",
                color: colors.text.secondary,
                fontStyle: "italic",
              },
            ]}
          >
            Owner information not available
          </Text>
        </View>
      )}
    </>
  );

  return (
    <View style={layout.container}>
      {propertyData.images && propertyData.images.length > 0 ? (
        <FlatList
          data={[]}
          keyExtractor={() => 'key'}
          renderItem={() => null}
          ListHeaderComponent={(
            <>
              {renderImages()}
              {renderHeader()}
            </>
          )}
        />
      ) : (
        <ScrollView style={layout.container}>
          {renderHeader()}
        </ScrollView>
      )}
    </View>
  );

}
