const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const emailService = require("../services/emailService");
const emailQueue = require("../queues/email-queue");    
// const logger = require("../utils/logger");
//register a new user
exports.register = async (req, res) => {
    const { name, email, password, phone, address } = req.body;
    try{
        const existingUser = await User.findOne({ email });
        if(existingUser){
            return res.status(400).json({ 
                success: false,
                message: "User already exists" 
            });
        }
        const newUser = new User({ name, email, password, phone, address });
        await newUser.save();
        ///generate token
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        const refreshToken = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        newUser.refreshToken = refreshToken;
        newUser.refreshTokenExpires = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
        await newUser.save();
        ///send welcome email
        await emailQueue.add('send-email', {
            type: 'welcome',
            to: email,
            data: { name: name },
        });
        ///send response
        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
            },
            token,
            refreshToken
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
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        user.refreshToken = refreshToken;
        user.refreshTokenExpires = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
        await user.save();
        res.status(200).json({ 
            success: true,
            message: "Login successful", 
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
            token,
            refreshToken
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

// Forgot Password
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            // Don't reveal whether user exists or not for security
            return res.status(200).json({
                success: true,
                message: "If your email is registered, you will receive a password reset link."
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Set reset token and expiry (1 hour)
        user.passwordResetToken = resetTokenHash;
        user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
        await user.save();

        // Send reset email
        try {
            await emailQueue.add('send-email', {
                type: 'password-reset',
                to: email,
                data: {
                    name: user.name,
                    resetToken: resetToken,
                },
            });
        } catch (emailError) {
            console.error('Error sending password reset email:', emailError);
            // Clear the reset token if email fails
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save();
            
            return res.status(500).json({
                success: false,
                message: "Error sending password reset email"
            });
        }

        res.status(200).json({
            success: true,
            message: "If your email is registered, you will receive a password reset link."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error processing forgot password request",
            error: error.message
        });
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    const { token, password } = req.body;
    try {
        // Hash the provided token
        const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

        // Find user with valid reset token
        const user = await User.findOne({
            passwordResetToken: resetTokenHash,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token"
            });
        }

        // Update password
        user.password = password; // Will be hashed by the pre-save middleware
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password reset successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error resetting password",
            error: error.message
        });
    }
};

// Verify Email (placeholder for future implementation)
exports.verifyEmail = async (req, res) => {
    const { token } = req.body;
    try {
        // This is a placeholder - implement email verification logic here
        res.status(200).json({
            success: true,
            message: "Email verification functionality coming soon"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error verifying email",
            error: error.message
        });
    }
};

exports.logout = async (req, res) => {

    //clear refresh token from user
    const { refreshToken } = req.body;
    try{
        const user = await User.findOne({ refreshToken });
        if(!user){
            return res.status(401).json({
                success: true,
                message: "Logged out successfully"
            });
        }
        user.refreshToken = null;
        user.refreshTokenExpires = null;
        await user.save();
    }
    catch(error){
        res.status(500).json({
            success: false,
            message: "Error logging out",
            error: error.message
        });
    }
    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
}

exports.refreshToken = async (req, res) => {
    //validate refresh token, generate new access token
    const { refreshToken } = req.body;
    try{
        const user = await User.findOne({ refreshToken });
        if(!user){
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token"
            });
        }
        if(user.refreshTokenExpires < Date.now()){
            return res.status(401).json({
                success: false,
                message: "Refresh token expired"
            });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
            token
        });
    }
    catch(error){
        res.status(500).json({
            success: false,
            message: "Error refreshing token",
            error: error.message
        });
    }
}


