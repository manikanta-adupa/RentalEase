const Property = require("../models/Property");
const Application = require("../models/Application");

const requireOwner = async (req, res, next) => {
    try{
        if(req.user.role !== "owner"){
            return res.status(403).json({
                success: false,
                message: "You are not authorized to access this resource",
            });
        }
        next();
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });    
    }
}

const requirePropertyOwner = async (req, res, next) => {
    try{
        // Handle different parameter names (id, propertyId)
        const propertyId = req.params.id || req.params.propertyId;
        
        if (!propertyId) {
            return res.status(400).json({
                success: false,
                message: "Property ID is required",
            });
        }
        
        const property = await Property.findById(propertyId);
        if(!property){
            return res.status(404).json({
                success: false,
                message: "Property not found",
            });
        }
        
        if(property.owner.toString() !== req.user.id.toString()){
            return res.status(403).json({
                success: false,
                message: "You are not authorized to access this property",
            });
        }
        
        // Store property in request for reuse (avoid re-querying)
        req.property = property;
        next();
    }
    catch(error){
        console.error('Error in requirePropertyOwner middleware:', error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });    
    }
}

const requireApplicationOwner = async (req, res, next) => {
    try{
        // Handle different parameter names (id, applicationId)
        const applicationId = req.params.id || req.params.applicationId;
        
        if (!applicationId) {
            return res.status(400).json({
                success: false,
                message: "Application ID is required",
            });
        }
        
        const application = await Application.findById(applicationId);
        if(!application){
            return res.status(404).json({
                success: false,
                message: "Application not found",
            });
        }
        
        if(application.tenant.toString() !== req.user.id.toString()){
            return res.status(403).json({
                success: false,
                message: "You are not authorized to access this application",
            });
        }
        
        // Store application in request for reuse
        req.application = application;
        next();
    }
    catch(error){
        console.error('Error in requireApplicationOwner middleware:', error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });    
    }
}

module.exports = {requireOwner, requirePropertyOwner, requireApplicationOwner};