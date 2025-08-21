# Overview

DayFuse is a dual-platform productivity solution, offering both a Progressive Web App (PWA) and native mobile apps built with Expo React Native. It provides a unified experience across web and mobile, utilizing a shared Firebase backend for real-time data synchronization. The project aims to deliver a robust and seamless task management experience to users on their preferred devices, combining the accessibility of a PWA with the rich features of native mobile applications.

## Key Capabilities

-   **Cross-Platform Accessibility**: Available as an installable PWA for web browsers and as native mobile applications for iOS and Android.
-   **Real-time Task Management**: Full CRUD operations for tasks with real-time synchronization across all platforms via Firebase Firestore.
-   **Native Push Notifications**: Device-level push notifications with interactive actions for task reminders.
-   **Authentication**: Secure user authentication and management through Firebase Auth.
-   **Recurring Tasks**: Support for daily, weekly, and monthly recurring tasks with calendar integration.
-   **Intuitive UI/UX**: Mobile-first design, touch-optimized interfaces, and personalized user experiences.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is built using React with TypeScript, following a component-based architecture. It leverages Radix UI primitives and shadcn/ui for accessible and customizable components, styled with Tailwind CSS for consistent theming. Wouter is used for lightweight client-side routing, while React Context API manages authentication and task states. TanStack Query handles server state management, and Vite ensures fast development and optimized production builds. The design prioritizes mobile-first responsiveness and includes PWA capabilities with service worker implementation for offline functionality.

## Backend Architecture

The backend uses Express.js with TypeScript, featuring a modular structure with middleware for JSON parsing and error handling. It employs a modular route registration system. An abstract storage interface is designed for database integration, currently using an in-memory solution.

## Data Storage Solutions

The primary database is PostgreSQL, configured through Drizzle ORM with schema management via Drizzle migrations and hosted on Neon Database. Drizzle ORM with Zod integration ensures type-safe database operations. Client-side storage and real-time data synchronization are handled by Firebase, utilizing Firebase Auth for user management and Firestore for real-time task data. Web Push API via a Service Worker provides task reminders.

## Authentication and Authorization

Firebase Authentication is the primary provider for user authentication, supporting email/password methods. Firebase handles session management and token refresh. A React Context provides authentication state throughout the application, and routes are protected based on authentication status. Authorization is managed through Firebase security rules and user context validation.

## Push Notification Features

The notification system architecture relies on a Service Worker (`/client/public/sw.js`) for handling push notifications, caching, and offline functionality. A singleton notification manager (`/client/src/lib/notifications.ts`) provides notification services. Tasks with due times automatically schedule browser-based push notifications. Key features include task reminder notifications, graceful permission management with user-friendly UI, interactive actions like "Mark Complete" and "Snooze 10min", and cross-session persistence ensuring notifications work even when the app is closed.

# External Dependencies

## UI and Design

-   **Radix UI**: Accessible component foundations.
-   **Tailwind CSS**: Utility-first styling.
-   **Lucide React**: Consistent iconography.
-   **Custom fonts**: Inter, DM Sans, Architects Daughter, Fira Code, Geist Mono.

## Development and Build

-   **Vite**: Development server and build optimization.
-   **TypeScript**: Type safety across the stack.
-   **ESBuild**: Server-side bundling.
-   **PostCSS with Autoprefixer**: CSS processing.

## Database and Backend

-   **Neon Database**: Serverless PostgreSQL hosting.
-   **Drizzle ORM**: Type-safe database operations.
-   **Express session management**: With connect-pg-simple.

## Utilities and Validation

-   **Zod**: Runtime type validation and schema definition.
-   **Date-fns**: Date manipulation and formatting.
-   **Class Variance Authority**: Component variant management.
-   **React Hook Form with Hookform Resolvers**: Form management.

## Development Tools

-   **Replit**: Development environment integration.
-   **Firebase emulators**: Local development.
-   **Service Worker**: Push notifications and PWA caching.
-   **Web Push API**: Scheduled task reminders.