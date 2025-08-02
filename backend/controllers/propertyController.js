const Property = require("../models/Property");

//create property
exports.createProperty = async (req, res) => {
    try {
        const {
            title,
            description,
            propertyType,
            furnishingStatus,
            address,
            city,
            state,
            postalCode,
            coordinates,
            monthlyRent,
            securityDeposit,
            maintenanceFee,
            bedRooms,
            bathRooms,
            area,
            floor,
            amenities,
        } = req.body;
        //check if coordinates are valid
        if (coordinates) {
            const {
                latitude,
                longitude
            } = coordinates;
            if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid coordinates",
                });
            }
        }
        const propertyData = {
            title,
            description,
            propertyType,
            furnishingStatus,
            address,
            city,
            state,
            postalCode,
            coordinates,
            monthlyRent,
            securityDeposit,
            maintenanceFee,
            bedRooms,
            bathRooms,
            area,
            floor,
            amenities,
            owner: req.user._id,
        };
        const newProperty = new Property(propertyData);
        await newProperty.save();

        res.status(201).json({
            success: true,
            message: "Property created successfully",
            property: {
                _id: newProperty._id,
                title: newProperty.title,
                description: newProperty.description,
                propertyType: newProperty.propertyType,
                furnishingStatus: newProperty.furnishingStatus,
                address: newProperty.address,
                city: newProperty.city,
            },
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error creating property',
            error: error.message
        });
    }
};

//get all properties with optional filtering
exports.getAllProperties = async (req, res) => {
    try {
        // Build query object from query parameters
        const {
            city,
            state,
            minRent,
            maxRent,
            propertyType,
            amenities,
            bedRooms
        } = req.query;
        
        // CRITICAL FIX: Only show available properties by default
        const queryObject = { isAvailable: true };
        
        // Allow admin/debugging to see all properties
        if (req.query.includeUnavailable === 'true' && req.user?.role === 'owner') {
            delete queryObject.isAvailable;
        }
        
        if (city) {
            queryObject.city = {
                $regex: city,
                $options: "i"
            };
        }
        if (state) {
            queryObject.state = {
                $regex: state,
                $options: "i"
            };
        }
        if (minRent || maxRent) {
            queryObject.monthlyRent = {};
            if (minRent) {
                queryObject.monthlyRent.$gte = parseInt(minRent);
            }
            if (maxRent) {
                queryObject.monthlyRent.$lte = parseInt(maxRent);
            }
        }
        if (propertyType) {
            queryObject.propertyType = propertyType;
        }
        if (amenities) {
            queryObject.amenities = {
                $in: amenities.split(",")
            };
        }
        if (bedRooms) {
            queryObject.bedRooms = parseInt(bedRooms);
        }
        
        // Apply pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const properties = await Property.find(queryObject)
            .populate("owner", "name phone email")
            .skip(skip)
            .limit(limit)
            .sort({
                createdAt: -1
            });
        const total = await Property.countDocuments(queryObject);
        const totalPages = Math.ceil(total / limit);
        const currentPage = parseInt(page);
        const hasNextPage = currentPage < totalPages;
        const hasPreviousPage = currentPage > 1;
        res.status(200).json({
            success: true,
            message: "Properties fetched successfully",
            properties: properties.map(property => ({
                _id: property._id,
                title: property.title,
                description: property.description,
                propertyType: property.propertyType,
                furnishingStatus: property.furnishingStatus,
                address: property.address,
                city: property.city,
                state: property.state,
                // CRITICAL FIX: Include missing essential fields
                monthlyRent: property.monthlyRent,
                securityDeposit: property.securityDeposit,
                bedRooms: property.bedRooms,
                bathRooms: property.bathRooms,
                area: property.area,
                amenities: property.amenities,
                images: property.images?.slice(0, 3) || [], // First 3 images for performance
                isAvailable: property.isAvailable,
                availableFrom: property.availableFrom,
                coordinates: property.coordinates,
                owner: {
                    name: property.owner?.name,
                    phone: property.owner?.phone,
                    email: property.owner?.email
                }
            })),
            pagination: {
                currentPage,
                totalPages,
                hasNextPage,
                hasPreviousPage,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching properties",
            error: error.message,
        });
    }
};

//get property by id
exports.getPropertyById = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id).populate("owner", "name phone email");
        if (!property) {
            return res.status(404).json({
                success: false,
                message: "Property not found",
            });
        }
        //increment view count
        property.numberOfViews += 1;
        await property.save();
        //get property details
        const propertyDetails = {
            _id: property._id,
            title: property.title,
            description: property.description,
            propertyType: property.propertyType,
            furnishingStatus: property.furnishingStatus,
            address: property.address,
            city: property.city,
            state: property.state,
            monthlyRent: property.monthlyRent,
            securityDeposit: property.securityDeposit,
            bedRooms: property.bedRooms,
            bathRooms: property.bathRooms,
            area: property.area,
            amenities: property.amenities,
            images: property.images,
            numberOfViews: property.numberOfViews,
            isAvailable: property.isAvailable,
        };
        res.status(200).json({
            success: true,
            message: "Property fetched successfully",
            property: propertyDetails,
            owner: {
                _id: property.owner._id,
                name: property.owner.name,
                phone: property.owner.phone,
                email: property.owner.email,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching property",
            error: error.message,
        });
    }
};

