# RRLC Scholarship Management System - Deployment Guide

This guide provides comprehensive instructions for deploying the RRLC Scholarship Management System to production environments, with specific focus on Vercel deployment but also covering other hosting options.

## 📋 Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Vercel Deployment (Recommended)](#vercel-deployment-recommended)
- [Alternative Hosting Options](#alternative-hosting-options)
- [Environment Configuration](#environment-configuration)
- [Database Setup for Production](#database-setup-for-production)
- [Domain and SSL Configuration](#domain-and-ssl-configuration)
- [Performance Optimization](#performance-optimization)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Backup and Disaster Recovery](#backup-and-disaster-recovery)
- [Troubleshooting Deployment Issues](#troubleshooting-deployment-issues)

## ✅ Pre-Deployment Checklist

Before deploying to production, ensure:

### Code Preparation
- [ ] All development and testing completed
- [ ] Code reviewed and approved
- [ ] No console.log statements or debug code
- [ ] Error handling implemented for all critical paths
- [ ] TypeScript builds without errors
- [ ] ESLint passes without errors or warnings

### Security Review
- [ ] All environment variables are secure
- [ ] No sensitive data in client-side code
- [ ] Database Row Level Security (RLS) policies tested
- [ ] File upload restrictions properly configured
- [ ] Authentication flows tested thoroughly

### Performance Testing
- [ ] Application tested with realistic data volumes
- [ ] File upload/download performance verified
- [ ] Database queries optimized
- [ ] Image optimization implemented
- [ ] Bundle size analyzed and optimized

### Documentation
- [ ] All documentation updated
- [ ] Environment variables documented
- [ ] Deployment procedures documented
- [ ] Rollback procedures prepared

## 🚀 Vercel Deployment (Recommended)

Vercel provides excellent Next.js hosting with automatic deployments and global CDN.

### Initial Setup

#### 1. Prepare Repository

```bash
# Ensure your code is in the main branch
git checkout main
git pull origin main

# Verify build works locally
cd rrlc-app
npm run build
```

#### 2. Install Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to your Vercel account
vercel login
```

#### 3. Configure Project Structure

Create or update `vercel.json` in the repository root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "rrlc-app/package.json",
      "use": "@vercel/next",
      "config": {
        "distDir": ".next"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "rrlc-app/$1"
    }
  ],
  "buildCommand": "cd rrlc-app && npm run build",
  "installCommand": "cd rrlc-app && npm install",
  "outputDirectory": "rrlc-app/.next"
}
```

### Deploy to Vercel

#### Method 1: CLI Deployment

```bash
# From repository root
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? [your-team]
# - Link to existing project? N (for first deployment)
# - What's your project's name? rrlc-scholarship-system
# - In which directory is your code located? ./
```

#### Method 2: GitHub Integration (Recommended)

1. **Go to Vercel Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)
2. **Click "New Project"**
3. **Import from Git**: Connect your GitHub repository
4. **Configure Project**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `rrlc-app`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### Environment Variables

#### Required Environment Variables

In Vercel dashboard, go to Project Settings → Environment Variables:

```bash
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase Service Role Key (Required for admin operations)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Production Environment
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production

# Optional: Analytics and Monitoring
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
```

#### Environment-Specific Variables

Set up different environments:

- **Production**: Main deployment environment
- **Preview**: For testing branches and PRs
- **Development**: For development branches

### Custom Domain Setup

#### 1. Add Custom Domain

In Vercel dashboard:

1. **Go to Project Settings** → **Domains**
2. **Add Domain**: Enter your domain (e.g., `scholarships.rrlc.net`)
3. **Configure DNS**: Follow Vercel's DNS instructions

#### 2. DNS Configuration

For domain `scholarships.rrlc.net`:

```dns
# A Record (for root domain)
A @ 76.76.19.61

# CNAME Record (for subdomain)
CNAME scholarships cname.vercel-dns.com

# TXT Record (for verification)
TXT _vercel challenge-token-from-vercel
```

#### 3. SSL Certificate

Vercel automatically provisions SSL certificates:

- **Automatic SSL**: Enabled by default
- **Certificate Type**: Let's Encrypt
- **Renewal**: Automatic every 90 days
- **Force HTTPS**: Enabled in project settings

## 🏢 Alternative Hosting Options

### AWS Deployment

#### Using AWS Amplify

```bash
# Install AWS Amplify CLI
npm install -g @aws-amplify/cli

# Initialize project
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

#### Using AWS EC2 + PM2

```bash
# On EC2 instance
# Install Node.js and PM2
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2

# Clone and setup project
git clone your-repo
cd rrlc-app
npm install
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Digital Ocean App Platform

1. **Connect Repository**: Link GitHub repo
2. **Configure Build**:
   - Build Command: `cd rrlc-app && npm run build`
   - Run Command: `cd rrlc-app && npm start`
3. **Set Environment Variables**
4. **Deploy**

### Netlify Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=rrlc-app/.next
```

## ⚙️ Environment Configuration

### Production Environment Variables

#### Core Configuration

```bash
# Application Environment
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-production-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-key

# Security
NEXTAUTH_SECRET=your-long-random-secret-string
NEXTAUTH_URL=https://your-domain.com

# Email Configuration (if using custom email service)
EMAIL_FROM=noreply@rrlc.net
EMAIL_SMTP_HOST=smtp.your-provider.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=your-smtp-username
EMAIL_SMTP_PASSWORD=your-smtp-password
```

#### Optional Enhancements

```bash
# Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-vercel-analytics-id

# Error Monitoring
SENTRY_DSN=your-sentry-dsn
SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=your-sentry-project

# File Storage
NEXT_PUBLIC_MAX_FILE_SIZE=10485760  # 10MB in bytes
NEXT_PUBLIC_ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,jpeg,png

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60000  # 1 minute in milliseconds
```

### Environment Security

#### Best Practices

1. **Never commit secrets** to version control
2. **Use different keys** for different environments
3. **Rotate secrets regularly** (quarterly)
4. **Limit key permissions** to minimum required
5. **Monitor key usage** for suspicious activity

#### Secret Management

```bash
# Use Vercel CLI for secure variable management
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# Verify environment variables
vercel env ls
```

## 🗄️ Database Setup for Production

### Supabase Production Configuration

#### 1. Create Production Project

1. **Create new Supabase project** for production
2. **Choose appropriate region** (closest to users)
3. **Set strong database password**
4. **Enable appropriate add-ons**

#### 2. Apply Database Schema

```sql
-- Copy and execute the complete schema
-- From: database/schema.sql

-- Verify all tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

#### 3. Configure Storage

```sql
-- Create storage bucket for application documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('application-documents', 'application-documents', false);

-- Set up RLS policies for storage
CREATE POLICY "Users can upload their own documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'application-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'application-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### 4. Performance Optimization

```sql
-- Create indexes for better performance
CREATE INDEX CONCURRENTLY idx_applications_status ON applications(status);
CREATE INDEX CONCURRENTLY idx_applications_created_at ON applications(created_at);
CREATE INDEX CONCURRENTLY idx_scholarships_deadline ON scholarships(deadline);
CREATE INDEX CONCURRENTLY idx_profiles_role ON profiles(role);

-- Analyze tables for query optimization
ANALYZE applications;
ANALYZE scholarships;
ANALYZE profiles;
```

### Database Backup Strategy

#### Automated Backups

Supabase provides:

- **Daily backups** (retained for 7 days on free plan)
- **Point-in-time recovery** (available on paid plans)
- **Manual backup creation** via dashboard

#### Additional Backup Script

```bash
#!/bin/bash
# backup-database.sh

# Set variables
SUPABASE_PROJECT_ID="your-project-id"
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="rrlc_backup_${BACKUP_DATE}.sql"

# Create backup using pg_dump
pg_dump "postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres" > "${BACKUP_FILE}"

# Compress backup
gzip "${BACKUP_FILE}"

# Upload to cloud storage (optional)
# aws s3 cp "${BACKUP_FILE}.gz" s3://your-backup-bucket/

echo "Backup completed: ${BACKUP_FILE}.gz"
```

## 🌐 Domain and SSL Configuration

### Domain Setup

#### DNS Configuration

For `scholarships.rrlc.net`:

```dns
# Primary domain records
A     @               76.76.19.61
AAAA  @               2606:4700:4700::1111
CNAME www             scholarships.rrlc.net
CNAME scholarships    cname.vercel-dns.com

# Email and verification
MX    @               10 mail.rrlc.net
TXT   @               "v=spf1 include:_spf.google.com ~all"
TXT   _vercel         "verification-token-from-vercel"
```

#### Domain Verification

1. **Add domain** in Vercel dashboard
2. **Configure DNS** according to Vercel instructions
3. **Wait for propagation** (up to 48 hours)
4. **Verify SSL certificate** is automatically issued

### SSL Certificate Management

#### Automatic SSL (Vercel)

Vercel automatically:

- **Issues certificates** via Let's Encrypt
- **Renews certificates** before expiration
- **Handles multiple domains** and subdomains
- **Forces HTTPS** when enabled

#### Custom SSL Certificate

If using custom certificates:

1. **Generate certificate** from your CA
2. **Upload certificate** in Vercel dashboard
3. **Configure private key**
4. **Test SSL configuration**

### Security Headers

Configure security headers in `next.config.ts`:

```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
```

## ⚡ Performance Optimization

### Build Optimization

#### Next.js Configuration

```typescript
// next.config.ts
const nextConfig = {
  // Enable experimental features
  experimental: {
    appDir: true,
    serverActions: true
  },
  
  // Image optimization
  images: {
    domains: ['your-supabase-project.supabase.co'],
    formats: ['image/webp', 'image/avif']
  },
  
  // Compression
  compress: true,
  
  // Bundle analyzer (development only)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      config.plugins.push(
        new (require('@next/bundle-analyzer'))({
          enabled: true,
          openAnalyzer: false
        })
      )
      return config
    }
  })
}
```

#### Bundle Analysis

```bash
# Install bundle analyzer
npm install --save-dev @next/bundle-analyzer

# Analyze bundle
ANALYZE=true npm run build
```

### Caching Strategy

#### Edge Caching

Configure caching headers:

```typescript
// In API routes
export async function GET() {
  const data = await fetchData()
  
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400'
    }
  })
}
```

#### Static Generation

```typescript
// For static pages
export async function generateStaticParams() {
  const scholarships = await getScholarships()
  
  return scholarships.map((scholarship) => ({
    id: scholarship.id
  }))
}
```

### Database Performance

#### Connection Pooling

Configure Supabase connection pooling:

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public'
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-my-custom-header': 'rrlc-scholarship-system'
    }
  }
})
```

