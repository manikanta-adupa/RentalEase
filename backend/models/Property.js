const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
    //basic 
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: [10, "Title must be at least 10 characters"],
        maxlength: [100, "Title must be less than 100 characters"],
    },
    description: {
        type: String,
        required: true,
        maxlength: [1000, "Description must be less than 1000 characters"],
    },
    propertyType: {
        type: String,
        required: true,
        enum: ["house", "apartment", "villa", "room", "pg", "studio", "office", "warehouse", "other"],
    },
    furnishingStatus: {
        type: String,
        required: true,
        enum: ["fullyFurnished", "semiFurnished", "unfurnished"],
    },
    //location
    address: {
        type: String,
        required: true,
        trim: true,
        maxlength: [200, "Address must be less than 200 characters"],
    },
    city: {
        type: String,
        required: true,
        trim: true,
        maxlength: [50, "City must be less than 50 characters"],
    },
    state: {
        type: String,
        required: true,
        trim: true,
        maxlength: [50, "State must be less than 50 characters"],
    },
    postalCode: {
        type: String,
        required: true,
        trim: true,
        maxlength: [10, "Postal code must be less than 10 characters"],
    },
    coordinates: {
        latitude: {
            type: Number,
            required: true,
            min: [-90, "Latitude must be between -90 and 90"],
            max: [90, "Latitude must be between -90 and 90"],
        },
        longitude: {
            type: Number,
            required: true,
            min: [-180, "Longitude must be between -180 and 180"],
            max: [180, "Longitude must be between -180 and 180"],
        },
    },
    //money-related
    monthlyRent: {
        type: Number,
        required: true,
        min: [1, "Monthly rent must be greater than 0"],
        max: [10000000, "Monthly rent seems unrealistic"],
    },
    securityDeposit: {
        type: Number,
        required: true,
        min: [0, "Security deposit cannot be negative"],
        max: [50000000, "Security deposit seems unrealistic"],
    },
    maintenanceFee: {
        type: Number,
        default: 0,
        min: [0, "Maintenance fee cannot be negative"],
        max: [1000000, "Maintenance fee seems unrealistic"],
    },
    //property details
    bedRooms: {
        type: Number,
        required: true,
        min: [0, "Number of bedrooms cannot be negative"],
        max: [20, "Number of bedrooms must be realistic"],
    },
    bathRooms: {
        type: Number,
        required: true,
        min: [1, "Number of bathrooms must be at least 1"],
        max: [20, "Number of bathrooms must be realistic"],
    },
    area: {
        type: Number,
        required: true,
        min: [50, "Area must be at least 50 square feet"],
        max: [100000, "Area must be realistic"],
    },
    floor: {
        type: Number,
        min: [0, "Floor cannot be negative"],
        max: [200, "Floor number seems unrealistic"],
    },
    amenities: [{
        type: String,
        trim: true,
        maxlength: [50, "Each amenity must be less than 50 characters"],
        validate: {
            validator: function(arr) {
                return arr.length <= 20; // Limit amenities to prevent abuse
            },
            message: "Cannot have more than 20 amenities"
        }
    }],
    //owner reference
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    //property status
    isAvailable: {
        type: Boolean,
        default: true,
    },
    availableFrom: {
        type: Date,
        default: Date.now,
    },
    
    // Rental tracking fields
    rentedDate: {
        type: Date,
        default: null,
        index: true
    },
    currentTenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
        index: true
    },
    //property images
    images: [{
        type: String,
        required: false,
        validate: {
            validator: function(url) {
                return /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp)$/i.test(url);
            },
            message: "Please provide valid image URLs"
        }
    }],
    numberOfViews: {
        type: Number,
        default: 0,
        min: [0, "View count cannot be negative"],
    },
    //property documents
    documents: [{
        type: String,
        validate: {
            validator: function(arr) {
                return arr.length <= 10; // Limit documents
            },
            message: "Cannot have more than 10 documents"
        }
    }],
}, { timestamps: true });

// Database indexes for search performance
propertySchema.index({ city: 1 });
propertySchema.index({ state: 1 });
propertySchema.index({ propertyType: 1 });
propertySchema.index({ monthlyRent: 1 });
propertySchema.index({ bedRooms: 1 });
propertySchema.index({ isAvailable: 1 });
propertySchema.index({ owner: 1 });

// Compound indexes for common search combinations
propertySchema.index({ city: 1, propertyType: 1 });
propertySchema.index({ city: 1, monthlyRent: 1 });
propertySchema.index({ propertyType: 1, bedRooms: 1 });
propertySchema.index({ isAvailable: 1, city: 1 });

// Geospatial index for location-based searches (future map features)
propertySchema.index({ "coordinates.latitude": 1, "coordinates.longitude": 1 });

// Prevent duplicate properties: same owner + same address + same area = duplicate
propertySchema.index({ 
    owner: 1, 
    address: 1, 
    area: 1 
}, { 
    unique: true,
    name: 'unique_property_per_owner'
});

// Instance methods for rental management
propertySchema.methods.makeUnavailable = function(tenantId) {
    this.isAvailable = false;
    this.rentedDate = new Date();
    this.currentTenant = tenantId;
    return this.save();
};

propertySchema.methods.makeAvailable = function() {
    this.isAvailable = true;
    this.rentedDate = null;
    this.currentTenant = null;
    this.availableFrom = new Date();
    return this.save();
};

module.exports = mongoose.model("Property", propertySchema);