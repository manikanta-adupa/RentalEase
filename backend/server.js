// Load environment variables FIRST before any other imports
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const authRoutes = require("./routes/authRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const { apiLimiter } = require("./middleware/rateLimiter");
const cron = require('node-cron');

// Create express app
const app = express();

// Security middleware
app.use(helmet());

// Logging middleware
app.use(morgan("combined"));

// CORS configuration - CRITICAL FIX for production flexibility
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        if (process.env.NODE_ENV === 'production') {
            // Use environment variable for production origins
            const allowedOrigins = process.env.ALLOWED_ORIGINS 
                ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
                : [];
            
            if (allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                console.warn(`CORS blocked origin: ${origin}`);
                callback(new Error('Not allowed by CORS'));
            }
        } else {
            // Development - allow common local development origins
            const devOrigins = [
                'http://localhost:3000',   // React web app
                'http://localhost:19006',  // Expo web
                'http://localhost:8081',   // React Native Metro
                'exp://localhost:19000',   // Expo app
                'exp://192.168.31.208:19000' // Expo LAN (your actual IP)
            ];
            
            if (devOrigins.indexOf(origin) !== -1 || origin.startsWith('exp://')) {
                callback(null, true);
            } else {
                console.warn(`Dev CORS warning - unknown origin: ${origin}`);
                callback(null, true); // Allow in development for flexibility
            }
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    maxAge: 86400 // Cache preflight for 24 hours
};
app.use(cors(corsOptions));

// Body parsing middleware with size limits
app.use(express.json({ limit: '10mb' })); // Prevent DoS attacks
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api', apiLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/applications", applicationRoutes);

// API root index for easy discovery
app.get('/api', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'RentalEase API root',
        routes: [
            '/api/auth',
            '/api/properties',
            '/api/applications',
        ],
        timestamp: new Date().toISOString(),
    });
});

// Health check route
app.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "RentalEase API is running",
        timestamp: new Date().toISOString(),
        version: "1.0.0"
    });
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    
    // Mongoose validation errors
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors
        });
    }
    
    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            success: false,
            message: `${field} already exists`
        });
    }
    
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
    
    // Default error
    res.status(err.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' 
            ? 'Something went wrong' 
            : err.message
    });
});

// MongoDB connection with proper error handling and performance optimization
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // CRITICAL FIXES: Add connection pooling and performance settings
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            family: 4, // Use IPv4, skip trying IPv6
            // Note: bufferMaxEntries is deprecated, bufferCommands handles buffering
            bufferCommands: false, // Disable mongoose buffering
        });
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });
        
        // CRITICAL: Handle connection drops and reconnections
        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
        });
        
        // Graceful shutdown with cleanup
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                console.log('MongoDB connection closed through app termination');
                process.exit(0);
            } catch (err) {
                console.error('Error during graceful shutdown:', err);
                process.exit(1);
            }
        });
        
        // CRITICAL: Handle uncaught exceptions to prevent crashes
        process.on('uncaughtException', (err) => {
            console.error('Uncaught Exception:', err);
            // Don't exit immediately, let current requests finish
            server.close(() => {
                process.exit(1);
            });
        });
        
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};

// Connect to database
connectDB();

// CRITICAL: Schedule automated tasks
// Run application expiry check daily at 2 AM
cron.schedule('0 2 * * *', async () => {
    try {
        console.log('Running daily application expiry check...');
        const Application = require('./models/Application');
        await Application.expireOldApplications();
    } catch (error) {
        console.error('Error in scheduled application expiry:', error);
    }
}, {
    timezone: "Asia/Kolkata" // Adjust for Indian timezone
});

// Health check endpoint with comprehensive status (keep generic root for health)
app.get('/', (req, res) => {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    res.status(200).json({
        success: true,
        message: 'RentalEase API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        uptime: `${Math.floor(uptime / 60)} minutes`,
        memory: {
            used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
            total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`
        },
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// 404 handler for API namespace only (do not catch root/health)
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API route not found'
    });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Accessible at: http://localhost:${PORT} and http://192.168.31.208:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error('Unhandled Promise Rejection:', err.message);
    server.close(() => {
        process.exit(1);
    });
});

module.exports = app;