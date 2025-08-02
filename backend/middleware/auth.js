const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
    try{
        let token;
        if(req.headers.authorization && req.headers.authorization.startsWith("Bearer ")){
            token = req.headers.authorization.split(" ")[1];
        }
        if(!token){
            return res.status(401).json({ message: "No token provided" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-password");
        if(!user){
            return res.status(401).json({ 
                success: false,
                message: "Invalid token" 
            });
        }
        
        // DISABLED FOR DEVELOPMENT: Email verification check
        // TODO: Re-enable when frontend is ready
        // if (!user.isVerified) {
        //     return res.status(403).json({
        //         success: false,
        //         message: "Please verify your email address to access this feature"
        //     });
        // }
        
        req.user = user;
        next();
    }catch(error){
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false,
                message: "Access denied. Invalid token." 
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: "Access denied. Token expired." 
            });
        }
        
        // Generic server error (don't expose details)
        return res.status(500).json({ 
            success: false,
            message: "Server error during authentication." 
        });
    }
}

module.exports = {auth};