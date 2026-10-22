#  First Step Wealth Group Platform

> **Empowering newcomers and families through financial education, rental guarantee, insurance strategies, and wealth-building opportunities across Canada.**

A full‑stack financial services platform connecting newcomers, immigrants, and underserved families with rental guarantees, insurance protection, real estate guidance, and wealth‑building tools.

---

## Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Database Models](#-database-models)
- [Authentication Flow](#-authentication-flow)
- [Frontend Architecture](#-frontend-architecture)
- [Design System](#-design-system)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## Overview

**First Step Wealth Group (FSWG)** is a Canadian financial services platform designed to help newcomers, immigrants, and underserved families overcome financial barriers. The platform offers:

- **Rental Guarantee Program** – Guarantees rent for newcomers without Canadian credit history
- **Insurance Advisory** – Life, critical illness, disability, and income protection
- **Real Estate Support** – From first‑time home buying to investment properties
- **Wealth Building** – Investment advisory, retirement planning, and financial education
- **Advisor Network** – Career opportunities as licensed financial advisors

The platform serves **30+ newcomer families** across **10 Canadian cities** and **7 provinces**, with a mission to close the wealth gap one financial decision at a time.

---

##  Features

###  Rental Guarantee
- Newcomer-focused rental support without credit history
- Landlord partnership program
- Interactive eligibility checker
- WhatsApp integration for instant inquiries
- Multi‑city coverage across Canada

###  Insurance & Protection
- Compare policies from 10+ Canadian insurers
- Life, critical illness, disability, and income protection
- Career pathway to become a licensed advisor
- Paid training and mentorship programs

### Real Estate Support
- Free mortgage pre‑approval guidance
- Vetted real estate agent connections
- First‑time home buyer programs
- Investment property analysis

###  Wealth Intelligence
- Compound interest calculator (10‑60 year projections)
- Adjustable return rates (10%, 15%, 20%, 25%)
- Interactive bar charts with detailed breakdowns
- Portfolio diversification strategies

### 👥 Advisor Network
- Submit applications to join as financial advisors
- Training module tracking
- Mentor assignment system
- Admin dashboard for application review

###  Admin Dashboard
- Lead management with status tracking
- Client management (CRUD operations)
- Content management system (pages, blogs, testimonials)
- Service catalog management

### Super Admin Command Center
- Role `super_admin` with `/dashboard/super` god-mode surface (Pulse, War Room, kill switches, impersonation, visitor map, omniscience)
- Bot detection / blocking on public APIs
- See [docs/SUPER_ADMIN.md](docs/SUPER_ADMIN.md) for bootstrap (no seed data), env vars, and threat playbooks
- Audit logging for compliance
- Funnel analytics and conversion tracking

###  Interactive Features
- **Leaflet.js map** showing impact across 10 Canadian cities
- Clickable city markers with success stories
- WhatsApp integration for landlord partnerships
- Lead capture forms with dual CTA (account creation or WhatsApp)

###  Authentication & Security
- JWT‑based authentication with HTTP‑only cookies
- Role‑based access control (Admin, Consultant, Client)
- Password reset flow with token expiration
- Rate limiting on sensitive endpoints
- Input sanitization and validation

###  Responsive Design
- Mobile‑first approach with full‑width sections on mobile
- Bento‑grid layouts on desktop
- Smooth Framer Motion animations
- Optimized for all screen sizes

---

## Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime |
| **Express.js** | Web framework |
| **TypeScript** | Type safety |
| **MongoDB** | Database (via Mongoose ODM) |
| **JWT** | Authentication |
| **bcryptjs** | Password hashing |
| **Inngest** | Background jobs & cron |
| **Multer** | File uploads |
| **Helmet** | Security headers |
| **CORS** | Cross‑origin requests |
| **Morgan** | HTTP request logging |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI library |
| **TypeScript** | Type safety |
| **Vite** | Build tool |
| **Tailwind CSS** | Utility‑first styling |
| **shadcn/ui** | Component library |
| **Framer Motion** | Animations |
| **React Hook Form** | Form management |
| **Zod** | Schema validation |
| **React Router v7** | Client‑side routing |
| **Leaflet.js** | Interactive maps |
| **Axios** | HTTP client |
| **Sonner** | Toast notifications |
| **Lucide React** | Icon library |

---

##  Project Structure
fswg/
├── .gitignore
├── README.md
│
├── backend/
│ ├── package.json
│ ├── tsconfig.json
│ ├── .env.example
│ ├── render.yaml
│ ├── uploads/
│ │ └── .gitkeep
│ └── src/
│ ├── server.ts # Express app entry point
│ ├── config/
│ │ └── db.ts # MongoDB connection
│ ├── controllers/
│ │ ├── advisorApplicationController.ts
│ │ ├── auditLogController.ts
│ │ ├── consultationController.ts
│ │ ├── contentController.ts
│ │ ├── dashboardController.ts
│ │ ├── funnelController.ts
│ │ ├── leadController.ts
│ │ ├── rentalApplicationController.ts
│ │ ├── searchController.ts
│ │ ├── serviceController.ts
│ │ ├── uploadController.ts
│ │ └── userController.ts
│ ├── ingest/
│ │ └── index.ts # Inngest background jobs
│ ├── middleware/
│ │ ├── auth.ts # JWT auth & role guards
│ │ ├── upload.ts # File upload handling
│ │ ├── errorHandler.ts # Global error handling
│ │ ├── validation.ts # Input validation
│ │ └── index.ts # Middleware barrel export
│ ├── models/
│ │ ├── AdvisorApplication.ts
│ │ ├── AuditLog.ts
│ │ ├── Consultation.ts
│ │ ├── Content.ts
│ │ ├── Lead.ts
│ │ ├── RentalApplication.ts
│ │ ├── RentalGuarantee.ts
│ │ ├── Service.ts
│ │ └── User.ts
│ ├── routes/
│ │ ├── advisorApplicationRoutes.ts
│ │ ├── auditLogRoutes.ts
│ │ ├── consultationRoutes.ts
│ │ ├── contentRoutes.ts
│ │ ├── dashboardRoutes.ts
│ │ ├── funnelRoutes.ts
│ │ ├── leadRoutes.ts
│ │ ├── rentalApplicationRoutes.ts
│ │ ├── searchRoutes.ts
│ │ ├── serviceRoutes.ts
│ │ ├── uploadRoutes.ts
│ │ └── userRoutes.ts
│ └── utils/
│ ├── generateToken.ts # JWT generation
│ ├── logAudit.ts # Audit logging
│ ├── emailService.ts # Email templates
│ ├── helpers.ts # General utilities
│ └── validators.ts # Validation helpers
│
└── frontend/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── components.json
├── postcss.config.js
├── vercel.json
├── netlify.toml
├── index.html
└── src/
├── main.tsx # App entry point
├── App.tsx # Root component
├── index.css # Tailwind + CSS variables
├── vite-env.d.ts # Vite type declarations
├── types/
│ └── index.ts # TypeScript interfaces
├── lib/
│ ├── api.ts # Axios instance
│ ├── utils.ts # cn() utility
│ └── searchIndex.ts # Static search data
├── hooks/
│ ├── AuthProvider.tsx # Auth context
│ ├── useIsMobile.ts
│ ├── useDebounce.ts
│ ├── useLocalStorage.ts
│ ├── useMediaQuery.ts
│ ├── useScrollPosition.ts
│ ├── useIntersectionObserver.ts
│ ├── useFormSubmit.ts
│ ├── usePagination.ts
│ ├── useModal.ts
│ └── index.ts
├── components/
│ ├── auth/
│ │ └── UniversalUserForm.tsx
│ ├── global/
│ │ ├── ConsultationBookingModal.tsx
│ │ ├── CustomAlert.tsx
│ │ ├── CustomInput.tsx
│ │ ├── CustomMultiSelect.tsx
│ │ ├── CustomPagination.tsx
│ │ ├── CustomSelect.tsx
│ │ ├── DataViewModal.tsx
│ │ ├── LeadCaptureModal.tsx
│ │ ├── Modal.tsx
│ │ ├── PillarDetailModal.tsx
│ │ ├── Search.tsx
│ │ └── SearchResults.tsx
│ ├── home/
│ │ ├── Hero.tsx
│ │ ├── Navbar.tsx
│ │ ├── Footer.tsx
│ │ ├── RentalGuaranteeSection.tsx
│ │ ├── RentalInfoModal.tsx
│ │ ├── InsuranceRecruitmentSection.tsx
│ │ ├── ProcessSection.tsx
│ │ ├── TestimonialSection.tsx
│ │ ├── FAQSection.tsx
│ │ ├── EducationSection.tsx
│ │ ├── ServicesSection.tsx
│ │ ├── WealthProjectionSection.tsx
│ │ ├── GlobalImpactSection.tsx
│ │ ├── WhyChooseUsSection.tsx
│ │ ├── TrustSection.tsx
│ │ └── CTASection.tsx
│ ├── provider/
│ │ └── theme.tsx
│ ├── sidebar/
│ │ ├── AppSidebar.tsx
│ │ ├── nav-main.tsx
│ │ ├── nav-user.tsx
│ │ ├── team-switcher.tsx
│ │ └── theme-toggle.tsx
│ └── ui/ # shadcn/ui components
│ ├── button.tsx
│ ├── input.tsx
│ ├── select.tsx
│ ├── dialog.tsx
│ ├── card.tsx
│ ├── table.tsx
│ ├── sidebar.tsx
│ └── ... (25+ components)
└── pages/
├── Home.tsx
├── Login.tsx
├── Register.tsx
├── ForgotPassword.tsx
├── ResetPassword.tsx
├── Dashboard.tsx
├── Blog.tsx
├── BlogPost.tsx
├── Consultations.tsx
├── Bookings.tsx
├── JoinNetwork.tsx
├── RentalApplications.tsx
├── NewRentalApplication.tsx
├── ServiceList.tsx
├── admin/
│ ├── AuditLogs.tsx
│ ├── ClientManagement.tsx
│ ├── ContentManagement.tsx
│ ├── DashboardActivity.tsx
│ ├── LeadManagement.tsx
│ ├── ServiceManagement.tsx
│ ├── AdvisorApplications.tsx
│ ├── FunnelAnalytics.tsx
│ └── ... (filter variants)
└── routes/
├── PrivateRoutes.tsx
└── router.tsx

##  Prerequisites

Before running the project, ensure you have:

- **Node.js** v18+ installed
- **MongoDB** running locally or a [MongoDB Atlas](https://mongodb.com/atlas) account
- **npm** v9+ (comes with Node.js)
- **Git** for version control

##  Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/fswg-platform.git
cd fswg-platform

cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# MONGO_URL=mongodb://localhost:27017/fswg-platform
# JWT_SECRET=your-secure-jwt-secret
# CLIENT_URL=http://localhost:5173

# Start development server
npm run dev

cd frontend

# Install dependencies
npm install

# Install shadcn/ui components (first time only)
npx shadcn@2.0.0 init
npx shadcn@2.0.0 add button input label select switch textarea checkbox card dialog sheet separator badge skeleton accordion collapsible popover dropdown-menu tabs table avatar tooltip alert alert-dialog sidebar

# Manually create missing components
# Create src/components/ui/field.tsx (see below)
# Create src/components/ui/multi-select.tsx (see below)

# Start development server
npm run dev

cd frontend

# Install dependencies
npm install

# Install shadcn/ui components (first time only)
npx shadcn@2.0.0 init
npx shadcn@2.0.0 add button input label select switch textarea checkbox card dialog sheet separator badge skeleton accordion collapsible popover dropdown-menu tabs table avatar tooltip alert alert-dialog sidebar

# Manually create missing components
# Create src/components/ui/field.tsx (see below)
# Create src/components/ui/multi-select.tsx (see below)

# Start development server
npm run dev

# Server
PORT=5000
NODE_ENV=development
STAGE=development

# Database
MONGO_URL=mongodb://localhost:27017/fswg-platform

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production-abc123

# Client
CLIENT_URL=http://localhost:5173

# Email (optional)
EMAIL_FROM=hello@firststepwealth.ca