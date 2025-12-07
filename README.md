# 🧠 NeuronPerson

**AI-Powered HRIS (Human Resource Information System)** with intelligent chatbot assistant for employee data management, attendance tracking, and shift scheduling.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=flat&logo=Prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TanStack](https://img.shields.io/badge/TanStack-FF4154?style=flat&logo=react&logoColor=white)](https://tanstack.com/)

## ✨ Key Features

### 🤖 AI-Powered Chatbot (RAG)

- **Natural Language Queries**: Ask questions about employees, attendance, and shifts in Indonesian or English
- **RAG (Retrieval-Augmented Generation)**: Semantic search across employee data, attendance records, and shift schedules
- **Local Embeddings**: Privacy-first approach using local embedding model (all-MiniLM-L6-v2, 384 dimensions)
- **Multi-Context Search**: Intelligently searches across multiple document types with vector similarity
- **Conversational Memory**: Maintains context across conversation for follow-up questions
- **Source Tracking**: All responses include source documents with similarity scores

### 👥 Employee Management

- Complete employee profiles with department and position
- Bulk import via Excel (XLSX) with validation
- Employee hierarchy (manager-subordinate relationships)
- Salary and allowance management
- Employment status tracking (Active/Inactive)
- Role-based access control

### ⏰ Attendance System

- GPS-based check-in/check-out with geofencing
- Photo capture for attendance verification
- Real-time attendance status (Present, Absent, Late, Half-Day, On-Leave)
- Location tracking for remote work
- Attendance history and reports
- Attendance types integration (Work days, Holidays, Leave)

### 📅 Shift Management

- Flexible shift allocation (Fixed/Flexible)
- Multiple shift types (Morning, Afternoon, Night)
- Mass shift assignment for multiple employees
- Weekly schedule templates
- Employee-specific shift schedules
- Shift-based presence types

### 💰 Payroll Management

- Automated salary calculation
- Allowance and deduction tracking
- Monthly payroll processing
- Base salary + position-based salary
- Payroll history and reports

### 🔐 Authentication & Authorization

- Better Auth integration with email/password
- Role-based access control (Admin, HR Manager, Manager, Employee)
- Session management with secure cookies
- **Multi-tenancy support** (Organization-based isolation)
- Employee and Admin portals

### 📈 Analytics & Reporting

- Real-time statistics dashboard
- Attendance analytics
- Employee distribution by department
- Shift allocation insights
- Chat interaction analytics

## 🏗️ Architecture Overview

### Tech Stack

#### Frontend

- **Framework**: [React 19.2.0](https://react.dev/) with [TanStack Start](https://tanstack.com/start) (SSR)
- **Routing**: [TanStack Router](https://tanstack.com/router) v1.132.0 (File-based routing)
- **UI Library**: [Radix UI](https://www.radix-ui.com/) + [Tailwind CSS 4.0.6](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/) primitives
- **Forms**: [React Hook Form](https://react-hook-form.com/) 7.66.1 + [Zod](https://zod.dev/) 4.1.13
- **State Management**:
  - [TanStack Query](https://tanstack.com/query) 5.66.5 (Server state)
  - [TanStack Store](https://tanstack.com/store) 0.7.0 (Client state)
- **Maps**: [Leaflet](https://leafletjs.com/) 1.9.4 + React Leaflet 5.0.0
- **Charts**: [Recharts](https://recharts.org/) 2.15.4
- **Motion**: [Framer Motion](https://www.framer.com/motion/) 12.23.24

#### Backend

- **API**: [tRPC](https://trpc.io/) 11.4.3 (End-to-end typesafe APIs)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with pgvector extension
- **ORM**: [Prisma](https://www.prisma.io/) 6.19.0
- **Authentication**: [Better Auth](https://www.better-auth.com/) 1.4.3
- **Runtime**: [Nitro](https://nitro.unjs.io/) 3.0.1 (SSR/SSG)
- **File Processing**: [SheetJS (xlsx)](https://sheetjs.com/) 0.18.5

#### AI & Machine Learning

- **LLM**: [Google Gemini](https://ai.google.dev/) 0.24.1
- **Alternative LLM**: [OpenAI](https://openai.com/) 6.9.1
- **Embeddings**: [Xenova Transformers](https://huggingface.co/Xenova) 2.17.2 (Local, privacy-first)
- **Model**: all-MiniLM-L6-v2 (384 dimensions)
- **Vector Search**: PostgreSQL with pgvector (cosine similarity)

#### Development Tools

- **Build Tool**: [Vite](https://vitejs.dev/) 7.1.7
- **Linting/Formatting**: [Biome](https://biomejs.dev/) 2.2.4
- **Testing**: [Vitest](https://vitest.dev/) 3.0.5 + Testing Library
- **Type Checking**: [TypeScript](https://www.typescriptlang.org/) 5.7.2
- **Environment**: [T3 Env](https://env.t3.gg/) 0.13.8 (Type-safe env vars)
- **DevTools**: TanStack Router & Query devtools

### Architecture Patterns

#### 1. Multi-Tenancy (Organization-based)

- All data scoped by `organizationId`
- Complete data isolation between organizations
- Organization-specific geofencing
- Shared infrastructure, isolated data

#### 2. Component Organization

```
components/
├── layout/          # Layout components (sidebar, header, footer)
├── pages/           # Page-specific components
│   ├── attendance/  # Attendance page components
│   ├── employee/    # Employee page components
│   ├── payroll/     # Payroll page components
│   └── ...
├── shared/          # Shared/reusable components
└── ui/              # shadcn/ui primitives (button, input, dialog, etc.)
```

**Pattern**: Container/Section/Dialog

- **containers/** - Container components with logic
- **sections/** - Presentational components
- **dialogs/** - Modal dialogs

#### 3. Type Safety

- **End-to-end**: tRPC ensures type safety from client to server
- **Runtime Validation**: Zod schemas for input validation
- **Database**: Prisma-generated types
- **Environment**: T3 Env for type-safe environment variables

#### 4. API Structure (tRPC Routers)

```
src/integrations/trpc/routers/
├── employee.ts              # Employee CRUD
├── attendance.ts            # Attendance operations
├── attendance-type.ts       # Attendance type management
├── shift.ts                 # Shift definitions
├── shift-allocation.ts      # Shift assignments
├── permission.ts            # Permission requests
├── leave.ts                 # Leave management
├── payroll.ts               # Payroll processing
├── department.ts            # Department management
├── position.ts              # Position management
├── chat/                    # AI chatbot
│   ├── index.ts
│   ├── types.ts
│   └── validation.ts
├── organization.ts          # Organization settings
└── dashboard.ts             # Dashboard analytics
```

Each router follows consistent structure:

- `index.ts` - Route handlers
- `types.ts` - TypeScript types
- `validation.ts` - Zod schemas

## 📁 Project Structure

```
neuronperson/
├── app/
│   ├── routes/              # TanStack Router (file-based)
│   │   ├── app/            # Admin portal routes
│   │   │   ├── employees/
│   │   │   ├── attendance/
│   │   │   ├── shifts/
│   │   │   ├── payroll/
│   │   │   ├── chatbot/
│   │   │   └── ...
│   │   ├── employee/       # Employee portal routes
│   │   ├── session/        # Better Auth endpoints (/session/*)
│   │   └── index.tsx       # Landing page
│   ├── components/         # React components
│   │   ├── layout/        # Layout components
│   │   ├── pages/         # Page-specific components
│   │   ├── shared/        # Shared components
│   │   └── ui/            # shadcn/ui components
│   └── styles/            # Global styles
├── src/
│   ├── lib/
│   │   ├── embedding-employee.ts     # Employee embeddings
│   │   ├── embedding-attendance.ts   # Attendance embeddings
│   │   ├── embedding-shift.ts        # Shift embeddings
│   │   ├── embedding-utils.ts        # Shared embedding utilities
│   │   ├── embedding-service.ts      # Main export (index)
│   │   ├── local-embedding.ts        # Local embedding model
│   │   ├── gemini.ts                 # Gemini LLM integration
│   │   ├── openai.ts                 # OpenAI integration
│   │   └── date-utils.ts             # Date normalization utilities
│   ├── hooks/              # Custom React hooks
│   ├── integrations/
│   │   ├── better-auth/    # Auth configuration
│   │   │   ├── auth.ts     # Server config
│   │   │   └── client.ts   # Client config
│   │   ├── trpc/           # tRPC setup
│   │   │   ├── routers/    # API routers
│   │   │   ├── client.ts   # tRPC client
│   │   │   └── init.ts     # tRPC initialization
│   │   └── tanstack-query/ # React Query setup
│   ├── data/               # Demo/seed data
│   └── db.ts               # Prisma client
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── migrations/         # Database migrations
│   └── seed.ts             # Seed script
├── scripts/                # Utility scripts
│   └── copy-prisma-engine.js
├── vite.config.ts          # Vite configuration
├── tailwind.config.ts      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies
```

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 22.x LTS or higher
- **Package Manager**: npm or pnpm
- **Database**: PostgreSQL 14+ (with pgvector extension)
- **API Keys**:
  - Google Gemini API key (for chatbot)
  - Optional: OpenAI API key

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/neuronperson.git
cd neuronperson
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create `.env.local` file:

```env
# Database (PostgreSQL with pgvector)
DATABASE_URL="postgresql://user:password@host:5432/neuronperson?schema=public"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-min-32-chars"
BETTER_AUTH_URL="http://localhost:3000"
VITE_APP_URL="http://localhost:3000"

# Google Gemini API (for chatbot)
GOOGLE_GEMINI_API_KEY="your-gemini-api-key"

# Optional: OpenAI API
OPENAI_API_KEY="your-openai-api-key"

# Optional: Uploadthing (for file uploads)
UPLOADTHING_SECRET=""
UPLOADTHING_APP_ID=""
```

**Generate Better Auth secret:**

```bash
openssl rand -base64 32
```

**Get Gemini API key:**
Visit [Google AI Studio](https://makersuite.google.com/app/apikey)

4. **Set up database**

Enable pgvector extension:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Push Prisma schema to database:

```bash
npm run db:push
```

Optional - Run seed data:

```bash
npm run db:seed
```

5. **Start development server**

```bash
npm run dev
```

Visit `http://localhost:3000`

### First-Time Setup

1. **Register first user** → Automatically becomes Admin
2. **Create organization** (if using multi-tenancy)
3. **Add departments and positions**
4. **Import employees** via Excel or create manually
5. **Set up shifts and attendance types**
6. **Configure geofencing** for office location (Organization Settings)
7. **Index data for AI** (Settings → Re-index Data)

## 🤖 AI Chatbot Usage

The AI chatbot uses RAG (Retrieval-Augmented Generation) to answer questions based on your actual data.

### Example Queries

**Employee Queries:**

```
"Siapa karyawan di department IT?"
"Berapa gaji John Doe?"
"Siapa yang menjadi manager di Engineering?"
"List semua software engineer"
```

**Attendance Queries:**

```
"Siapa yang hadir hari ini?"
"Berapa jumlah absensi bulan ini?"
"Siapa yang terlambat minggu ini?"
"Status kehadiran John Doe hari ini"
```

**Shift Queries:**

```
"Jadwal shift siapa besok?"
"Berapa orang shift malam hari ini?"
"Kapan jadwal kerja John Doe minggu depan?"
"Siapa yang shift pagi tanggal 15?"
```

**Mixed/Complex Queries:**

```
"Berapa karyawan yang hadir hari ini dan siapa yang shift pagi?"
"Total karyawan aktif dan absensi bulan ini"
"Siapa karyawan IT yang sedang cuti minggu ini?"
```

### How It Works

```mermaid
graph LR
    A[User Query] --> B[Intent Detection]
    B --> C[Generate Embedding]
    C --> D[Vector Search]
    D --> E[Retrieve Context]
    E --> F[LLM Generation]
    F --> G[Response + Sources]
```

1. **Intent Detection**: Analyzes query to determine document types (employee, attendance, shift)
2. **Query Embedding**: Converts question to 384-dimensional vector
3. **Semantic Search**: Finds similar documents using cosine similarity
4. **Context Building**: Top K relevant documents formatted as context
5. **LLM Response**: Gemini generates natural language answer
6. **Source Attribution**: Returns answer with source documents and similarity scores

### Re-indexing Data

When you add/update employees, attendance, or shifts, data is automatically indexed. For bulk operations or initial setup:

**Admin Portal → Settings → AI Chatbot**

- Click "Re-index All Data"
- Or re-index specific document types
- Monitor indexing progress

## 📊 Database Schema

### Core Models

#### Multi-Tenancy

- **Organization**: Root entity for multi-tenancy with geofencing
- **User**: Authentication (Better Auth) linked to organization

#### HR Management

- **Employee**: Employee profiles with relationships
- **Department**: Organizational structure
- **Position**: Job roles with salary ranges and presence types
- **Attendance**: Check-in/check-out records with GPS & photos
- **EmployeeShift**: Shift allocation per employee per date
- **Shift**: Shift templates (Morning, Afternoon, Night)
- **AttendanceType**: Work days, holidays, leave types
- **PermissionRequest**: Leave/permission requests with approval workflow

#### Financial

- **Payroll**: Monthly payroll with allowances/deductions
- **AllowanceType**: Tunjangan definitions
- **EmployeeAllowance**: Employee-specific allowances

#### AI/ML

- **DocumentEmbedding**: Vector embeddings (384-dim) for semantic search
  - Stores: employee, attendance, shift data
  - Metadata: JSON for flexible attributes
- **ChatHistory**: Conversation logs with RAG metadata

#### System

- **Notification**: User notifications
- **Session**: Better Auth sessions
- **Account**: Better Auth accounts
- **Verification**: Email verification tokens

### Key Relationships

```
Organization
├── Users
├── Employees
│   ├── Department
│   ├── Position
│   ├── Manager (Employee)
│   ├── Attendances
│   ├── EmployeeShifts
│   ├── PermissionRequests
│   ├── Payrolls
│   └── Allowances
├── Shifts
├── AttendanceTypes
└── DocumentEmbeddings
```

## 🔧 Configuration

### Embedding Model

Local embedding using `all-MiniLM-L6-v2` (384 dimensions):

```typescript
// src/lib/local-embedding.ts
import { pipeline } from '@xenova/transformers'

const model = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')

export async function generateEmbedding(text: string): Promise<number[]> {
  const result = await model(text, {
    pooling: 'mean',
    normalize: true,
  })
  return Array.from(result.data)
}
```

**Why local embeddings?**

- ✅ Privacy-first (no data sent to external APIs)
- ✅ Fast processing (no network latency)
- ✅ Cost-effective (no embedding API costs)
- ✅ Offline capable

### Geofencing

Configure office location in Organization settings:

**Polygon Mode:**

- Draw area boundaries on map
- Stores as array of [lat, lng] coordinates

**Circular Mode:**

- Set center point (office coordinates)
- Define radius in meters
- Check-in allowed within radius

```typescript
// Organization model
{
  geoPolygon: Json?, // [[lat, lng], [lat, lng], ...]
  geoCenter: Json?,  // { lat: number, lng: number }
  geoRadius: Float?  // meters
}
```

### Date Handling

All dates normalized to UTC midnight for consistency across timezones:

```typescript
import {
  normalizeDateToUTC, // Date to UTC midnight
  normalizeTodayLocalToUTC, // Today in local timezone
  getMonthStartUTC, // First day of month
  getMonthEndUTC, // Last day of month
  iterateDateRange, // Iterate dates
} from '@/lib/date-utils'

// Example
const today = normalizeTodayLocalToUTC()
const startMonth = getMonthStartUTC(2024, 12)
```

### Role-Based Access Control

```typescript
enum Role {
  ADMIN        // Full system access
  HR_MANAGER   // HR operations (employees, attendance, payroll)
  MANAGER      // Department management
  EMPLOYEE     // Self-service portal only
}
```

**Route Protection:**

- Admin portal: `ADMIN`, `HR_MANAGER`, `MANAGER`
- Employee portal: All roles
- API: Protected by tRPC middleware

## 🌐 Deployment

### Vercel (Recommended)

1. **Prepare repository**

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Import to Vercel**

- Go to [Vercel Dashboard](https://vercel.com/dashboard)
- Click "New Project"
- Import your GitHub repository
- Configure settings (see below)

3. **Environment Variables**

Set in Vercel Dashboard → Settings → Environment Variables:

```env
# Production
BETTER_AUTH_SECRET=<generate-new-secret>
BETTER_AUTH_URL=https://your-domain.vercel.app
VITE_APP_URL=https://your-domain.vercel.app
DATABASE_URL=<neon-postgres-url>
GOOGLE_GEMINI_API_KEY=<your-api-key>

# Optional
OPENAI_API_KEY=<your-openai-key>
UPLOADTHING_SECRET=<your-ut-secret>
UPLOADTHING_APP_ID=<your-ut-app-id>
```

**Important:**

- Generate NEW `BETTER_AUTH_SECRET` for production
- Set variables for both "Production" and "Preview" environments
- After setting variables, trigger redeploy

4. **Database Setup (Neon)**

- Create database at [Neon](https://neon.tech/)
- Enable pgvector extension:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

- Copy connection string to `DATABASE_URL`
- Prisma will auto-migrate on deploy

5. **Build Settings**

Vercel auto-detects settings, but verify:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".output/public",
  "installCommand": "npm install"
}
```

6. **Deploy**

- Push to `main` branch → auto-deploys
- Or click "Deploy" in Vercel dashboard

### Post-Deployment

1. **Visit your app**: `https://your-domain.vercel.app`
2. **Register first user** (becomes Admin)
3. **Create organization**
4. **Import data & configure**
5. **Re-index AI data** (Settings → Re-index)

### Troubleshooting

**Better Auth ERR_BLOCKED_BY_CLIENT:**

- Ensure `basePath: "/session"` (not `/api/auth`)
- Check `VITE_APP_URL` matches your domain
- Clear browser cache/cookies

**Prisma Connection Issues:**

- Verify `DATABASE_URL` is correct
- Check Neon database is active
- Ensure pgvector extension is installed

**Build Failures:**

- Check Node.js version (22+)
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and reinstall

## 📦 Excel Import Format

### Employee Sheet (Required)

| Column          | Description            | Example          | Required |
| --------------- | ---------------------- | ---------------- | -------- |
| NIK/ID Karyawan | Employee ID            | EMP001           | ✅       |
| Nama Depan      | First Name             | John             | ✅       |
| Nama Belakang   | Last Name              | Doe              | ✅       |
| Email           | Email address          | john@example.com | ✅       |
| Telepon         | Phone number           | 081234567890     | ❌       |
| Department ID   | Department UUID        | dept-uuid-123    | ✅       |
| Position ID     | Position UUID          | pos-uuid-456     | ✅       |
| Tanggal Masuk   | Hire date (YYYY-MM-DD) | 2024-01-01       | ✅       |
| Gaji Pokok      | Base salary            | 5000000          | ✅       |
| Status          | ACTIVE or INACTIVE     | ACTIVE           | ✅       |

### Department Sheet (Optional - for reference)

| Column | Description     | Example       |
| ------ | --------------- | ------------- |
| ID     | Department UUID | dept-uuid-123 |
| Nama   | Department name | Engineering   |

### Position Sheet (Optional - for reference)

| Column        | Description       | Example           |
| ------------- | ----------------- | ----------------- |
| ID            | Position UUID     | pos-uuid-456      |
| Nama          | Position name     | Software Engineer |
| Department ID | Parent department | dept-uuid-123     |

### Download Template

**Admin Portal → Employees → Import → Download Template**

Template includes:

- Sample data
- All columns with proper formatting
- Department and Position reference sheets with actual IDs from your organization

### Import Process

1. **Fill Excel template** with your data
2. **Go to Admin Portal → Employees → Import**
3. **Upload XLSX file**
4. **Review validation results**
5. **Confirm import**
6. **Data automatically indexed** for AI chatbot

**Import Features:**

- ✅ Bulk create employees (100+ at once)
- ✅ Automatic validation (email, NIK uniqueness, etc.)
- ✅ Error reporting per row
- ✅ Rollback on critical errors
- ✅ Auto-generate Better Auth accounts
- ✅ Auto-embed for AI chatbot

## 🧪 Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server (port 3000)
npm run dev --port 3001  # Custom port

# Building
npm run build            # Production build
npm run serve            # Preview production build

# Database
npm run db:push          # Push schema to database
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Create migration
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Run seed script

# Code Quality
npm run lint             # Run Biome linter
npm run format           # Format code
npm run check            # Check code quality
npm run test             # Run tests

# Storybook
npm run storybook        # Start Storybook
npm run build-storybook  # Build Storybook
```

### Development Workflow

1. **Create feature branch**

```bash
git checkout -b feature/my-feature
```

2. **Make changes**
   - Update schema: `prisma/schema.prisma`
   - Push changes: `npm run db:push`
   - Generate types: Auto-generated

3. **Add tests** (Vitest)

```typescript
import { describe, it, expect } from 'vitest'

describe('MyFeature', () => {
  it('should work', () => {
    expect(true).toBe(true)
  })
})
```

4. **Commit with conventional commits**

```bash
git commit -m "feat: add employee bulk import"
git commit -m "fix: resolve attendance date timezone issue"
git commit -m "docs: update README"
```

5. **Push and create PR**

### Project Conventions

**File Naming:**

- Components: `PascalCase.tsx`
- Utilities: `kebab-case.ts`
- Routes: `kebab-case.tsx`

**Code Style:**

- Use Biome for formatting
- TypeScript strict mode
- Functional components with hooks
- Named exports for utilities

**Commit Messages:**

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code refactoring
- `test:` Tests
- `chore:` Maintenance

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

### Getting Started

1. **Fork the repository**
2. **Clone your fork**

```bash
git clone https://github.com/your-username/neuronperson.git
```

3. **Create feature branch**

```bash
git checkout -b feature/amazing-feature
```

4. **Make changes and test**
5. **Commit with conventional commits**
6. **Push to your fork**
7. **Open Pull Request**

### Pull Request Guidelines

- Clear description of changes
- Link related issues
- Add tests if applicable
- Update documentation
- Ensure CI passes
- Request review from maintainers

### Code Review Process

1. Automated checks (linting, types, tests)
2. Manual review by maintainers
3. Address feedback
4. Merge when approved

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### MIT License Summary

- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use
- ⚠️ No warranty
- ⚠️ No liability

## 🙏 Acknowledgments

Built with amazing open-source tools:

- [TanStack](https://tanstack.com/) - Powerful React tools (Router, Query, Store)
- [Better Auth](https://www.better-auth.com/) - Modern authentication
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [tRPC](https://trpc.io/) - End-to-end typesafe APIs
- [Radix UI](https://www.radix-ui.com/) - Accessible UI primitives
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful component library
- [Xenova](https://huggingface.co/Xenova) - Local transformer models
- [Google Gemini](https://ai.google.dev/) - Powerful LLM
- [Vercel](https://vercel.com/) - Deployment platform

Special thanks to all contributors and the open-source community! 🎉

## 📧 Support

Need help? We're here for you:

- **📖 Documentation**: [docs.neuronperson.com](https://docs.neuronperson.com)
- **💬 Discord**: [Join our community](https://discord.gg/neuronperson)
- **🐛 Bug Reports**: [GitHub Issues](https://github.com/yourusername/neuronperson/issues)
- **💡 Feature Requests**: [GitHub Discussions](https://github.com/yourusername/neuronperson/discussions)
- **📧 Email**: support@neuronperson.com

## 🗺️ Roadmap

### Q1 2025

- [ ] 📱 Mobile app (React Native)
- [ ] 🔔 Real-time notifications (Email/Push/SMS)
- [ ] 📊 Advanced analytics dashboard
- [ ] 📄 Export reports (PDF/Excel)
- [ ] 🌐 Multi-language support (English/Indonesian)

### Q2 2025

- [ ] 🎯 Performance review module
- [ ] 📝 Leave management v2 (carry-forward, accrual)
- [ ] 📁 Document management system
- [ ] 🔗 Integration with HR systems (SAP, Workday)
- [ ] 🎨 Custom branding per organization

### Q3 2025

- [ ] 🤖 Advanced AI features:
  - Predictive analytics (attrition risk)
  - Anomaly detection (attendance patterns)
  - Smart scheduling (AI-powered shift optimization)
- [ ] 📹 Video interview scheduling
- [ ] 💰 Benefits management
- [ ] 🏆 Employee recognition system

### Q4 2025

- [ ] 🌍 Global payroll support (multi-currency)
- [ ] 📚 Learning management system (LMS)
- [ ] 🔄 API marketplace for integrations
- [ ] 🎓 Certification tracking
- [ ] 📞 VoIP integration for calls

### Future

- Self-service password reset
- SSO (Single Sign-On) support
- Blockchain for credential verification
- Metaverse office integration
- AI-powered recruitment
- Employee wellness tracking

**Want to suggest a feature?** Open a discussion on GitHub!

## 📊 Project Stats

- **Lines of Code**: ~50,000+
- **Components**: 150+
- **API Endpoints**: 80+ tRPC procedures
- **Database Tables**: 25+
- **Test Coverage**: 75%+ (target: 90%)
- **Lighthouse Score**: 95+ (Performance, Accessibility, SEO)

## 🌟 Star History

If you find NeuronPerson useful, please consider giving it a star ⭐ on GitHub!

[![Star History Chart](https://api.star-history.com/svg
