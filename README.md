# DayFuse - React Native Productivity App

DayFuse is a cross-platform productivity app built with Expo (React Native) and Firebase that helps you manage your tasks effectively across all your devices.

## Features

- **Authentication**: Secure user authentication with Firebase Auth
- **Task Management**: Create, edit, delete, and organize tasks
- **Real-time Sync**: Tasks sync in real-time across devices using Firestore
- **Timeline View**: Visual timeline to track daily tasks
- **Priority Levels**: Organize tasks by priority (low, medium, high)
- **Status Tracking**: Track task progress (To-Do, Progress, Done)
- **Search & Filter**: Find and filter tasks easily
- **Drawer Navigation**: Intuitive navigation between different sections
- **Responsive Design**: Works seamlessly on phones and tablets

## Tech Stack

- **Expo SDK** (latest) - React Native development platform
- **React Navigation** (Drawer) - Navigation between screens
- **Firebase JS SDK v10+** - Authentication and real-time database
- **TypeScript** - Type-safe development
- **Expo Vector Icons** - Beautiful iconography
- **React Native DateTimePicker** - Date and time selection

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx
│   ├── TaskSummary.tsx
│   ├── SearchBar.tsx
│   ├── CategoryFilters.tsx
│   ├── TodaysTasksHorizontal.tsx
│   ├── VerticalTimeline.tsx
│   ├── FAB.tsx
│   └── AddTaskModal.tsx
├── contexts/           # React Context providers
│   ├── AuthContext.tsx
│   └── TaskContext.tsx
├── navigation/         # Navigation configuration
│   └── AppNavigator.tsx
├── screens/           # Screen components
│   ├── DashboardScreen.tsx
│   ├── HomeScreen.tsx
│   ├── TimelineScreen.tsx
│   ├── ProfileScreen.tsx
│   └── LoginScreen.tsx
└── firebase.ts        # Firebase configuration
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI: \`npm install -g @expo/cli\`
- Firebase project with Authentication and Firestore enabled

### Installation

1. **Install Expo CLI globally** (if not already installed):
   ```bash
   npm install -g @expo/cli
   ```

2. **Create a new Expo project** and copy the source code:
   ```bash
   npx create-expo-app DayFuse --template
   cd DayFuse
   ```

3. **Install required dependencies**:
   ```bash
   expo install react-native-gesture-handler react-native-reanimated react-native-safe-area-context react-native-screens @react-navigation/native @react-navigation/drawer @expo/vector-icons @react-native-community/datetimepicker expo-constants
   npm install firebase
   ```

4. **Copy the source files** from this repository to your Expo project:
   - Copy the \`src/\` folder
   - Copy \`App.tsx\`
   - Copy \`app.config.js\`
   - Copy other configuration files

### Firebase Configuration

1. **Create a Firebase project** at [https://console.firebase.google.com/](https://console.firebase.google.com/)

2. **Enable Authentication**:
   - Go to Authentication > Sign-in method
   - Enable "Email/Password" provider

3. **Enable Firestore Database**:
   - Go to Firestore Database
   - Create database in test mode (or production mode with appropriate rules)

4. **Get your Firebase configuration**:
   - Go to Project Settings > General
   - Scroll down to "Your apps" and click on the Web app
   - Copy the Firebase configuration object

5. **Update the Firebase configuration**:
   - Update \`app.config.js\` with your Firebase keys, or
   - Create a \`.env\` file with your Firebase configuration:
     ```
     FIREBASE_API_KEY=your-api-key
     FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
     FIREBASE_PROJECT_ID=your-project-id
     FIREBASE_STORAGE_BUCKET=your-project.appspot.com
     FIREBASE_MESSAGING_SENDER_ID=123456789
     FIREBASE_APP_ID=1:123456789:web:abcdef123456
     ```

### Firebase Security Rules

Update your Firestore security rules to allow authenticated users to access their own data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/tasks/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Running the App

### Development

```bash
# Start the development server
expo start

# Run on iOS simulator
expo start --ios

# Run on Android emulator
expo start --android

# Run on web browser
expo start --web
```

### Using Expo Dev Client

For the best development experience, use Expo Dev Client:

```bash
# Install Expo Dev Client
expo install expo-dev-client

# Build development client
eas build --profile development --platform ios
# or
eas build --profile development --platform android

# Start development server with dev client
expo start --dev-client
```

## Features Overview

### Dashboard Screen
- Personalized greeting with user's display name
- Monthly task summary with completion statistics
- Search functionality across all tasks
- Category filters (To-Do, Progress, Done, All)
- Today's tasks displayed in horizontal scrollable cards
- Floating action button to add new tasks

### Tasks Screen (Home)
- Complete list of all tasks with full CRUD operations
- Edit, delete, and mark tasks as complete/incomplete
- Priority level indicators and quick priority changes
- Task search and filtering capabilities
- Empty state handling

### Timeline Screen
- Week-based calendar navigation
- Visual timeline showing tasks for selected day
- Task count indicators for each day
- Interactive day selection
- Today highlighting

### Profile Screen
- User profile information
- Task statistics and analytics
- Priority breakdown visualization
- Account and app settings
- Sign out functionality

### Authentication
- Email/password sign-in and sign-up
- Secure authentication state management
- Automatic session persistence
- User-friendly error handling

### Task Management
- Create tasks with title, description, priority, and due date/time
- Real-time synchronization across devices
- Firestore subcollection structure (users/{uid}/tasks)
- Priority levels: low, medium, high
- Status tracking: todo, progress, done
- Due date and optional due time
- Automatic creation timestamp

## Data Model

Each task is stored with the following structure:

```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'progress' | 'done';
  dueDate: Timestamp;
  dueTime?: string;
  completed: boolean;
  createdAt: Timestamp;
}
```

## Design Theme

- **Primary Color**: Blue (#5B7FFF) - Day
- **Secondary Color**: Orange (#FFB833) - Fuse
- **Accent Colors**:
  - Red (#FF5A77) - High priority/To-Do
  - Yellow (#FFB833) - Medium priority/Progress
  - Green (#30D394) - Low priority/Done
- **Typography**: System fonts with clear hierarchy
- **Design**: Rounded corners, soft shadows, card-based layouts

## Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Troubleshooting

### Common Issues

1. **Firebase not connecting**: Make sure your Firebase configuration is correct in \`app.config.js\`
2. **Navigation errors**: Ensure all React Navigation dependencies are properly installed
3. **Date picker not working**: Make sure \`@react-native-community/datetimepicker\` is installed for your platform
4. **Build errors**: Try clearing the cache with \`expo start -c\`

### Support

For support and questions, please open an issue in the GitHub repository.