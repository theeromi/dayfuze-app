import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import { TaskProvider } from './src/contexts/TaskContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <TaskProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </TaskProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}