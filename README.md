# DayFuse - Intelligent Task Management Platform

<div align="center">
  <h3>🚀 Productivity meets modern design</h3>
  <p>A comprehensive cross-platform task management solution with native push notifications, real-time synchronization, and seamless PWA capabilities.</p>
</div>

---

## 📋 Project Overview

**DayFuse** is a dual-platform productivity solution offering both a Progressive Web App (PWA) and native mobile applications built with Expo React Native. It provides a unified experience across web and mobile, utilizing a shared Firebase backend for real-time data synchronization. The project aims to deliver a robust and seamless task management experience to users on their preferred devices, combining the accessibility of a PWA with the rich features of native mobile applications.

### Key Capabilities

- **Cross-Platform Accessibility**: Available as an installable PWA for web browsers and as native mobile applications for iOS and Android
- **Real-time Task Management**: Full CRUD operations for tasks with real-time synchronization across all platforms via Firebase Firestore
- **Native Push Notifications**: Device-level push notifications with interactive actions for task reminders
- **Authentication**: Secure user authentication and management through Firebase Auth
- **Recurring Tasks**: Support for daily, weekly, and monthly recurring tasks with calendar integration
- **Intuitive UI/UX**: Mobile-first design, touch-optimized interfaces, and personalized user experiences

---

## 🛠️ Tech Stack

### Frontend Architecture
- **React 18.3.1** with TypeScript for type-safe development
- **Vite** for fast development and optimized production builds
- **Tailwind CSS 3.x** with custom design system and dark mode support
- **Wouter** for lightweight client-side routing
- **Radix UI** primitives for accessible and customizable components
- **shadcn/ui** for consistent component library
- **Framer Motion** for smooth animations and micro-interactions

### Backend & Data
- **Express.js** with TypeScript for API endpoints
- **Firebase Firestore** for real-time data synchronization
- **Firebase Authentication** for secure user management
- **PostgreSQL + Drizzle ORM** for structured data storage
- **Neon Database** for serverless PostgreSQL hosting

### Mobile Applications
- **Expo React Native** for cross-platform mobile development
- **Expo Notifications** for native device push notifications
- **React Navigation** for native mobile navigation patterns
- **AsyncStorage** for offline data persistence

### Development Tools
- **TypeScript** for type safety across the entire stack
- **TanStack Query** for server state management
- **React Hook Form** with Zod validation
- **ESBuild** for server-side bundling
- **Drizzle Kit** for database migrations

### External Services
- **Firebase** (Authentication, Firestore, Cloud Messaging)
- **SendGrid** for email communications
- **Neon Database** for PostgreSQL hosting
- **Web Push API** for browser notifications

---

## 🎨 Design System & Theme

### Color Palette
```css
/* Primary Brand Colors */
--day-blue: #5B7FFF        /* Primary brand color */
--fuse-orange: #FFB833     /* Secondary brand color */
--accent-red: #FF5A77      /* Error/high priority */
--accent-yellow: #FFB833   /* Warning/medium priority */
--accent-green: #30D394    /* Success/low priority */

/* Light Mode */
--background: #FFFFFF
--foreground: #0F172A
--card: #FFFFFF
--border: #E2E8F0
--primary: #1E293B
--secondary: #F1F5F9
--muted: #F8FAFC

/* Dark Mode */
--background: #0F172A
--foreground: #F8FAFC
--card: #1E293B
--border: #334155
--primary: #F8FAFC
--secondary: #334155
--muted: #1E293B
```

### Typography
- **Primary Font**: Inter (Google Fonts)
- **Font Weights**: 300, 400, 500, 600, 700
- **Mobile Optimizations**: Dynamic viewport height (100dvh)
- **Touch Optimizations**: Enhanced touch interactions and safe area handling

### Layout Principles
- **Mobile-First**: Responsive design starting from 320px
- **Card-Based**: Consistent card layout with soft shadows
- **8px Grid System**: Consistent spacing using Tailwind's spacing scale
- **Safe Areas**: iOS safe area inset support for mobile devices

### Component Styling Patterns
```css
/* Card Components */
.card-style {
  border-radius: 0.75rem;          /* 12px rounded corners */
  border: 1px solid var(--border);
  background: var(--card);
  padding: 1rem;                   /* 16px padding */
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* Interactive Elements */
.interactive-hover {
  transition: all 0.2s ease;
  cursor: pointer;
}
.interactive-hover:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

/* Priority Color System */
.priority-high { border-color: #FCA5A5; background: #FEF2F2; }
.priority-medium { border-color: #FDE68A; background: #FFFBEB; }
.priority-low { border-color: #BBF7D0; background: #F0FDF4; }
```

### Mobile Optimizations
- **Touch Targets**: Minimum 44px tap targets for accessibility
- **Smooth Scrolling**: `-webkit-overflow-scrolling: touch`
- **Overscroll Behavior**: `overscroll-behavior: contain`
- **Tap Highlights**: Disabled for clean interactions
- **Safe Area Insets**: Dynamic padding for iPhone notch/home indicator

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd dayfuse
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   
   Add your Firebase configuration as Replit secrets or environment variables:
   ```bash
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5000
   ```

### Development Commands

```bash
# Start development server (Express + Vite)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run check

# Database operations
npm run db:push
```

---

## 📱 Mobile App Deployment

### Option 1: Native Mobile App (Recommended)

1. **Create Expo project**
   ```bash
   # Create new Expo project in Replit
   # Copy files from /mobile-app/ folder
   npx expo start
   ```

2. **Test on device**
   - Install Expo Go app
   - Scan QR code
   - Test native push notifications

