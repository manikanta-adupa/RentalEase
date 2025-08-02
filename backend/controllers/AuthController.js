const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const emailService = require("../services/emailService");
// const logger = require("../utils/logger");
//register a new user
exports.register = async (req, res) => {
    const { name, email, password, phone, address, role } = req.body;
    try{
        const existingUser = await User.findOne({ email });
        if(existingUser){
            return res.status(400).json({ 
                success: false,
                message: "User already exists" 
            });
        }
        const newUser = new User({ name, email, password, phone, address, role });
        await newUser.save();
        ///generate token
        const token = jwt.sign({ userId: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
        ///send welcome email
        try{
            await Promise.all([
                emailService.sendWelcomeEmail(email, name),
            ]);
        }
        catch(error){
            console.error('Error sending welcome email:', error);
        }
        ///send response
        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            },
            token,
        });
    }
    catch(error){
        res.status(500).json({ 
            success: false,
            message: "Error creating user", 
            error: error.message 
        });
    }
}

//login a user
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try{
        const user = await User.findOne({ email });
        if(!user){
            return res.status(400).json({ 
                success: false,
                message: "Invalid credentials" 
            });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({ 
                success: false,
                message: "Invalid credentials" 
            });
        }
        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.status(200).json({ 
            success: true,
            message: "Login successful", 
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token 
        });
    }
    catch(error){
        res.status(500).json({ 
            success: false,
            message: "Error logging in", 
            error: error.message 
        });
    }
}