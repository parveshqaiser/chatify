
# Chatify Project

## Core Features

### 1. User Authentication & Authorization

- **User Registration:** Account creation with email verification
- **User Login:** Secure authentication with JWT tokens
- **Password Management:** Change password, forgot/reset password functionality
- **Email Verification:** Account verification via email tokens (AWS SES)
- **Token Management:** Access token refresh mechanism

### 2. Mesaage

- Message Individual
- Groups / Rooms  
- Upload pics, Videos, Emojis 
- AI integration 
- Update / Edit chat, pics, videos, emojis
- Clear all conversation

## Models

- User model
- Message model
- Conversation model


## End Points

**Authentication Routes** (`/api/v1/auth/`)

- `POST /register` - User registration
- `POST /login` - User authentication
- `POST /logout` - User logout (secured)
- `GET /current-user` - Get current user info (secured)
- `POST /change-password` - Change user password (secured)
- `PATCH /update-profile` - Update User Profile (secured)
- `GET /verify-email/:verificationToken` - Email verification

- `POST /refresh-token` - Refresh access token
- `POST /forgot-password` - Request password reset
- `POST /reset-password/:resetToken` - Reset forgotten password
- `POST /resend-email-verification` - Resend verification email (secured)


**Message Routes** (`/api/v1/message/`)

- `PATCH /edit-chat` -  Update/ edit user meesage (secured)
- `DELETE /chat` - Update User Profile (secured)



### 3. Security Features

- JWT-based authentication with refresh tokens
- Input validation on all endpoints
- Email verification for account security
- Secure password reset functionality
- File upload security with Multer middleware
- CORS configuration for cross-origin requests

### 4. File Management

- Support for multiple file attachments on tasks
- Files stored in public/images directory
- File metadata tracking (URL, MIME type, size)
- Secure file upload handling using multer & cloudinary or AWS S3 (simple storage service)

### 5. Success Criteria

- Secure user authentication and authorization system
- Complete project lifecycle management
- File attachment capability for enhanced collaboration
- Email notification system for user verification and password reset
- Comprehensive API documentation through endpoint structure