#### Query Optimization

```sql
-- Create covering indexes
CREATE INDEX CONCURRENTLY idx_applications_full ON applications(
  status, scholarship_id, created_at
) INCLUDE (first_name, last_name, email);

-- Optimize frequent queries
EXPLAIN ANALYZE SELECT * FROM applications WHERE status = 'submitted';
```

## 📊 Monitoring and Maintenance

### Application Monitoring

#### Vercel Analytics

Enable in Vercel dashboard:

1. **Go to Analytics tab**
2. **Enable Web Analytics**
3. **Add to your app**:

```typescript
// Add to app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

#### Custom Monitoring

```typescript
// lib/monitoring.ts
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (process.env.NODE_ENV === 'production') {
    // Send to analytics service
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: eventName, properties })
    })
  }
}

// Usage in components
trackEvent('application_submitted', {
  scholarship_id: scholarshipId,
  user_id: userId
})
```

### Error Monitoring

#### Sentry Integration

```bash
# Install Sentry
npm install @sentry/nextjs

# Configure Sentry
npx @sentry/wizard -i nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0
})
```

### Health Checks

#### API Health Check

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check database connection
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    if (error) throw error

    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      environment: process.env.NODE_ENV
    })
  } catch (error) {
    return Response.json({
      status: 'unhealthy',
      error: error.message
    }, { status: 500 })
  }
}
```

