const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const emailService = require("../services/emailService");
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
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({ 
            success: true,
            message: "Login successful", 
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
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
            await emailService.sendPasswordResetEmail(email, user.name, resetToken);
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