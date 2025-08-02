# RRLC Scholarship Management System - Setup Guide

This guide provides detailed instructions for setting up the RRLC Scholarship Management System on your local development environment or production server.

## 📋 Prerequisites

### System Requirements
- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (comes with Node.js)
- **Git**: For version control
- **Modern Browser**: Chrome, Firefox, Safari, or Edge (latest versions)

### Account Requirements
- **Supabase Account**: Free tier available at [supabase.com](https://supabase.com)
- **Vercel Account**: Free tier available at [vercel.com](https://vercel.com) (for deployment)

### Development Tools (Recommended)
- **VS Code**: With TypeScript, Tailwind CSS, and Prettier extensions
- **Database Client**: TablePlus, pgAdmin, or Supabase Studio (built-in)

## 🚀 Quick Start (5 minutes)

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/2025-Arizona-Opportunity-Hack/BIDS-RedwoodRegionLogging.git

# Navigate to the app directory
cd BIDS-RedwoodRegionLogging/rrlc-app

# Verify Node.js version
node --version  # Should be 18.0 or higher
```

### 2. Install Dependencies

```bash
# Install all project dependencies
npm install

# Verify installation
npm list --depth=0
```

### 3. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/log in
2. Click "New Project"
3. Fill in project details:
   - **Name**: `rrlc-scholarship-system`
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your location
4. Wait for project to be created (2-3 minutes)

### 4. Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.local.example .env.local

# Edit the environment file
nano .env.local  # or use your preferred editor
```

Add your Supabase credentials:

```bash
# Get these from your Supabase project settings
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: Service role key for admin operations
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**To find your Supabase credentials:**
1. Go to your Supabase project dashboard
2. Click "Settings" → "API"
3. Copy the Project URL and anon public key

### 5. Set Up Database Schema

```bash
# Navigate to the database directory
cd database

# Copy the main schema
cat schema.sql
```

1. In your Supabase dashboard, go to the SQL Editor
2. Copy and paste the contents of `schema.sql`
3. Click "Run" to execute the schema
4. Verify tables were created in the Table Editor

### 6. Start Development Server

```bash
# Return to the app directory
cd ..

# Start the development server
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## 🛠️ Detailed Setup Instructions

### Environment Configuration

#### Development Environment (.env.local)

```bash
# Required - Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional - Admin Operations (recommended for development)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Optional - Development Settings
NODE_ENV=development
NEXT_PUBLIC_APP_ENV=development
```

#### Production Environment

```bash
# Required - Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Production Settings
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
```

### Database Setup Details

#### 1. Core Schema Installation

The main schema file creates:
- User profiles and authentication
- Scholarship management tables
- Application system tables
- Event management tables
- Document storage tables

```bash
# Apply the main schema
# Copy contents of database/schema.sql to Supabase SQL Editor
```

#### 2. Additional Schema Updates

Apply any additional schema files in order:

```bash
# Check for additional schema files
ls database/

# Apply in order if they exist:
# 1. add-profile-fields.sql
# 2. add-application-fields.sql
# 3. add-custom-fields.sql
# 4. add-academic-level-column.sql
```

#### 3. Row Level Security (RLS) Configuration

The schema automatically sets up RLS policies for:
- **Profiles**: Users can only edit their own profiles
- **Applications**: Users can only see their own applications
- **Scholarships**: Everyone can view active scholarships
- **Admin Access**: Admins can access all data

#### 4. Storage Bucket Setup

Set up file storage for application documents:

1. Go to Supabase Storage
2. Create a new bucket named `application-documents`
3. Set the bucket to be public
4. Configure RLS policies for the bucket

### User Account Setup

#### Creating the First Admin User

1. **Register a new account** through the application at `/register`
2. **Update user role** in Supabase:
   ```sql
   UPDATE profiles 
   SET role = 'admin' 
   WHERE email = 'your-admin-email@example.com';
   ```
3. **Verify admin access** by logging in and accessing `/admin`

#### Test User Accounts

For development, create test accounts:

```sql
-- Create test admin
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, role)
VALUES ('admin@test.com', crypt('password123', gen_salt('bf')), NOW(), 'authenticated');

-- Create test applicant
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, role)
VALUES ('student@test.com', crypt('password123', gen_salt('bf')), NOW(), 'authenticated');
```

### Development Tools Setup

#### VS Code Extensions

Install these recommended extensions:

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-json",
    "formulahendry.auto-rename-tag"
  ]
}
```

#### Code Formatting

Configure Prettier for consistent formatting:

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### Testing the Setup

#### 1. Basic Functionality Test

```bash
# Check if the app builds successfully
npm run build

# Run linting
npm run lint

# Start development server
npm run dev
```

#### 2. Database Connection Test

1. Visit [http://localhost:3000](http://localhost:3000)
2. Try to register a new account
3. Check if the user appears in Supabase profiles table
4. Log in with the account
5. Verify authentication works

#### 3. File Upload Test

1. Create a test scholarship as admin
2. Apply for the scholarship as a student
3. Try uploading a document
4. Check if file appears in Supabase Storage

## 🔧 Common Setup Issues

### Node.js Version Issues

```bash
# Check current version
node --version

# Install Node Version Manager (nvm) if needed
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install and use Node 18
nvm install 18
nvm use 18
```

### Supabase Connection Issues

1. **Double-check URLs and keys** in `.env.local`
2. **Verify project is not paused** in Supabase dashboard
3. **Check network connectivity** to Supabase servers
4. **Ensure RLS policies** are properly configured

### Build/Runtime Errors

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Check for TypeScript errors
npm run build
```

### Database Schema Issues

1. **Verify all SQL executed successfully** in Supabase SQL Editor
2. **Check for missing tables** in Table Editor
3. **Ensure triggers and functions** were created
4. **Test RLS policies** are working correctly

## 📞 Getting Help

### Self-Troubleshooting

1. **Check the browser console** for JavaScript errors
2. **Review server logs** in the terminal
3. **Verify environment variables** are loaded correctly
4. **Test database queries** in Supabase SQL Editor

### Documentation Resources

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Tailwind CSS Docs**: [tailwindcss.com/docs](https://tailwindcss.com/docs)

### Support Channels

- **GitHub Issues**: Report bugs and request features
- **Team Slack**: Direct communication with the development team
- **Supabase Discord**: Community support for database issues

## ✅ Setup Checklist

Use this checklist to verify your setup is complete:

- [ ] Node.js 18+ installed and verified
- [ ] Repository cloned and dependencies installed
- [ ] Supabase project created and accessible
- [ ] Environment variables configured correctly
- [ ] Database schema applied successfully
- [ ] Development server starts without errors
- [ ] Can register and log in users
- [ ] Admin user created and accessible
- [ ] File upload functionality working
- [ ] All pages load without errors
- [ ] Browser console shows no errors

## 🚀 Next Steps

Once setup is complete:

1. **Read the [Admin Guide](./ADMIN_GUIDE.md)** to learn admin features
2. **Read the [Applicant Guide](./APPLICANT_GUIDE.md)** to understand the user experience
3. **Review the [API Documentation](./API.md)** for custom integrations
4. **Check the [Deployment Guide](./DEPLOYMENT.md)** for production setup

---

**Setup complete!** You now have a fully functional RRLC Scholarship Management System ready for development or production use.