### Automated Backups

#### GitHub Actions Backup

```yaml
# .github/workflows/backup.yml
name: Database Backup

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Backup Database
        run: |
          # Add backup script here
          echo "Backup completed"
```

## 🔄 Backup and Disaster Recovery

### Backup Strategy

#### Database Backups

1. **Automated Supabase Backups**:
   - Daily backups (free tier: 7 days retention)
   - Point-in-time recovery (paid tiers)
   - Manual backup creation

2. **Custom Backup Script**:
   ```bash
   #!/bin/bash
   # Run daily via cron
   pg_dump $DATABASE_URL | gzip > backup_$(date +%Y%m%d).sql.gz
   ```

#### File Storage Backups

```bash
# Backup Supabase Storage
supabase storage download --all backup/
```

#### Code Repository

- **GitHub repository** serves as code backup
- **Multiple branches** for different environments
- **Tagged releases** for rollback capability

### Disaster Recovery Plan

#### Recovery Time Objectives (RTO)

- **Database**: 2 hours
- **Application**: 30 minutes
- **File Storage**: 4 hours
- **DNS Changes**: 24 hours (due to propagation)

#### Recovery Procedures

1. **Database Recovery**:
   ```sql
   -- Restore from backup
   psql $NEW_DATABASE_URL < backup_file.sql
   ```

