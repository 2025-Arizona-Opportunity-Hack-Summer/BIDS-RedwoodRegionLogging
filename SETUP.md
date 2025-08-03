# RRLC Scholarship Management System - Setup Guide

This guide provides instructions for setting up the RRLC Scholarship Management System.

## Prerequisites

### System Requirements
- Node.js version 18.0 or higher
- npm version 8.0 or higher
- Git for version control
- Modern web browser

### Account Requirements
- Supabase account (free tier available)
- Vercel account for deployment (free tier available)

### Development Tools (Recommended)
- VS Code with TypeScript and Tailwind CSS extensions
- Database client (Supabase Studio built-in)

## Quick Start

### 1. Clone the Repository

Clone the project repository and navigate to the app directory:
```bash
git clone https://github.com/2025-Arizona-Opportunity-Hack/BIDS-RedwoodRegionLogging.git
cd BIDS-RedwoodRegionLogging/rrlc-app
```

### 2. Install Dependencies

Install all project dependencies:
```bash
npm install
```

### 3. Create Supabase Project

1. Sign up at supabase.com
2. Create a new project
3. Choose a strong database password
4. Select appropriate region

### 4. Set Up Environment Variables

1. Copy the example environment file: `cp .env.local.example .env.local`
2. Add your Supabase credentials to the `.env.local` file
3. Get credentials from your Supabase project settings under API section

### 5. Set Up Database Schema

1. Open Supabase SQL Editor
2. Copy and paste the contents of `database/schema.sql`
3. Execute the schema to create all necessary tables

### 6. Start Development Server

Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:3000

## Environment Configuration

### Required Environment Variables

For development, you need:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for admin operations)

For production, add:
- `NODE_ENV=production`
- `NEXT_PUBLIC_APP_ENV=production`

## Database Setup

### Core Schema

The database schema creates:
- User profiles and authentication
- Scholarship management tables
- Application system tables
- Event management tables
- Document storage tables

### Security Configuration

The system automatically configures:
- Row Level Security (RLS) policies for data protection
- Role-based access control
- Secure file storage with proper permissions

### User Account Setup

1. Register a new account through the application
2. Update the user role to 'admin' in the Supabase dashboard
3. Verify admin access by logging into the admin panel

## Testing the Setup

1. Build the application: `npm run build`
2. Start the development server: `npm run dev`
3. Visit http://localhost:3000
4. Register a new account and verify login works
5. Test basic functionality

## Common Setup Issues

### Node.js Version Issues
- Ensure you have Node.js version 18 or higher
- Use Node Version Manager (nvm) if needed

### Supabase Connection Issues
- Double-check URLs and keys in `.env.local`
- Verify project is active in Supabase dashboard
- Ensure RLS policies are properly configured

### Build/Runtime Errors
- Clear Next.js cache and reinstall dependencies if needed
- Check for TypeScript errors with `npm run build`

## Setup Checklist

- [ ] Node.js 18+ installed
- [ ] Repository cloned and dependencies installed
- [ ] Supabase project created
- [ ] Environment variables configured
- [ ] Database schema applied
- [ ] Development server starts without errors
- [ ] User registration and login working
- [ ] Admin user created

## Next Steps

Once setup is complete, refer to the other documentation files:
- Admin Guide for admin features
- Applicant Guide for user experience
- API Documentation for technical details
- Deployment Guide for production setup

---

**Setup complete!** You now have a functional RRLC Scholarship Management System.