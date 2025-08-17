const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: [2, "Name must be at least 2 characters"],
        maxlength: [50, "Name must be less than 50 characters"]
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"]
    },
    // role: {
    //         type: String,
    //         enum: ["owner", "tenant"],
    //         required: true,
    //         default: "tenant",
    // },
    phone: {
        type: String,
        required: true,
        trim: true,
        match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"]
    },
    address: { 
        type: String,
        trim: true,
        maxlength: [200, "Address must be less than 200 characters"]
    },
    profilePicture: {
        type: String,
        default: "https://via.placeholder.com/150.jpg",
        validate: {
            validator: function(v) {
                // Only validate if a custom URL is provided (not the default)
                if (v === "https://via.placeholder.com/150.jpg") return true;
                return /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp)$/i.test(v);
            },
            message: "Please provide a valid image URL"
        }
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    password: {
        type: String,
        required: true,
        // Note: Password validation happens in middleware, not here due to hashing
    },
    passwordResetToken: {
        type: String,
        default: null,
    },
    passwordResetExpires: {
        type: Date,
    },
    emailVerificationToken: {
        type: String,
        default: null,
    },
    emailVerificationExpires: {
        type: Date,
    },
}, {timestamps: true});

// Add database indexes for performance
userSchema.index({ email: 1 });
// userSchema.index({ role: 1 });
userSchema.index({ phone: 1 });

//hash password before saving
userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    
    // Validate password length before hashing
    if (this.password.length < 8) {
        return next(new Error("Password must be at least 8 characters long"));
    }
    
    this.password = await bcrypt.hash(this.password, 12); // Increased salt rounds for security
    next();
});

//compare password
userSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

//generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.passwordResetExpires = Date.now() + 3600000; //1 hour
    return resetToken;
};

//generate email verification token
///hash with sha256
userSchema.methods.generateEmailVerificationToken = function() {
    const verificationToken = crypto.randomBytes(32).toString("hex");
    this.emailVerificationToken = crypto.createHash("sha256").update(verificationToken).digest("hex");
    this.emailVerificationExpires = Date.now() + 3600000; //1 hour
    return this.emailVerificationToken;
};  

module.exports = mongoose.model("User", userSchema);