3. **Build for app stores**
   ```bash
   npm install -g eas-cli
   eas build --platform android --profile production
   eas build --platform ios --profile production
   ```

4. **Submit to stores**
   ```bash
   eas submit --platform android
   eas submit --platform ios
   ```

### Option 2: PWA to Mobile App

1. **Deploy web app**
   - Click "Deploy" in Replit
   - Get public URL

2. **Generate app packages**
   - Visit PWABuilder.com
   - Enter your URL
   - Download store packages

3. **Submit to app stores**
   - Upload to Microsoft Store, Google Play, iOS App Store

---

## ✨ Features

### Core Functionality
- ✅ **Task Management**: Create, edit, delete, and organize tasks
- ✅ **Real-time Sync**: Changes sync instantly across all devices
- ✅ **Priority System**: High, medium, low priority with visual indicators
- ✅ **Due Dates & Times**: Schedule tasks with notifications
- ✅ **Recurring Tasks**: Daily, weekly, monthly repetition
- ✅ **Task Status**: Todo, In Progress, Done workflow
- ✅ **Search & Filter**: Find tasks quickly by title, priority, or status

### User Experience
- ✅ **Dark/Light Mode**: System-aware theme switching
- ✅ **Responsive Design**: Optimized for mobile, tablet, and desktop
- ✅ **PWA Support**: Installable on any device
- ✅ **Offline Mode**: Works without internet connection
- ✅ **Touch Optimized**: Gesture-friendly mobile interface

### Notifications
- ✅ **Push Notifications**: Browser and native device notifications
- ✅ **Interactive Actions**: Mark complete, snooze from notifications
- ✅ **Smart Scheduling**: Notifications based on due times
- ✅ **Cross-Platform**: Notifications work on web and mobile

### Authentication & Security
- ✅ **Firebase Auth**: Secure email/password authentication
- ✅ **Session Management**: Persistent login across sessions
- ✅ **User Data Protection**: Firebase security rules
- ✅ **Cross-Device Sync**: Same account across all platforms

---

## 🗂️ Project Structure

```
dayfuse/
├── client/                    # Web app frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── contexts/         # React contexts (Auth, Tasks, Theme)
│   │   ├── lib/              # Utilities and configurations
│   │   ├── pages/            # Page components
│   │   └── App.tsx           # Main app component
│   ├── public/               # Static assets and PWA files
│   └── index.html            # Entry HTML file
├── mobile-app/               # React Native mobile app
│   ├── src/
│   │   ├── components/       # Mobile components
│   │   ├── contexts/         # Shared contexts
│   │   ├── screens/          # Mobile screens
│   │   ├── navigation/       # Navigation setup
│   │   └── services/         # Native services
│   ├── App.tsx               # Mobile app entry
│   └── app.json              # Expo configuration
├── server/                   # Express backend
│   ├── index.ts              # Server entry point
│   ├── routes.ts             # API routes
│   └── storage.ts            # Data storage interface
├── shared/                   # Shared types and schemas
│   └── schema.ts             # Database schemas
└── docs/                     # Documentation
    ├── MOBILE_DEPLOYMENT_COMPLETE.md
    ├── STEP_BY_STEP_DEPLOYMENT.md
    └── EXPO_SETUP.md
```

---

## 🔧 Configuration

### Environment Variables
```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id

# Optional Services
SENDGRID_API_KEY=your_sendgrid_key
```

### PWA Configuration
- **Manifest**: `/client/public/manifest.json`
- **Service Worker**: `/client/public/sw.js`
- **Icons**: Multiple sizes (48px to 512px) for all platforms

### Firebase Setup
1. Create Firebase project
2. Enable Authentication (Email/Password)
3. Create Firestore database
4. Add web app configuration
5. Set up security rules

---

## 🛣️ Roadmap

### Phase 1: Core Platform ✅
- [x] Web app with task management
- [x] Firebase authentication and sync
- [x] PWA capabilities
- [x] Push notifications
- [x] Mobile-optimized design

### Phase 2: Mobile Apps ✅
- [x] React Native mobile app
- [x] Native push notifications
- [x] Cross-platform navigation
- [x] App store optimization

### Phase 3: Enhanced Features 🚧
- [ ] Team collaboration
- [ ] Task dependencies
- [ ] Time tracking
- [ ] Analytics dashboard
- [ ] File attachments

### Phase 4: Advanced Features 📋
- [ ] AI-powered task suggestions
- [ ] Calendar integration
- [ ] Voice commands
- [ ] Habit tracking
- [ ] Productivity insights

---

## 📄 App Store Information

### App Store Costs & Timeline
| Store | Cost | Approval Time | Method |
|-------|------|---------------|---------|
| Microsoft Store | $19 one-time | 24-48 hours | PWA |
| Google Play | $25 one-time | 2-3 days | Native App |
| iOS App Store | $99/year | 1-7 days | Native App |

### App Descriptions
**Short**: "Powerful task manager with smart notifications and real-time sync"

**Long**: "DayFuse transforms your productivity with intelligent task management, native push notifications, and seamless cross-device synchronization. Perfect for professionals, students, and anyone serious about productivity."

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Radix UI** for accessible component primitives
- **shadcn/ui** for beautiful component designs
- **Firebase** for backend infrastructure
- **Expo** for mobile development platform
- **Tailwind CSS** for utility-first styling

---

<div align="center">
  <p>Built with ❤️ for productivity enthusiasts</p>
  <p>
    <a href="#-quick-start">Get Started</a> •
    <a href="#-features">Features</a> •
    <a href="#-mobile-app-deployment">Deploy Mobile</a> •
    <a href="#-roadmap">Roadmap</a>
  </p>
</div>