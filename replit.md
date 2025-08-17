# replit.md

## Overview

This is a full-stack web application designed for beauty salons ("Salão de Beleza"). It provides a comprehensive management system covering client relations, appointment scheduling, service management, sales tracking, and a robust review system. The project aims to streamline salon operations, enhance customer engagement, and provide valuable business insights.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React with TypeScript
- **Routing**: Wouter
- **Styling**: Tailwind CSS (custom theme) and Radix UI primitives with shadcn/ui components
- **State Management**: TanStack React Query for server state
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API
- **Authentication**: Passport.js (local, Google OAuth)
- **Session Management**: Express session
- **Password Handling**: Node.js `crypto` module (scrypt hashing)

### Database
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL (Neon serverless)
- **Schema Management**: Drizzle Kit for migrations
- **Connection**: @neondatabase/serverless connector

### Key Features
- **Authentication**: Local and Google OAuth, password reset, role-based access control.
- **Client Management**: User profiles, CRUD for client data.
- **Appointment System**: Service-based booking, status management, admin oversight, and conflict validation for 40-minute intervals.
- **Sales Management**: Transaction recording, multiple payment methods, sales history.
- **Review System**: Client review submission with ratings, nested comments, like/thumbs-up functionality, and user profile images.
- **Service Management**: Categorized services, pricing, descriptions, imagery, and admin CRUD for services and categories.
- **Content Management**: Admin panels for managing homepage banner, footer content, and site-wide configuration (name, logo, primary color).
- **Image Storage**: Images are stored as Base64 directly in PostgreSQL to ensure persistence across deployments.
- **Email System**: Multi-channel email system (SendGrid, Gmail fallback) for password recovery.

### Data Flow
User authentication establishes sessions. Authenticated users interact with services, appointments, and reviews. Admin users manage clients, view appointments, record sales, and moderate content. All operations persist via Drizzle ORM to PostgreSQL. React Query handles caching and data synchronization.

## External Dependencies

### Core
- **@neondatabase/serverless**: PostgreSQL connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **passport**: Authentication middleware
- **nodemailer**: Email functionality
- **connect-pg-simple**: PostgreSQL session store

### UI
- **@radix-ui/**: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **react-hook-form**: Form management
- **zod**: Schema validation

### Development & Build
- **vite**: Build tool and development server
- **typescript**: Type checking
- **tsx**: TypeScript execution
- **esbuild**: Production bundling