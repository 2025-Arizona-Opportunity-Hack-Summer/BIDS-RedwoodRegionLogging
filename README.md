# RRLC Scholarship Management System 🌲

*A comprehensive scholarship and event management platform for the Redwood Region Logging Conference*

## 🎯 Demo & Links

- **Live Demo:** [Coming Soon - Deployed on Vercel]
- **DevPost:** [Coming Soon]
- **Video Demo:** [Coming Soon - 4 minutes]
- **Nonprofit:** [Redwood Region Logging Conference](https://ohack.dev/nonprofit/WONxYIazfrL2Bnew0npm)
- **Hackathon:** [2025 Summer Opportunity Hack](https://www.ohack.dev/hack/2025_summer)
- **RRLC Website:** [https://www.rrlc.net/](https://www.rrlc.net/)

## 👥 Team "BIDS"

- **George Badulescu** - Full Stack Developer [(GitHub)](https://github.com/gbchill)
- **Team Slack:** [#bids](https://opportunity-hack.slack.com/app_redirect?channel=bids)

## 🎯 Problem Statement

The Redwood Region Logging Conference (RRLC), Northern California's largest timber-focused nonprofit, manages **$70,000+ in annual scholarships** and **500-6,000 conference attendees** using manual spreadsheets and disconnected systems.

### Current Pain Points:
- ❌ **Manual scholarship applications** via paper forms and email
- ❌ **Scattered data** across multiple spreadsheets
- ❌ **No application tracking** or status updates for students
- ❌ **Inefficient review process** for administrators
- ❌ **Limited reporting** and impact measurement
- ❌ **Poor applicant experience** with unclear processes

### Our Solution:
✅ **Unified digital platform** streamlining the entire scholarship lifecycle
✅ **Automated workflows** from application to award disbursement  
✅ **Real-time tracking** and notifications for all stakeholders
✅ **Comprehensive analytics** for data-driven decisions
✅ **Mobile-responsive design** for accessibility
✅ **Scalable architecture** supporting growth to 10,000+ members

## ✨ Key Features

### For Students/Applicants
- 📝 **Multi-step Application Forms** with auto-save functionality
- 📎 **Document Upload** for transcripts, essays, and recommendations
- 📊 **Real-time Status Tracking** of application progress
- 📧 **Email Notifications** for status updates and deadlines
- 👤 **User Profiles** with academic and personal information
- 🎓 **Scholarship Discovery** with filtering and search

### For Administrators
- 📋 **Application Review Dashboard** with filtering and sorting
- 👥 **User Management** with role-based access control
- 📈 **Analytics & Reporting** with exportable data
- ✉️ **Automated Email System** for confirmations and notifications
- 🏆 **Award Management** with disbursement tracking
- ⚙️ **Dynamic Form Builder** for custom scholarship requirements

### For Events
- 📅 **Event Management** for conferences and workshops
- 🎟️ **Registration System** with capacity management
- 💰 **Payment Tracking** and fee management
- 📊 **Attendance Tracking** and reporting

## 🛠️ Technical Architecture

### Technology Stack

#### Frontend
- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4.x
- **UI Components:** Custom component library with Headless UI
- **State Management:** React Context + Custom Hooks
- **Deployment:** Vercel

#### Backend
- **API:** Next.js API Routes (Serverless Functions)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth with Row Level Security
- **File Storage:** Supabase Storage for document uploads
- **Real-time:** Supabase Realtime subscriptions

#### External Services
- **Email:** Automated notifications via API routes
- **Analytics:** Built-in dashboard with charts
- **Export:** CSV/PDF generation for reports

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Student Portal │    │  Admin Dashboard│    │  Public Portal  │
│   Applications  │    │  Reviews & Mgmt │    │   Scholarships  │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────▼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │      Next.js 15          │
                    │   App Router & API       │
                    │    (Vercel Deploy)       │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │       Supabase           │
                    │   PostgreSQL Database    │
                    │   Authentication & RLS   │
                    │   Real-time Updates      │
                    │   File Storage           │
                    └──────────────────────────┘
```

### Database Schema

#### Core Tables

```sql
-- User Management
profiles (id, email, full_name, role, created_at, updated_at)
├── role: 'admin' | 'applicant' | 'reviewer'
└── extends Supabase auth.users

-- Scholarship Management  
scholarships (id, name, description, amount, deadline, requirements, status)
├── status: 'active' | 'inactive' | 'closed'
└── created_by: references profiles(id)

-- Application System
applications (id, scholarship_id, applicant_id, status, submission_date, ...)
├── status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'awarded'
├── Personal info: first_name, last_name, email, phone, address
├── Academic info: school, graduation_year, gpa, major
├── Essays: career_goals, financial_need, community_involvement
└── Award info: awarded_amount, awarded_date, admin_notes

-- Document Storage
application_documents (id, application_id, document_type, file_url, file_name)
└── document_type: 'transcript' | 'recommendation' | 'essay' | 'other'

-- Event Management
events (id, name, description, event_date, event_type, capacity, location)
└── event_type: 'conference' | 'workshop' | 'networking' | 'award_ceremony'

event_registrations (id, event_id, user_id, registration_status, payment_status)
├── registration_status: 'registered' | 'cancelled' | 'attended' | 'no_show'
└── payment_status: 'pending' | 'paid' | 'refunded' | 'waived'
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager  
- Supabase account (free tier works)

### Quick Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/2025-Arizona-Opportunity-Hack/BIDS-RedwoodRegionLogging.git
   cd BIDS-RedwoodRegionLogging/rrlc-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.local.example .env.local
   # Add your Supabase credentials
   ```

4. **Database setup**
   ```bash
   # Run the SQL schema in your Supabase dashboard
   cat database/schema.sql
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

### Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### User Roles & Access

- **Admin**: Full access to all features, user management, application review
- **Applicant**: Can apply for scholarships, view application status, manage profile
- **Reviewer**: Can review applications (future enhancement)

## 📚 Documentation

- **[Setup Guide](./SETUP.md)** - Detailed installation and configuration
- **[API Documentation](./API.md)** - Complete API reference
- **[Admin Guide](./ADMIN_GUIDE.md)** - Admin dashboard walkthrough
- **[Applicant Guide](./APPLICANT_GUIDE.md)** - Student user manual
- **[Deployment Guide](./DEPLOYMENT.md)** - Production deployment
- **[Troubleshooting](./TROUBLESHOOTING.md)** - Common issues and solutions

## 🔒 Security & Privacy

### Data Protection
- **Row Level Security (RLS)** enabled on all Supabase tables
- **JWT-based authentication** with Supabase Auth
- **Role-based access control** with granular permissions
- **Input validation** and sanitization on all endpoints
- **Secure file uploads** with type and size restrictions
- **Environment variables** for sensitive configuration

### Privacy Considerations
- Student data is protected and only accessible to authorized admins
- Applications are only visible to the applicant and administrators
- File uploads are stored securely in Supabase Storage
- No sensitive data in client-side code or logs

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect to Vercel**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Environment Variables**
   - Add all required environment variables in Vercel dashboard
   - Enable automatic deployments from main branch

3. **Build Configuration**
   ```json
   {
     "buildCommand": "cd rrlc-app && npm run build",
     "outputDirectory": "rrlc-app/.next",
     "installCommand": "cd rrlc-app && npm install"
   }
   ```

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📊 Project Impact

### Metrics & Goals
- **Target Users**: 500+ scholarship applicants annually
- **Processing Volume**: $70,000+ in scholarship awards
- **Time Savings**: 80% reduction in manual processing
- **User Experience**: Mobile-first, accessible design
- **Scalability**: Support for 10,000+ members

### Success Metrics
- ✅ Streamlined application process
- ✅ Real-time application tracking
- ✅ Automated email notifications
- ✅ Comprehensive admin dashboard
- ✅ Mobile-responsive design
- ✅ Secure file handling
- ✅ Role-based access control

## 🏆 Future Enhancements

### Phase 2 Features
- **Multi-language Support** for diverse applicant base
- **Mobile App** for iOS and Android
- **Advanced Analytics** with predictive insights
- **Integration APIs** for accounting systems
- **Automated Background Checks** for award verification
- **Video Interview System** for finalist rounds

### Technical Improvements
- **Caching Layer** for improved performance
- **Advanced Search** with full-text capabilities
- **Batch Operations** for bulk application processing
- **Audit Logging** for compliance requirements
- **Advanced Reporting** with custom dashboards

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines and code of conduct.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Standards
- TypeScript for type safety
- ESLint + Prettier for code formatting
- Comprehensive testing required
- Documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **RRLC Team** for their vision and collaboration
- **Opportunity Hack** for organizing this amazing event
- **Supabase** for their excellent backend-as-a-service platform
- **Vercel** for seamless deployment and hosting

---

**Built with ❤️ by Team BIDS for the 2025 Summer Opportunity Hack**

*Making scholarship management accessible, efficient, and impactful for the forestry education community.*
