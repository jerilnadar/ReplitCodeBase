# Ministry Scheduler Application

## Overview

A church music ministry scheduling application built with React and Express. The system enables music ministry team members to submit their monthly availability, view service schedules, and receive notifications. Pastors can create services, assign team members, and approve schedules. The application features role-based access control, real-time notifications, and a comprehensive dashboard for managing church music ministry logistics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack React Query for server state and data fetching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database Layer**: Drizzle ORM with PostgreSQL
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful endpoints with role-based middleware

### Database Design
- **Primary Database**: PostgreSQL with Neon serverless driver
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Key Tables**: 
  - Users (authentication and profile data)
  - Availabilities (monthly availability submissions)
  - Services (worship service scheduling)
  - Service assignments (team member role assignments)
  - Notifications (system messaging)
  - Sessions (authentication session storage)

### Authentication & Authorization
- **Provider**: Replit Auth integration for user authentication
- **Session Storage**: PostgreSQL-backed session store with connect-pg-simple
- **Role-Based Access**: Member and pastor roles with different permissions
- **Security**: HTTP-only cookies, CSRF protection, and secure session management

### Data Flow Architecture
- **Client-Server Communication**: REST API with JSON payloads
- **State Synchronization**: React Query for caching and background updates
- **Error Handling**: Centralized error boundaries with user-friendly messaging
- **Loading States**: Skeleton loaders and optimistic updates

### Development Workflow
- **Build System**: Vite for frontend bundling, esbuild for server compilation
- **Development Server**: Hot module replacement with proxy setup
- **Type Safety**: Full TypeScript coverage across frontend, backend, and shared schemas
- **Code Sharing**: Shared schema definitions between client and server

## External Dependencies

### Authentication Services
- **Replit Auth**: Primary authentication provider using OpenID Connect
- **OpenID Client**: Passport.js strategy for OAuth integration

### Database & Storage
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database operations and migrations
- **Connect PG Simple**: PostgreSQL session store for Express

### UI & Design System
- **Radix UI**: Headless component primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Icon library for consistent iconography
- **Date-fns**: Date manipulation and formatting utilities

### Development Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Static type checking and enhanced developer experience
- **ESBuild**: Fast JavaScript bundler for server-side code
- **React Query**: Server state management and data synchronization

### Validation & Forms
- **Zod**: Schema validation for API requests and responses
- **React Hook Form**: Form state management with validation
- **Drizzle Zod**: Integration between Drizzle schemas and Zod validation