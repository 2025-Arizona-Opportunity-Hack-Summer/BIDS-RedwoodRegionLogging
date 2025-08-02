# RRLC Scholarship Management System - API Documentation

This document provides comprehensive API documentation for the RRLC Scholarship Management System, including all endpoints, request/response formats, and authentication requirements.

## 📋 Table of Contents

- [Authentication](#authentication)
- [User Management](#user-management)
- [Scholarship Management](#scholarship-management)
- [Application Management](#application-management)
- [Event Management](#event-management)
- [File Management](#file-management)
- [Admin Operations](#admin-operations)
- [Email Notifications](#email-notifications)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## 🔐 Authentication

The API uses Supabase Auth with JWT tokens for authentication. All authenticated endpoints require a valid Bearer token.

### Authentication Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### User Roles

- **admin**: Full access to all endpoints
- **applicant**: Access to own applications and public scholarships
- **reviewer**: Access to review applications (future enhancement)

## 👤 User Management

### Register User

Creates a new user account and profile.

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "full_name": "John Doe",
  "role": "applicant"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "applicant",
    "created_at": "2025-01-15T10:00:00Z"
  }
}
```

### Get User Profile

Retrieves the current user's profile information.

```http
GET /api/auth/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "applicant",
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-01-15T10:00:00Z"
}
```

### Update User Profile

Updates the current user's profile information.

```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "John Smith",
  "phone": "+1-555-0123",
  "address": "123 Main St, City, State 12345"
}
```

## 🎓 Scholarship Management

### Get Public Scholarships

Retrieves all active scholarships available for application.

```http
GET /api/scholarships
```

**Query Parameters:**
- `status` (optional): Filter by status (`active`, `inactive`, `closed`)
- `limit` (optional): Number of results to return (default: 20)
- `offset` (optional): Number of results to skip (default: 0)

**Response:**
```json
{
  "scholarships": [
    {
      "id": "uuid",
      "name": "Forestry Excellence Scholarship",
      "description": "Supporting future forestry professionals...",
      "amount": 5000.00,
      "deadline": "2025-03-15",
      "requirements": "Must be enrolled in forestry program...",
      "status": "active",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "total": 10,
  "limit": 20,
  "offset": 0
}
```

### Get Scholarship Details

Retrieves detailed information about a specific scholarship.

```http
GET /api/scholarships/{id}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Forestry Excellence Scholarship",
  "description": "Supporting future forestry professionals...",
  "amount": 5000.00,
  "deadline": "2025-03-15",
  "requirements": "Must be enrolled in forestry program...",
  "status": "active",
  "application_count": 25,
  "created_at": "2025-01-01T00:00:00Z",
  "custom_fields": [
    {
      "id": "field1",
      "type": "text",
      "label": "GPA",
      "required": true
    }
  ]
}
```

### Create Scholarship (Admin Only)

Creates a new scholarship program.

```http
POST /api/admin/scholarships
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "New Scholarship Program",
  "description": "Description of the scholarship...",
  "amount": 3000.00,
  "deadline": "2025-06-01",
  "requirements": "Eligibility requirements...",
  "status": "active",
  "custom_fields": [
    {
      "type": "text",
      "label": "GPA",
      "required": true
    }
  ]
}
```

### Update Scholarship (Admin Only)

Updates an existing scholarship program.

```http
PUT /api/admin/scholarships/{id}
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Updated Scholarship Name",
  "amount": 3500.00,
  "deadline": "2025-07-01"
}
```

### Delete Scholarship (Admin Only)

Deletes a scholarship program.

```http
DELETE /api/admin/scholarships/{id}
Authorization: Bearer <admin_token>
```

## 📝 Application Management

### Get User Applications

Retrieves all applications for the current user.

```http
GET /api/applications
Authorization: Bearer <token>
```

**Response:**
```json
{
  "applications": [
    {
      "id": "uuid",
      "scholarship_id": "uuid",
      "scholarship_name": "Forestry Excellence Scholarship",
      "status": "submitted",
      "submission_date": "2025-01-15T10:00:00Z",
      "created_at": "2025-01-10T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

### Get Application Details

Retrieves detailed information about a specific application.

```http
GET /api/applications/{id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "scholarship_id": "uuid",
  "applicant_id": "uuid",
  "status": "submitted",
  "submission_date": "2025-01-15T10:00:00Z",
  "personal_info": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+1-555-0123",
    "address": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zip": "12345"
  },
  "academic_info": {
    "school": "University of California",
    "graduation_year": 2026,
    "gpa": 3.8,
    "major": "Forestry"
  },
  "essays": {
    "career_goals": "My career goals include...",
    "financial_need": "Financial need statement...",
    "community_involvement": "Community involvement..."
  },
  "documents": [
    {
      "id": "uuid",
      "document_type": "transcript",
      "file_name": "transcript.pdf",
      "file_url": "https://...",
      "uploaded_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

### Create Application

Creates a new scholarship application.

```http
POST /api/applications
Authorization: Bearer <token>
Content-Type: application/json

{
  "scholarship_id": "uuid",
  "personal_info": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+1-555-0123"
  },
  "academic_info": {
    "school": "University of California",
    "graduation_year": 2026,
    "gpa": 3.8,
    "major": "Forestry"
  }
}
```

### Update Application

Updates an existing application (only if status is 'draft').

```http
PUT /api/applications/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "essays": {
    "career_goals": "Updated career goals...",
    "financial_need": "Updated financial need..."
  }
}
```

### Submit Application

Submits a draft application for review.

```http
POST /api/applications/{id}/submit
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "application": {
    "id": "uuid",
    "status": "submitted",
    "submission_date": "2025-01-15T10:00:00Z"
  }
}
```

## 🎯 Event Management

### Get Public Events

Retrieves all active events available for registration.

```http
GET /api/events
```

**Response:**
```json
{
  "events": [
    {
      "id": "uuid",
      "name": "Annual Forestry Conference",
      "description": "Join us for the largest forestry event...",
      "event_date": "2025-06-15",
      "event_type": "conference",
      "location": "Sacramento, CA",
      "capacity": 500,
      "current_registrations": 150,
      "registration_fee": 150.00,
      "status": "active"
    }
  ]
}
```

### Register for Event

Registers the current user for an event.

```http
POST /api/events/{id}/register
Authorization: Bearer <token>
Content-Type: application/json

{
  "payment_status": "paid",
  "notes": "Dietary restrictions: vegetarian"
}
```

### Get User Event Registrations

Retrieves all event registrations for the current user.

```http
GET /api/events/registrations
Authorization: Bearer <token>
```

## 📁 File Management

### Upload Application Document

Uploads a document for an application.

```http
POST /api/applications/{id}/documents
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <file_data>
document_type: "transcript"
```

**Supported File Types:**
- PDF (.pdf)
- Word documents (.doc, .docx)
- Images (.jpg, .jpeg, .png)

**File Size Limit:** 10MB

**Response:**
```json
{
  "success": true,
  "document": {
    "id": "uuid",
    "document_type": "transcript",
    "file_name": "transcript.pdf",
    "file_url": "https://...",
    "file_size": 1024000,
    "mime_type": "application/pdf",
    "uploaded_at": "2025-01-15T10:00:00Z"
  }
}
```

### Delete Document

Deletes an uploaded document.

```http
DELETE /api/applications/{id}/documents/{document_id}
Authorization: Bearer <token>
```

## ⚙️ Admin Operations

### Get All Applications (Admin Only)

Retrieves all applications with filtering options.

```http
GET /api/admin/applications
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `status` (optional): Filter by status
- `scholarship_id` (optional): Filter by scholarship
- `search` (optional): Search in applicant names or emails
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset

**Response:**
```json
{
  "applications": [
    {
      "id": "uuid",
      "scholarship_name": "Forestry Excellence",
      "applicant_name": "John Doe",
      "applicant_email": "john@example.com",
      "status": "submitted",
      "submission_date": "2025-01-15T10:00:00Z",
      "gpa": 3.8,
      "school": "UC Davis"
    }
  ],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

### Update Application Status (Admin Only)

Updates the status of an application.

```http
PUT /api/admin/applications/{id}/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "approved",
  "awarded_amount": 5000.00,
  "admin_notes": "Excellent application, strong academic performance"
}
```

### Get User Management (Admin Only)

Retrieves all users with management options.

```http
GET /api/admin/users
Authorization: Bearer <admin_token>
```

### Delete User (Admin Only)

Deletes a user account and all associated data.

```http
DELETE /api/admin/users/{id}
Authorization: Bearer <admin_token>
```

## 📧 Email Notifications

### Send Application Confirmation

Automatically triggered when an application is submitted.

```http
POST /api/emails/send-application-confirmation
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "application_id": "uuid",
  "recipient_email": "applicant@example.com"
}
```

### Send Status Change Notification

Automatically triggered when application status changes.

```http
POST /api/emails/send-status-change
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "application_id": "uuid",
  "status": "approved",
  "message": "Congratulations! Your application has been approved."
}
```

### Send Award Notification

Sends notification about scholarship award.

```http
POST /api/emails/send-award-notification
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "application_id": "uuid",
  "award_amount": 5000.00
}
```

## ❌ Error Handling

All API endpoints return consistent error responses:

### Error Response Format

```json
{
  "error": true,
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {
    "field": "Specific field error"
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing authentication token |
| `FORBIDDEN` | 403 | Insufficient permissions for this operation |
| `NOT_FOUND` | 404 | Requested resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `FILE_TOO_LARGE` | 413 | Uploaded file exceeds size limit |
| `UNSUPPORTED_FILE_TYPE` | 400 | File type not supported |
| `APPLICATION_SUBMITTED` | 400 | Cannot modify submitted application |
| `DEADLINE_PASSED` | 400 | Application deadline has passed |
| `CAPACITY_FULL` | 400 | Event has reached capacity |
| `DUPLICATE_REGISTRATION` | 400 | User already registered for event |

### Example Error Responses

```json
// Validation Error
{
  "error": true,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "email": "Email is required",
    "gpa": "GPA must be between 0.0 and 4.0"
  }
}

// Authentication Error
{
  "error": true,
  "message": "Authentication required",
  "code": "UNAUTHORIZED"
}

// Permission Error
{
  "error": true,
  "message": "Admin access required",
  "code": "FORBIDDEN"
}
```

## 🚦 Rate Limiting

API endpoints are rate limited to prevent abuse:

### Rate Limits

| Endpoint Type | Limit | Window |
|---------------|-------|---------|
| Authentication | 5 requests | 1 minute |
| File Upload | 10 requests | 1 minute |
| General API | 100 requests | 1 minute |
| Admin API | 200 requests | 1 minute |

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642694400
```

### Rate Limit Exceeded Response

```json
{
  "error": true,
  "message": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "retry_after": 60
}
```

## 🔍 Testing the API

### Using cURL

```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User"
  }'

# Get scholarships
curl -X GET http://localhost:3000/api/scholarships

# Get user profile (requires token)
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman

1. Import the collection from `/docs/postman/rrlc-api.postman_collection.json`
2. Set up environment variables for base URL and tokens
3. Use the pre-configured requests for testing

### Integration Testing

The API includes comprehensive integration tests:

```bash
# Run API tests
npm run test:api

# Run specific test suite
npm run test:api -- --grep "Authentication"
```

## 📊 API Analytics

### Endpoint Usage Tracking

All API calls are logged for analytics and monitoring:

- Request/response times
- Error rates by endpoint
- User activity patterns
- File upload statistics

### Health Check Endpoint

```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:00:00Z",
  "version": "1.0.0",
  "database": "connected",
  "storage": "connected"
}
```

---

## 📞 API Support

For API-related questions or issues:

1. **Check this documentation** for endpoint details
2. **Review error codes** for troubleshooting
3. **Test endpoints** using the provided examples
4. **Contact the development team** for additional support

**Note:** This API is designed for the RRLC Scholarship Management System and follows REST conventions with JSON responses. All endpoints use HTTPS in production and include comprehensive security measures.