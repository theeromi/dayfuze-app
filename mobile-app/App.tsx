import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import contexts
import { AuthProvider } from './src/contexts/AuthContext';
import { TaskProvider } from './src/contexts/TaskContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import { ThemeProvider } from './src/contexts/ThemeContext';

// Import navigation
import AppNavigator from './src/navigation/AppNavigator';

// Import notification setup
import { registerForPushNotificationsAsync, setupNotificationHandlers } from './src/services/notificationService';

export default function App() {
  useEffect(() => {
    // Setup notifications when app loads
    registerForPushNotificationsAsync();
    setupNotificationHandlers();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <PaperProvider>
          <AuthProvider>
            <NotificationProvider>
              <TaskProvider>
                <NavigationContainer>
                  <AppNavigator />
                  <StatusBar style="auto" />
                </NavigationContainer>
              </TaskProvider>
            </NotificationProvider>
          </AuthProvider>
        </PaperProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}