# RRLC Centralized Management Platform

## Quick Links

- Nonprofit: [Redwood Region Logging Conference](https://ohack.dev/nonprofit/WONxYIazfrL2Bnew0npm)
- [Hackathon Details](https://www.ohack.dev/hack/2025_summer)
- [Team Slack Channel](https://opportunity-hack.slack.com/app_redirect?channel=bids)
- RRLC Website: [https://www.rrlc.net/](https://www.rrlc.net/)

## Creator

@Bai Pai (on Slack)

## Team "BIDS"

- [Team Member 1](GitHub profile link)
- [Team Member 2](GitHub profile link)
- [Team Member 3](GitHub profile link)
<!-- Add all team members -->

## Problem Statement

The Redwood Region Logging Conferencge (RRLC), Northern California's largest timber-focused nonprofit event and educational organization, faces growing operational complexity with data scattered across manual spreadsheets and disconnected systems.

**Current Challenges:**

- Manual tracking of diverse stakeholder groups (10,000+ members)
- Inefficient management of conference registrations (500-6,000 attendees)
- Scattered scholarship application processes ($70,000 distributed annually)
- No centralized system for tracking educational impact
- Limited historical data access and reporting capabilities

**Our Solution:**
A unified, web-based platform that centralizes stakeholder management, event coordination, and scholarship tracking while enabling data-driven decision making and impact measurement.

## Technical Architecture

### Tech Stack

#### Frontend

- **Framework:** React 18 with Next.js 15 (App Router)
- **Styling:** Tailwind CSS 4.x
- **Language:** TypeScript
- **Deployment:** Vercel

#### Backend

- **API:** Next.js API Routes (serverless functions)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Real-time:** Supabase Realtime subscriptions

#### External Integrations

- **Forms:** Tally.so for scholarship/event applications
- **Email:** Automated workflows via Zapier/Supabase triggers
- **Data Export:** CSV/PDF report generation

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Apps   │    │   Tally.so      │    │   Admin Panel   │
│  (Web/Mobile)   │    │   Forms         │    │   Dashboard     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │              ┌───────▼────────┐             │
          │              │    Zapier      │             │
          │              │  Integration   │             │
          │              └───────┬────────┘             │
          │                      │                      │
          └──────────────────────▼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │      Next.js API         │
                    │     (Serverless)         │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │      Supabase            │
                    │  PostgreSQL Database     │
                    │  Authentication          │
                    │  Real-time Subscriptions │
                    └──────────────────────────┘
```

### Database Design

#### Core Tables Structure

**Stakeholders Table**

```sql
CREATE TABLE stakeholders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL, -- 'member', 'sponsor', 'vendor', 'student', 'educator'
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  organization VARCHAR(255),
  address JSONB,
  metadata JSONB, -- Flexible field for type-specific data
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Events Table**

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50), -- 'conference', 'education_day', 'career_day'
  description TEXT,
  start_date DATE,
  end_date DATE,
  location VARCHAR(255),
  capacity INTEGER,
  registration_fee DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Event Registrations Table**

```sql
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id),
  stakeholder_id UUID REFERENCES stakeholders(id),
  registration_date TIMESTAMP DEFAULT NOW(),
  payment_status VARCHAR(20) DEFAULT 'pending',
  attendance_status VARCHAR(20) DEFAULT 'registered',
  metadata JSONB
);
```

**Scholarships Table**

```sql
CREATE TABLE scholarships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_name VARCHAR(255),
  year INTEGER,
  total_budget DECIMAL(10,2),
  application_deadline DATE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Scholarship Applications Table**

```sql
CREATE TABLE scholarship_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scholarship_id UUID REFERENCES scholarships(id),
  applicant_id UUID REFERENCES stakeholders(id),
  application_date TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'submitted',
  award_amount DECIMAL(10,2),
  award_date DATE,
  tally_form_id VARCHAR(100), -- Reference to external form
  application_data JSONB
);
```

### API Structure

#### Authentication Endpoints

- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Get current user

#### Stakeholder Management

- `GET /api/stakeholders` - List stakeholders with filtering
- `POST /api/stakeholders` - Create new stakeholder
- `GET /api/stakeholders/[id]` - Get stakeholder details
- `PUT /api/stakeholders/[id]` - Update stakeholder
- `DELETE /api/stakeholders/[id]` - Delete stakeholder

#### Event Management

- `GET /api/events` - List events
- `POST /api/events` - Create new event
- `GET /api/events/[id]` - Get event details
- `POST /api/events/[id]/register` - Register for event
- `GET /api/events/[id]/attendees` - List event attendees

#### Scholarship Management

- `GET /api/scholarships` - List scholarship programs
- `POST /api/scholarships` - Create scholarship program
- `GET /api/scholarships/[id]/applications` - List applications
- `PUT /api/applications/[id]` - Update application status

#### Reporting & Analytics

- `GET /api/reports/stakeholders` - Generate stakeholder reports
- `GET /api/reports/events` - Generate event reports
- `GET /api/reports/scholarships` - Generate scholarship reports
- `POST /api/reports/export` - Export data as CSV/PDF

#### Form Integration

- `POST /api/webhooks/tally` - Receive Tally.so form submissions
- `POST /api/integrations/zapier` - Zapier webhook endpoint

### Security Implementation

#### Access Control

- **Admin Level:** Full CRUD access to all resources
- **Volunteer Level:** Limited access to event functions (future)
- **Applicant Level:** View and submit personal applications (future)

#### Data Protection

- Row Level Security (RLS) enabled on all Supabase tables
- JWT-based authentication with Supabase Auth
- Environment variables for sensitive configuration
- Input validation and sanitization on all endpoints

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

```bash
# Clone the repository
git clone [your-repo-link]
cd rrlc-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Add your Supabase URL and anon key

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
TALLY_WEBHOOK_SECRET=your_tally_webhook_secret
```

## Deployment

The application is deployed on Vercel with automatic deployments from the main branch.

```bash
# Build for production
npm run build

# Deploy to Vercel
npx vercel --prod
```

## Your next steps

1. ✅ Add everyone on your team to your GitHub repo like [this video posted in our Slack channel](https://opportunity-hack.slack.com/archives/C1Q6YHXQU/p1605657678139600)
2. ✅ Create your DevPost project [like this video](https://youtu.be/vCa7QFFthfU?si=bzMQ91d8j3ZkOD03)
3. ✅ Use the [this DevPost]() to submit your project
4. ✅ Your DevPost final submission demo video should be 4 minutes or less
5. ✅ Review the judging criteria on DevPost

# What should your final Readme look like?

Your readme should be a one-stop-shop for the judges to understand your project. It should include:

- Team name
- Team members
- Slack channel
- Problem statement
- Tech stack
- Link to your DevPost project
- Link to your final demo video
- Any other information you think is important

You'll use this repo as your resume in the future, so make it shine! 🌟

Examples of stellar readmes:

- ✨ [2019 Team 3](https://github.com/2019-Arizona-Opportunity-Hack/Team-3)
- ✨ [2019 Team 6](https://github.com/2019-Arizona-Opportunity-Hack/Team-6)
- ✨ [2020 Team 2](https://github.com/2020-opportunity-hack/Team-02)
- ✨ [2020 Team 4](https://github.com/2020-opportunity-hack/Team-04)
- ✨ [2020 Team 8](https://github.com/2020-opportunity-hack/Team-08)
- ✨ [2020 Team 12](https://github.com/2020-opportunity-hack/Team-12)

---
