# Overview

**DayFuse** has been completely transformed from a web-based PWA to a **cross-platform mobile app** built with Expo and React Native. This productivity-focused task management application now provides native mobile experiences across iOS and Android platforms, while maintaining the core functionality of task creation, organization, and tracking with Firebase integration.

The application follows a mobile-first React Native architecture using Expo SDK, Firebase for authentication and real-time data synchronization, and modern React Native patterns for state management and navigation.

## Recent Changes (August 19, 2025)

✓ **Complete Platform Migration**: Transformed from web React to Expo React Native for cross-platform mobile development
✓ **Mobile-First Architecture**: Rebuilt all components and screens for React Native with TypeScript
✓ **Navigation System**: Implemented React Navigation with drawer-based navigation pattern
✓ **Firebase Integration**: Maintained Firebase Auth and Firestore with mobile-optimized contexts and providers
✓ **Screen Components**: Created complete screen structure (Dashboard, Tasks, Timeline, Profile, Login)
✓ **UI Components**: Built comprehensive component library for mobile interface (Header, FAB, Modals, Filters, etc.)
✓ **Task Management**: Full CRUD operations with real-time sync, priority levels, and status tracking
✓ **Mobile UX Features**: Touch-optimized interfaces, horizontal scrolling, timeline views, and native date/time pickers
✓ **Authentication Flow**: Complete sign-in/sign-up flow with Firebase Auth integration
✓ **TypeScript Integration**: Full type safety across all components and contexts

## Migration Status

**✅ COMPLETED FEATURES:**
- Complete Expo React Native project structure
- All screens implemented (Dashboard, Tasks, Timeline, Profile, Login)
- All reusable components created
- Firebase configuration and contexts
- Authentication system with Firebase Auth
- Task management with Firestore real-time sync
- Navigation with React Navigation drawer
- TypeScript integration throughout
- Mobile-optimized UI/UX patterns

**🔧 SETUP REQUIRED:**
- Expo CLI installation and project initialization
- React Native dependencies installation
- Firebase project configuration with real credentials
- Expo development environment setup

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
- **Push Notifications**: Web Push API with Service Worker for task reminders
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
- Service Worker for push notifications and PWA caching
- Web Push API for scheduled task reminders

## Push Notification Features

**Notification System Architecture**:
- **Service Worker**: `/client/public/sw.js` handles push notifications, caching, and offline functionality
- **Notification Manager**: `/client/src/lib/notifications.ts` provides singleton notification service
- **Real-time Scheduling**: Tasks with due times automatically schedule browser-based push notifications
- **User Controls**: Notification settings component in Profile page with permission management

**Key Features**:
- **Task Reminder Notifications**: Push notifications at scheduled task times
- **Permission Management**: Graceful handling of notification permissions with user-friendly UI
- **Notification Actions**: "Mark Complete" and "Snooze 10min" actions in notifications
- **Cross-session Persistence**: Notifications work even when the app is closed
- **PWA Integration**: Enhanced Progressive Web App with offline capabilities