//update property
exports.updateProperty = async (req, res) => {
    try {
        //update property
        const {
            title, description, propertyType, furnishingStatus,
            address, city, state, monthlyRent, securityDeposit,
            bedRooms, bathRooms, area, amenities, isAvailable
        } = req.body;
        
        const allowedUpdates = {
            title, description, propertyType, furnishingStatus,
            address, city, state, monthlyRent, securityDeposit,
            bedRooms, bathRooms, area, amenities, isAvailable
        };

        //remove undefined fields   
        Object.keys(allowedUpdates).forEach(key => {
            allowedUpdates[key] === undefined && delete allowedUpdates[key];
        });
        const updatedProperty = await Property.findByIdAndUpdate(req.params.id, allowedUpdates, {
            new: true
        }).populate("owner", "name phone email");
        if (!updatedProperty) {
            return res.status(404).json({
                success: false,
                message: "Property not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Property updated successfully",
            property: {
                _id: updatedProperty._id,
                title: updatedProperty.title,
                description: updatedProperty.description,
                propertyType: updatedProperty.propertyType,
                furnishingStatus: updatedProperty.furnishingStatus,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating property",
            error: error.message,
        });
    }
};


//delete property
exports.deleteProperty = async (req, res) => {
    try {
        //delete property
        await Property.findByIdAndDelete(req.params.id);
        res.status(200).json({
            success: true,
            message: "Property deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting property",
            error: error.message,
        });
    }
};

//search properties
exports.searchProperties = async (req, res) => {
    try {
        // Advanced filtering by location, price, type, amenities
        const {
            city,
            state,
            minRent,
            maxRent,
            propertyType,
            amenities,
            bedRooms
        } = req.query;
        // CRITICAL FIX: Only search available properties by default
        const queryObject = { isAvailable: true };
        
        if (city) {
            queryObject.city = {
                $regex: city,
                $options: "i"
            };
        }
        if (state) {
            queryObject.state = {
                $regex: state,
                $options: "i"
            };
        }
        if (minRent || maxRent) {
            queryObject.monthlyRent = {};
            if (minRent) {
                queryObject.monthlyRent.$gte = minRent;
            }
            if (maxRent) {
                queryObject.monthlyRent.$lte = maxRent;
            }
        }
        if (propertyType) {
            queryObject.propertyType = propertyType;
        }
        if (amenities) {
            queryObject.amenities = {
                $in: amenities.split(",")
            };
        }
        if (bedRooms) {
            queryObject.bedRooms = parseInt(bedRooms);
        }
        //apply pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const properties = await Property.find(queryObject).populate("owner", "name phone email").skip(skip).limit(limit).sort({
            createdAt: -1
        });
        const total = await Property.countDocuments(queryObject);
        const totalPages = Math.ceil(total / limit);
        const currentPage = parseInt(page);
        const hasNextPage = currentPage < totalPages;
        const hasPreviousPage = currentPage > 1;
        res.status(200).json({
            success: true,
            message: "Properties fetched successfully",
            properties: properties.map(property => ({
                _id: property._id,
                title: property.title,
                description: property.description,
                propertyType: property.propertyType,
                furnishingStatus: property.furnishingStatus,
                address: property.address,
                city: property.city,
                state: property.state,
                monthlyRent: property.monthlyRent,
                securityDeposit: property.securityDeposit,
                bedRooms: property.bedRooms,
                bathRooms: property.bathRooms,
                area: property.area,
                amenities: property.amenities,
                images: property.images?.slice(0, 3) || [], // First 3 images for performance
                isAvailable: property.isAvailable,
                availableFrom: property.availableFrom,
                coordinates: property.coordinates,
                owner: {
                    name: property.owner?.name,
                    phone: property.owner?.phone,
                    email: property.owner?.email
                }
            })),
            pagination: {
                currentPage,
                totalPages,
                hasNextPage,
                hasPreviousPage,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error searching properties",
            error: error.message,
        });
    }
};