2. **Application Recovery**:
   ```bash
   # Redeploy from last known good commit
   vercel --prod --force
   ```

3. **DNS Failover**:
   ```dns
   # Point to backup environment
   CNAME scholarships backup.rrlc.net
   ```

## 🔧 Troubleshooting Deployment Issues

### Common Issues

#### Build Failures

**Issue**: TypeScript compilation errors
```bash
# Solution: Fix type issues
npm run type-check
npm run build
```

**Issue**: Missing environment variables
```bash
# Solution: Verify all required variables are set
vercel env ls
```

#### Runtime Errors

**Issue**: Database connection failures
```typescript
// Check connection in health endpoint
const { data, error } = await supabase.from('profiles').select('id').limit(1)
if (error) console.error('DB Error:', error)
```

**Issue**: File upload failures
```typescript
// Check storage bucket permissions
const { data, error } = await supabase.storage
  .from('application-documents')
  .list()
if (error) console.error('Storage Error:', error)
```

### Performance Issues

#### Slow Page Loads

1. **Check bundle size**:
   ```bash
   npm run analyze
   ```

2. **Optimize images**:
   ```typescript
   import Image from 'next/image'
   
   <Image
     src="/image.jpg"
     width={500}
     height={300}
     alt="Description"
     priority
   />
   ```

3. **Implement code splitting**:
   ```typescript
   import dynamic from 'next/dynamic'
   
   const DynamicComponent = dynamic(() => import('./Component'), {
     loading: () => <p>Loading...</p>
   })
   ```

#### Database Performance

1. **Check slow queries**:
   ```sql
   -- In Supabase dashboard
   SELECT query, mean_exec_time, calls
   FROM pg_stat_statements
   ORDER BY mean_exec_time DESC;
   ```

2. **Add missing indexes**:
   ```sql
   CREATE INDEX CONCURRENTLY idx_missing ON table_name(column_name);
   ```

### Deployment Rollback

#### Quick Rollback (Vercel)

```bash
# List recent deployments
vercel ls

# Promote previous deployment
vercel promote [deployment-url]
```

#### Database Rollback

```sql
-- Restore from backup
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
\i backup_file.sql
```

### Emergency Procedures

#### System Down

1. **Check Vercel status**: [vercel-status.com](https://vercel-status.com)
2. **Check Supabase status**: [status.supabase.com](https://status.supabase.com)
3. **Review error logs** in Vercel dashboard
4. **Implement emergency maintenance page**

#### Data Corruption

1. **Stop write operations** immediately
2. **Identify corruption scope**
3. **Restore from last known good backup**
4. **Verify data integrity** before resuming operations

## 📞 Support and Escalation

### Support Contacts

- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Supabase Support**: [supabase.com/support](https://supabase.com/support)
- **Development Team**: [your-team-contact]

### Escalation Matrix

| Severity | Response Time | Contact |
|----------|---------------|---------|
| Critical (System Down) | 1 hour | Primary developer + DevOps |
| High (Major Feature Down) | 4 hours | Primary developer |
| Medium (Performance Issues) | 24 hours | Development team |
| Low (Minor Issues) | 72 hours | Assigned developer |

---

**Deployment Complete!** Your RRLC Scholarship Management System is now live and ready to serve the forestry education community. Monitor performance, maintain regular backups, and keep documentation updated as the system evolves.