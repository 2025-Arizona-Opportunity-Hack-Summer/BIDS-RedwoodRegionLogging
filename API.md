# RRLC Scholarship Management System - API Documentation

This document provides API documentation for the RRLC Scholarship Management System.

## Table of Contents

- [Authentication](#authentication)
- [User Management](#user-management)
- [Scholarship Management](#scholarship-management)
- [Application Management](#application-management)
- [Event Management](#event-management)
- [File Management](#file-management)
- [Admin Operations](#admin-operations)
- [Email Notifications](#email-notifications)

## Authentication

The API uses Supabase Auth with JWT tokens for authentication. All authenticated endpoints require a valid Bearer token.

### User Roles

- **admin**: Full access to all endpoints
- **applicant**: Access to own applications and public scholarships
- **reviewer**: Access to review applications (future enhancement)

## User Management

### Key Capabilities

- User registration and authentication
- Profile management and updates
- Role-based access control
- Account verification and password management

## Scholarship Management

### Key Capabilities

- Browse and search available scholarships
- View detailed scholarship information and requirements
- Create and manage scholarship programs (admin)
- Set application deadlines and eligibility criteria
- Configure custom application fields
- Track application volumes and statistics

## Application Management

### Key Capabilities

- Create and manage scholarship applications
- Save drafts and submit completed applications
- Track application status and progress
- Upload required documents and essays
- View application history and timeline
- Receive notifications about status changes

## Event Management

### Key Capabilities

- Browse and register for RRLC events
- Manage conference and workshop registrations
- Track capacity and attendance
- Process registration fees and payments
- Send event reminders and notifications
- Generate attendance reports

## File Management

### Key Capabilities

- Upload application documents (PDF, Word, images)
- Secure file storage with access controls
- File type and size validation (10MB limit)
- Document versioning and replacement
- Secure download and viewing of uploaded files

## Admin Operations

### Key Capabilities

- Review and manage all scholarship applications
- Filter and search applications by various criteria
- Update application status and add review notes
- Manage user accounts and roles
- Generate reports and analytics
- Bulk operations for efficient processing
- Award management and disbursement tracking

## Email Notifications

### Key Capabilities

- Automated application confirmation emails
- Status change notifications to applicants
- Award notifications and congratulations
- Event registration confirmations
- Deadline reminders and alerts
- Administrative notifications

## Error Handling

The API provides consistent error responses with appropriate HTTP status codes and detailed error messages. Common error types include:

- Authentication and authorization errors
- Validation errors for invalid data
- File upload errors (size, type restrictions)
- Application state errors (deadline passed, already submitted)
- Rate limiting errors

## Rate Limiting

API endpoints are protected with rate limiting to ensure system stability:

- Authentication endpoints: 5 requests per minute
- File upload endpoints: 10 requests per minute
- General API endpoints: 100 requests per minute
- Admin API endpoints: 200 requests per minute

## Testing and Monitoring

### Health Check

The API includes a health check endpoint to monitor system status and verify database connectivity.

### Analytics

All API calls are logged for monitoring and analytics, including:
- Request/response times
- Error rates by endpoint
- User activity patterns
- File upload statistics

---

**Note:** This API is designed for the RRLC Scholarship Management System and follows REST conventions with JSON responses. All endpoints use HTTPS in production and include comprehensive security measures.