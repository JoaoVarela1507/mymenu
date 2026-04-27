"""
═══════════════════════════════════════════════════════════════════════════════
                    API REQUEST/RESPONSE EXAMPLES
═══════════════════════════════════════════════════════════════════════════════

All examples use: http://localhost:8000

═══════════════════════════════════════════════════════════════════════════════
1. REGISTER - Create a new user account
═══════════════════════════════════════════════════════════════════════════════

REQUEST:
────────
POST /auth/register
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "MySecurePassword123!",
  "name": "John Doe",
  "role": "consumer"
}

RESPONSE (201 CREATED):
──────────────────────
{
  "message": "User registered successfully with ID: 507f1f77bcf86cd799439011",
  "success": true
}

ERROR RESPONSE (400 BAD REQUEST):
────────────────────────────────
{
  "detail": "Email already registered"
}
OR
{
  "detail": "Invalid role. Must be 'consumer' or 'admin'"
}

CURL EXAMPLE:
─────────────
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "MySecurePassword123!",
    "name": "John Doe",
    "role": "consumer"
  }'


═══════════════════════════════════════════════════════════════════════════════
2. LOGIN - Authenticate and get JWT token
═══════════════════════════════════════════════════════════════════════════════

REQUEST:
────────
POST /auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "MySecurePassword123!"
}

RESPONSE (200 OK):
──────────────────
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJlbWFpbCI6ImpvaG4uZG9lQGV4YW1wbGUuY29tIiwicm9sZSI6ImNvbnN1bWVyIiwiZXhwIjoxNzEyMjU5MTIwfQ.abc123xyz",
  "token_type": "bearer",
  "user_id": "507f1f77bcf86cd799439011",
  "email": "john.doe@example.com",
  "name": "John Doe",
  "role": "consumer"
}

ERROR RESPONSE (401 UNAUTHORIZED):
──────────────────────────────────
{
  "detail": "Invalid email or password"
}

IMPORTANT NOTES:
────────────────
• Token expires in 30 minutes
• Store token in localStorage: localStorage.setItem('access_token', data.access_token)
• Include token in future requests: Authorization: Bearer <token>
• Save role for conditional UI: localStorage.setItem('user_role', data.role)

CURL EXAMPLE:
─────────────
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "MySecurePassword123!"
  }'


═══════════════════════════════════════════════════════════════════════════════
3. FORGOT PASSWORD - Request password reset email
═══════════════════════════════════════════════════════════════════════════════

REQUEST:
────────
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "john.doe@example.com"
}

RESPONSE (200 OK):
──────────────────
{
  "message": "If an account with this email exists, a reset link has been sent",
  "success": true
}

EMAIL CONTENT:
──────────────
Subject: Password Reset Request

Hello,

You have requested a password reset. Click the link below to reset your password:

[Reset Password](http://localhost:3000/reset-password?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)

This link will expire in 24 hours.

If you did not request this, please ignore this email.

Best regards,
MyMenu Team

IMPORTANT NOTES:
────────────────
• Security: Doesn't reveal if email exists or not (prevents user enumeration)
• Email takes 24 hours to expire
• Token is valid only for password reset (checked in backend)
• User receives HTML formatted email

CURL EXAMPLE:
─────────────
curl -X POST http://localhost:8000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com"}'


═══════════════════════════════════════════════════════════════════════════════
4. RESET PASSWORD - Change password with reset token
═══════════════════════════════════════════════════════════════════════════════

REQUEST:
────────
POST /auth/reset-password
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huQGV4YW1wbGUuY29tIiwidHlwZSI6InJlc2V0IiwiZXhwIjoxNzEyMzQ1NjAwfQ.xyz123abc",
  "new_password": "MyNewPassword456!"
}

RESPONSE (200 OK):
──────────────────
{
  "message": "Password reset successfully",
  "success": true
}

ERROR RESPONSE (400 BAD REQUEST):
────────────────────────────────
{
  "detail": "Invalid or expired reset token"
}

IMPORTANT NOTES:
────────────────
• Token comes from email link: /reset-password?token=...
• Token valid for 24 hours
• Token can only be used once
• After reset, user must login with new password

CURL EXAMPLE:
─────────────
curl -X POST http://localhost:8000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGc...",
    "new_password": "MyNewPassword456!"
  }'


═══════════════════════════════════════════════════════════════════════════════
5. HEALTH CHECK - Verify API is running
═══════════════════════════════════════════════════════════════════════════════

REQUEST:
────────
GET /health

RESPONSE (200 OK):
──────────────────
{
  "status": "healthy",
  "database": "connected"
}

CURL EXAMPLE:
─────────────
curl http://localhost:8000/health


═══════════════════════════════════════════════════════════════════════════════
COMMON VALIDATION ERRORS
═══════════════════════════════════════════════════════════════════════════════

Missing Required Field:
{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "email"],
      "msg": "Field required",
      "input": {...}
    }
  ]
}

Invalid Email Format:
{
  "detail": [
    {
      "type": "value_error",
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "input": "not-an-email"
    }
  ]
}

Invalid JSON:
{
  "detail": "Invalid request body"
}


═══════════════════════════════════════════════════════════════════════════════
HTTP STATUS CODES
═══════════════════════════════════════════════════════════════════════════════

✅ 200 OK              - Request successful
✅ 201 CREATED         - Resource created successfully (register)
❌ 400 BAD REQUEST     - Invalid input or validation error
❌ 401 UNAUTHORIZED    - Invalid credentials or missing token
❌ 404 NOT FOUND       - Resource not found
❌ 500 SERVER ERROR    - Internal server error (check logs)


═══════════════════════════════════════════════════════════════════════════════
AUTHENTICATION HEADER (for future protected routes)
═══════════════════════════════════════════════════════════════════════════════

When making requests to protected endpoints, include the JWT token:

Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

CURL EXAMPLE:
────────────
curl -X GET http://localhost:8000/protected-route \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json"

FETCH EXAMPLE (JavaScript):
───────────────────────────
const response = await fetch('http://localhost:8000/protected-route', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
    'Content-Type': 'application/json'
  }
});


═══════════════════════════════════════════════════════════════════════════════
TESTING WITH SWAGGER UI (INTERACTIVE)
═══════════════════════════════════════════════════════════════════════════════

1. Navigate to: http://localhost:8000/docs
2. Find endpoint (e.g., POST /auth/register)
3. Click "Try it out"
4. Fill in request body
5. Click "Execute"
6. See response and curl command

This is the easiest way to test the API interactively!


═══════════════════════════════════════════════════════════════════════════════
POSTMAN COLLECTION
═══════════════════════════════════════════════════════════════════════════════

Import this into Postman:

{
  "info": {
    "name": "MyMenu API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Register Consumer",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\\"email\\": \\"consumer@example.com\\", \\"password\\": \\"Password123!\\", \\"name\\": \\"John Doe\\", \\"role\\": \\"consumer\\"}"
        },
        "url": {"raw": "http://localhost:8000/auth/register"}
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\\"email\\": \\"consumer@example.com\\", \\"password\\": \\"Password123!\\"}"
        },
        "url": {"raw": "http://localhost:8000/auth/login"}
      }
    }
  ]
}
"""
