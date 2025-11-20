# Bu Luxury Hairs Invoice Maker

## Overview

Bu Luxury Hairs Invoice Maker is a professional invoice generation system designed for a hair business. The application enables single and bulk invoice creation with auto-incrementing invoice numbers, live preview functionality, and instant PDF/JPEG downloads. It features password-protected access, customizable branding with logo upload, and maintains an invoice history for tracking and re-downloading past invoices.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR and optimized production builds
- Wouter for lightweight client-side routing

**UI Component System**
- shadcn/ui component library based on Radix UI primitives
- Material Design principles with professional customization (as per design_guidelines.md)
- Tailwind CSS for utility-first styling with custom design tokens
- Inter font family for clean, professional typography

**State Management & Data Fetching**
- TanStack React Query (v5) for server state management, caching, and API interactions
- React Hook Form with Zod resolvers for type-safe form validation
- Session storage for authentication state persistence

**Invoice Generation**
- html2canvas for rendering invoice previews to canvas elements
- jsPDF for PDF generation from canvas snapshots
- Support for both PDF and JPEG export formats

### Backend Architecture

**Server Framework**
- Express.js with TypeScript for the HTTP server
- ESM module system throughout the codebase
- Custom Vite middleware integration for development HMR

**API Structure**
- RESTful API endpoints under `/api` namespace
- Authentication via password verification endpoint (`/api/auth/verify`)
- Settings management for logo and app configuration (`/api/settings/*`)
- Invoice CRUD operations through storage abstraction layer

**Data Persistence Layer**
- Storage abstraction interface (`IStorage`) for flexible data layer implementation
- `DbStorage` class implementing the storage interface with Drizzle ORM
- Database schema with two main tables: `invoices` and `settings`
- Auto-incrementing invoice number logic managed at the application level

### Database Design

**Schema Structure** (Drizzle ORM with PostgreSQL)
- `invoices` table: Stores invoice records with UUID primary keys, unique invoice numbers, customer details, and optional PRE codes
- `settings` table: Key-value store for application configuration (password, logo, last invoice number)
- UUID generation using PostgreSQL's `gen_random_uuid()` function

**Migration System**
- Drizzle Kit for schema migrations and database synchronization
- Type-safe schema definitions with Drizzle Zod integration for runtime validation

### Authentication & Security

**Password Protection**
- Simple password-based access control (default: "bu2025")
- Password stored in settings table, verifiable via `/api/auth/verify` endpoint
- Session-based authentication using sessionStorage on client
- No complex user management or JWT tokens (single-user application)

### External Dependencies

**Database**
- Neon Serverless PostgreSQL via `@neondatabase/serverless` package
- Connection pooling handled by Neon's HTTP-based driver
- Drizzle ORM (v0.39+) for type-safe database operations

**PDF Generation**
- jsPDF library for client-side PDF creation
- html2canvas for DOM-to-canvas rendering at 3x scale for high-quality output

**UI Component Libraries**
- Radix UI primitives for accessible, unstyled component foundations (accordion, dialog, popover, select, etc.)
- date-fns for date formatting and manipulation
- embla-carousel-react for potential carousel functionality

**Development Tools**
- tsx for TypeScript execution in development
- esbuild for production server bundling
- Replit-specific plugins for development banners and error overlays

**Session Management**
- connect-pg-simple for PostgreSQL-backed session storage (though not actively used in current authentication flow)

### Design System

**Color Scheme**
- Neutral-based color palette with customizable CSS variables
- Primary brand color: Orange (HSL 9 75% 61%)
- Support for light mode with Material Design elevation system

**Component Patterns**
- Card-based layouts for content sectioning
- Consistent spacing using Tailwind's spacing scale (2, 4, 6, 8 units)
- Form validation with real-time feedback
- Toast notifications for user feedback

### File Organization

**Client Structure**
- `/client/src/components`: Reusable UI components and shadcn/ui components
- `/client/src/pages`: Route-level page components
- `/client/src/lib`: Utility functions, query client, and business logic
- `/client/src/hooks`: Custom React hooks

**Server Structure**
- `/server/index.ts`: Express application setup and middleware
- `/server/routes.ts`: API route definitions
- `/server/storage.ts`: Data access layer abstraction
- `/server/db.ts`: Database connection initialization

**Shared Code**
- `/shared/schema.ts`: Drizzle schema definitions shared between client and server
- Type definitions exported for use across the application

### Build & Deployment

**Development Mode**
- Vite dev server with HMR for client
- tsx watch mode for server with live reload
- Integrated development experience via Vite middleware

**Production Build**
- Client: Vite build output to `dist/public`
- Server: esbuild bundle to `dist/index.js` with external packages
- Single Node.js process serves both static assets and API

**Environment Requirements**
- `DATABASE_URL`: PostgreSQL connection string (required)
- `NODE_ENV`: Environment flag for production/development behavior