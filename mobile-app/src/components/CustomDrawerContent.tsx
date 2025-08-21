import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';

const CustomDrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { navigation } = props;

  const menuItems = [
    { name: 'Dashboard', icon: 'dashboard', route: 'Dashboard' },
    { name: 'My Tasks', icon: 'assignment', route: 'Tasks' },
    { name: 'Timeline', icon: 'timeline', route: 'Timeline' },
    { name: 'Profile', icon: 'person', route: 'Profile' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.userInfo}>
          <View style={[styles.avatar, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Text style={styles.avatarText}>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>
            {user?.email?.split('@')[0] || 'User'}
          </Text>
          <Text style={styles.userEmail} numberOfLines={1}>
            {user?.email}
          </Text>
        </View>
      </View>

      {/* Menu Items */}
      <ScrollView style={styles.menu}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.route}
            style={[
              styles.menuItem,
              navigation.getState().routes[navigation.getState().index].name === item.route && {
                backgroundColor: colors.primary + '20',
              }
            ]}
            onPress={() => navigation.navigate(item.route)}
          >
            <MaterialIcons
              name={item.icon as any}
              size={24}
              color={
                navigation.getState().routes[navigation.getState().index].name === item.route
                  ? colors.primary
                  : colors.textSecondary
              }
            />
            <Text
              style={[
                styles.menuText,
                {
                  color:
                    navigation.getState().routes[navigation.getState().index].name === item.route
                      ? colors.primary
                      : colors.text,
                }
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <View style={styles.appInfo}>
          <Text style={[styles.appName, { color: colors.primary }]}>
            DayFuse
          </Text>
          <Text style={[styles.appVersion, { color: colors.textSecondary }]}>
            Version 1.0.0
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 48,
  },
  userInfo: {
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  menu: {
    flex: 1,
    paddingTop: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 16,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
  },
  appInfo: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 12,
  },
});

export default CustomDrawerContent;