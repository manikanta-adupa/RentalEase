# 🏠 RentalEase

**A comprehensive rental property management platform built for the Indian market**

RentalEase is a full-stack web application that connects property owners with potential tenants, providing a seamless rental experience with modern features like automated application processing, document management, and real-time notifications.

## ✨ Features

### 🔐 **Authentication & Security**
- JWT-based secure authentication
- Role-based access control (Owner/Tenant)
- Input validation and sanitization
- Rate limiting and security headers

### 🏡 **Property Management**
- Create and manage property listings
- Upload multiple property images and documents
- Filter properties by location, type, price, and amenities
- Detailed property information with owner contact

### 📋 **Application System**
- Tenants can apply to properties with documents
- Automated application processing
- Owner can approve/reject applications
- Auto-rejection of competing applications when one is approved
- Application expiry system for pending applications

### 📧 **Email Notifications**
- Welcome emails for new users
- Application status updates for tenants
- New application notifications for property owners
- Professional email templates with responsive design

### 📁 **File Management**
- Cloudinary integration for image and document storage
- Secure file upload with validation
- Automatic image optimization and CDN delivery
- Document management for applications and properties

## 🛠️ Tech Stack

### **Backend**
- **Node.js** with **Express.js** framework
- **MongoDB** with **Mongoose** ODM
- **JWT** for authentication
- **Cloudinary** for file storage
- **Nodemailer** for email services
- **Helmet** for security headers
- **Express-rate-limit** for rate limiting

### **Key Libraries**
- `bcryptjs` - Password hashing
- `express-validator` - Input validation
- `multer` - File upload handling
- `handlebars` - Email templating
- `node-cron` - Scheduled tasks
- `winston` - Logging

## 🚀 Quick Start

### **Prerequisites**
- Node.js (v16 or higher)
- MongoDB Atlas account
- Cloudinary account
- Gmail account with App Password

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/RentalEase.git
   cd RentalEase
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install
   ```

3. **Environment Setup**
   
   Create `backend/.env` file with the following variables:
   ```bash
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database
   MONGODB_URI=your_mongodb_connection_string

   # Authentication
   JWT_SECRET=your_jwt_secret_key

   # Email Configuration (Gmail)
   EMAIL_SERVICE=gmail
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_gmail_app_password
   EMAIL_FROM="RentalEase <your_email@gmail.com>"

   # File Storage (Cloudinary)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Production CORS (for production only)
   ALLOWED_ORIGINS=https://yourdomain.com
   ```

4. **Start the development server**
   ```bash
   cd backend
   npm run dev
   ```

   The API will be available at `http://localhost:5000`

### **Service Setup**

**MongoDB Atlas:**
1. Create account at [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a cluster and database
3. Get connection string and add to `MONGODB_URI`

**Cloudinary:**
1. Create account at [Cloudinary](https://cloudinary.com/)
2. Get credentials from dashboard
3. Add to environment variables

**Gmail SMTP:**
1. Enable 2-Factor Authentication
2. Generate App Password for RentalEase
3. Use app password in `EMAIL_PASSWORD`

## 📡 API Endpoints

### **Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### **Properties**
- `GET /api/properties` - Get all properties with filters
- `POST /api/properties` - Create property (owners only)
- `GET /api/properties/:id` - Get property details
- `PUT /api/properties/:id` - Update property (owner only)
- `DELETE /api/properties/:id` - Delete property (owner only)
- `POST /api/properties/:id/images` - Upload property images
- `POST /api/properties/:id/documents` - Upload property documents

### **Applications**
- `GET /api/applications` - Get user's applications
- `POST /api/applications` - Create new application
- `GET /api/applications/:id` - Get application details
- `PUT /api/applications/:id/status` - Update application status (owner only)
- `DELETE /api/applications/:id` - Withdraw application (tenant only)
- `POST /api/applications/:id/documents` - Upload application documents

### **Response Format**
All API responses follow this format:
```json
{
  "success": true|false,
  "message": "Response message",
  "data": {}, // Response data
  "errors": [] // Validation errors (if any)
}
```

## 🏗️ Project Structure

```
RentalEase/
├── backend/
│   ├── controllers/          # Business logic
│   ├── models/              # Database schemas
│   ├── routes/              # API routes
│   ├── middleware/          # Custom middleware
│   ├── services/            # External services
│   ├── utils/               # Utility functions
│   ├── config/              # Configuration files
│   ├── templates/           # Email templates
│   └── server.js            # Entry point
├── frontend/                # (Future: React Native app)
├── package.json
└── README.md
```

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | ✅ |
| `JWT_SECRET` | Secret for JWT token signing | ✅ |
| `EMAIL_USER` | Gmail account email | ✅ |
| `EMAIL_PASSWORD` | Gmail app password | ✅ |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | ✅ |
| `CLOUDINARY_API_KEY` | Cloudinary API key | ✅ |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | ✅ |
| `PORT` | Server port (default: 5000) | ❌ |
| `NODE_ENV` | Environment (development/production) | ❌ |
| `ALLOWED_ORIGINS` | CORS origins for production | ❌ |

## 🛡️ Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Configurable cross-origin policies
- **Security Headers**: Helmet.js for security headers
- **File Upload Security**: Type and size validation
- **XSS Protection**: Input sanitization and escaping

## 🚀 Deployment

### **Environment Setup**
1. Set all environment variables in your hosting platform
2. Use production MongoDB Atlas cluster
3. Configure production CORS origins
4. Set `NODE_ENV=production`

### **Recommended Platforms**
- **Heroku** - Easy deployment with MongoDB Atlas
- **Railway** - Modern platform with good free tier
- **DigitalOcean App Platform** - Scalable and affordable
- **AWS Elastic Beanstalk** - Enterprise-grade hosting

## 🎯 Future Enhancements

- **React Native Mobile App** - Cross-platform mobile application
- **Payment Integration** - Razorpay for rent payments (India-focused)
- **AI Chatbot** - Property inquiry assistant
- **Advanced Search** - ML-powered property recommendations
- **Rental Agreements** - Digital contract management
- **Maintenance Requests** - Tenant-owner communication portal

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

For questions or support, please contact:
- **Email**: your-email@gmail.com
- **GitHub**: [@yourusername](https://github.com/yourusername)

---

**Built with ❤️ for the Indian rental market**

*RentalEase - Making property rentals simple, secure, and efficient.*