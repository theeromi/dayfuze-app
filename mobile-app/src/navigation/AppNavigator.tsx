import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import TasksScreen from '../screens/TasksScreen';
import TimelineScreen from '../screens/TimelineScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoadingScreen from '../screens/LoadingScreen';

// Import custom drawer
import CustomDrawerContent from '../components/CustomDrawerContent';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

// Auth Stack for login/register
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
  </Stack.Navigator>
);

// Main App Drawer Navigation
const AppDrawer = () => (
  <Drawer.Navigator
    drawerContent={(props) => <CustomDrawerContent {...props} />}
    screenOptions={{
      headerShown: true,
      headerStyle: {
        backgroundColor: '#5B7FFF',
      },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      drawerActiveTintColor: '#5B7FFF',
      drawerInactiveTintColor: '#666666',
    }}
  >
    <Drawer.Screen 
      name="Dashboard" 
      component={DashboardScreen}
      options={{
        title: 'DayFuse Dashboard',
        drawerLabel: 'Dashboard'
      }}
    />
    <Drawer.Screen 
      name="Tasks" 
      component={TasksScreen}
      options={{
        title: 'My Tasks',
        drawerLabel: 'Tasks'
      }}
    />
    <Drawer.Screen 
      name="Timeline" 
      component={TimelineScreen}
      options={{
        title: 'Task Timeline',
        drawerLabel: 'Timeline'
      }}
    />
    <Drawer.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{
        title: 'Profile & Settings',
        drawerLabel: 'Profile'
      }}
    />
  </Drawer.Navigator>
);

// Root Navigator
const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return user ? <AppDrawer /> : <AuthStack />;
};

export default AppNavigator;