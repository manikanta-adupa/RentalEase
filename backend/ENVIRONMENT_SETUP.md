# Environment Variables Setup Guide

## Required Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

### Core Configuration
```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=your_mongodb_atlas_connection_string_here

# JWT Configuration (CRITICAL - Generate a strong secret!)
JWT_SECRET=your_super_secret_jwt_key_here_make_it_at_least_32_characters_long
```

## Security Notes

### JWT_SECRET
- **MUST** be at least 32 characters long
- Use a random, unpredictable string
- **NEVER** commit this to version control
- Generate using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### MONGODB_URI
- Replace `username`, `password`, and `cluster` with your actual MongoDB Atlas credentials
- Ensure your IP is whitelisted in MongoDB Atlas
- Use a strong database password

## Production Environment Variables

### Additional Production Variables
```bash
# Production Environment
NODE_ENV=production

# CORS Configuration
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# Enhanced Security
SESSION_SECRET=another_random_secret_for_sessions
```

## Future Integration Variables

### File Upload (Cloudinary)
```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key  
CLOUDINARY_API_SECRET=your_api_secret
```

### Email Service (NodeMailer)
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Payment Gateways
```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Razorpay (Alternative)
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### Push Notifications (Firebase)
```bash
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@your-project.iam.gserviceaccount.com
```

## Setup Instructions

1. Copy the core configuration above to `backend/.env`
2. Replace placeholder values with your actual credentials
3. Generate a strong JWT_SECRET using the command provided
4. Test the connection by starting your server
5. Verify all environment variables are loaded correctly

## Verification

Test your environment setup:
```bash
cd backend
node -e "require('dotenv').config(); console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length); console.log('MongoDB URI configured:', !!process.env.MONGODB_URI);"
```

Expected output:
```
JWT_SECRET length: 64
MongoDB URI configured: true
``` 