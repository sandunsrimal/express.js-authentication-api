# Custom Authentication API

A secure and scalable authentication API built with TypeScript, Express, and MongoDB. This API provides comprehensive authentication and user management features, including both traditional email/password authentication and social login options.

## Features

- 🔐 **Authentication Methods**
  - Email/Password Authentication
  - Social Authentication (Google, Facebook, Microsoft)
  - JWT-based Authentication with Access & Refresh Tokens

- 👤 **User Management**
  - User Registration & Login
  - Email Verification
  - Password Reset Flow
  - Profile Management
  - Account Deletion

- 🛡️ **Security**
  - Password Hashing with bcrypt
  - JWT Token Management
  - Rate Limiting
  - CORS Protection
  - Helmet Security Headers

- 📚 **API Documentation**
  - Swagger/OpenAPI Documentation
  - API Versioning

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=your_mongodb_connection_string

# JWT
JWT_ACCESS_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret

# Frontend
FRONTEND_URL=http://localhost:3000

# Backend Server
SERVER_URL=http://localhost:5000

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password
EMAIL_FROM_NAME=Your App Name
EMAIL_FROM_ADDRESS=noreply@yourapp.com
SUPPORT_EMAIL=support@yourapp.com

# Social Auth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=your_google_redirect_uri

FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret
FACEBOOK_REDIRECT_URI=your_facebook_redirect_uri

MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
MICROSOFT_REDIRECT_URI=your_microsoft_redirect_uri
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd custom-authentication-api
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Documentation

Once the server is running, you can access the Swagger documentation at:
```
http://localhost:5000/api-docs
```

## Available Scripts

- `npm start`: Start the production server
- `npm run dev`: Start the development server with hot-reload
- `npm run build`: Build the TypeScript code
- `npm run format`: Format code using Prettier
- `npm run lint`: Run ESLint
- `npm run lint:fix`: Fix ESLint issues

## API Routes

### Authentication Routes
- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login user
- `POST /api/auth/refresh`: Refresh access token
- `POST /api/auth/logout`: Logout user
- `PUT /api/auth/update-profile`: Update user profile
- `PUT /api/auth/change-password`: Change password
- `DELETE /api/auth/delete-account`: Delete user account
- `GET /api/auth/verify-email/:token`: Verify email
- `POST /api/auth/resend-verification`: Resend verification email
- `POST /api/auth/forgot-password`: Request password reset
- `POST /api/auth/reset-password`: Reset password

### Social Authentication Routes
- `GET /api/social-auth/google`: Google authentication
- `GET /api/social-auth/facebook`: Facebook authentication
- `GET /api/social-auth/microsoft`: Microsoft authentication

## Security

This project implements various security measures:
- Password hashing using bcrypt
- JWT-based authentication
- Request rate limiting
- CORS protection
- Security headers with Helmet
- MongoDB connection security

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
