# Overview

DayFuse is a productivity-focused task management application built as a Progressive Web App (PWA). The application allows users to create, organize, and track their daily tasks with features like priority levels, status tracking, due dates, and calendar integration. It's designed with a mobile-first approach and provides a clean, intuitive interface for managing personal productivity.

The application follows a modern full-stack architecture with a React frontend and Express backend, utilizing Firebase for authentication and data storage, and Drizzle ORM for database management.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is built using React with TypeScript and follows a component-based architecture:

- **UI Framework**: React with TypeScript for type safety
- **Styling**: Tailwind CSS with custom design tokens for consistent theming
- **UI Components**: Radix UI primitives with shadcn/ui component library for accessible, customizable components
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Context API for authentication and task management state
- **Data Fetching**: TanStack Query for server state management and caching
- **Build Tool**: Vite for fast development and optimized production builds

The frontend follows a mobile-first responsive design with PWA capabilities including service worker implementation for offline functionality.

## Backend Architecture

The backend uses Express.js with TypeScript in a modular structure:

- **Framework**: Express.js with middleware for JSON parsing and request logging
- **Development**: Hot reloading with Vite integration in development mode
- **Error Handling**: Centralized error handling middleware
- **Routing**: Modular route registration system with API prefix structure
- **Storage Interface**: Abstract storage interface allowing for multiple implementations (currently in-memory, designed for database integration)

## Data Storage Solutions

**Primary Database**: PostgreSQL configured through Drizzle ORM
- **Schema Management**: Drizzle migrations in `/migrations` directory
- **Database Client**: Neon Database serverless PostgreSQL
- **ORM**: Drizzle ORM with Zod integration for type-safe database operations
- **Schema Definition**: Centralized schema in `/shared/schema.ts` with user management tables

**Client-side Storage**: Firebase integration for real-time data and authentication
- **Authentication**: Firebase Auth for user management
- **Real-time Database**: Firestore for task data with real-time synchronization
- **Development**: Firebase emulators for local development environment

## Authentication and Authorization

**Authentication Provider**: Firebase Authentication
- **Methods**: Email/password authentication with user profile management
- **Session Management**: Firebase handles token refresh and session persistence
- **User Context**: React Context provides authentication state throughout the application
- **Protected Routes**: Route-level protection based on authentication status

**Authorization**: Role-based access through Firebase security rules and user context validation

## External Dependencies

**UI and Design**:
- Radix UI primitives for accessible component foundations
- Tailwind CSS for utility-first styling
- Lucide React for consistent iconography
- Custom fonts: Inter, DM Sans, Architects Daughter, Fira Code, Geist Mono

**Development and Build**:
- Vite for development server and build optimization
- TypeScript for type safety across the stack
- ESBuild for server-side bundling
- PostCSS with Autoprefixer for CSS processing

**Database and Backend**:
- Neon Database for serverless PostgreSQL hosting
- Drizzle ORM for type-safe database operations
- Express session management with connect-pg-simple

**Utilities and Validation**:
- Zod for runtime type validation and schema definition
- Date-fns for date manipulation and formatting
- Class Variance Authority for component variant management
- React Hook Form with Hookform Resolvers for form management

**Development Tools**:
- Replit integration for development environment
- Firebase emulators for local development
- Runtime error overlay for development debugging