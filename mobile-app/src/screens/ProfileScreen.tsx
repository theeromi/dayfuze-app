import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationContext';
import { MaterialIcons } from '@expo/vector-icons';

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme, colors } = useTheme();
  const { isNotificationEnabled, requestNotificationPermission } = useNotifications();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: logout
        }
      ]
    );
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive task reminders.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const SettingItem: React.FC<{
    icon: string;
    title: string;
    subtitle?: string;
    rightElement?: React.ReactNode;
    onPress?: () => void;
  }> = ({ icon, title, subtitle, rightElement, onPress }) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: colors.surface }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <MaterialIcons name={icon as any} size={24} color={colors.primary} />
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement || (
        onPress && <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* User Info */}
      <View style={[styles.userSection, { backgroundColor: colors.surface }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={[styles.userEmail, { color: colors.text }]}>
          {user?.email || 'User'}
        </Text>
        <Text style={[styles.userSince, { color: colors.textSecondary }]}>
          Member since {new Date().getFullYear()}
        </Text>
      </View>

      {/* Preferences */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Preferences
        </Text>

        <SettingItem
          icon="notifications"
          title="Push Notifications"
          subtitle={isNotificationEnabled ? "Enabled" : "Disabled"}
          rightElement={
            <Switch
              value={isNotificationEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isNotificationEnabled ? 'white' : colors.textSecondary}
            />
          }
        />

        <SettingItem
          icon="palette"
          title="Theme"
          subtitle={theme === 'system' ? 'Follow system' : 
                   theme === 'dark' ? 'Dark mode' : 'Light mode'}
          onPress={() => {
            Alert.alert(
              'Choose Theme',
              'Select your preferred theme',
              [
                { text: 'Light', onPress: () => setTheme('light') },
                { text: 'Dark', onPress: () => setTheme('dark') },
                { text: 'System', onPress: () => setTheme('system') },
                { text: 'Cancel', style: 'cancel' }
              ]
            );
          }}
        />
      </View>

      {/* Support */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Support
        </Text>

        <SettingItem
          icon="help"
          title="Help & FAQ"
          subtitle="Get help with using DayFuse"
          onPress={() => {
            Alert.alert('Help', 'Help documentation coming soon!');
          }}
        />

        <SettingItem
          icon="feedback"
          title="Send Feedback"
          subtitle="Help us improve DayFuse"
          onPress={() => {
            Alert.alert('Feedback', 'Feedback form coming soon!');
          }}
        />

        <SettingItem
          icon="star"
          title="Rate App"
          subtitle="Rate DayFuse in the app store"
          onPress={() => {
            Alert.alert('Rate App', 'App store rating coming soon!');
          }}
        />
      </View>

      {/* App Info */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          About
        </Text>

        <SettingItem
          icon="info"
          title="Version"
          subtitle="1.0.0"
        />

        <SettingItem
          icon="privacy-tip"
          title="Privacy Policy"
          onPress={() => {
            Alert.alert('Privacy Policy', 'Privacy policy will be displayed here.');
          }}
        />

        <SettingItem
          icon="description"
          title="Terms of Service"
          onPress={() => {
            Alert.alert('Terms of Service', 'Terms of service will be displayed here.');
          }}
        />
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.error }]}
          onPress={handleLogout}
        >
          <MaterialIcons name="logout" size={24} color="white" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          Made with ❤️ for productivity
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  userSection: {
    alignItems: 'center',
    padding: 32,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userSince: {
    fontSize: 14,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingContent: {
    flex: 1,
    marginLeft: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    padding: 32,
  },
  footerText: {
    fontSize: 12,
  },
});

export default ProfileScreen;