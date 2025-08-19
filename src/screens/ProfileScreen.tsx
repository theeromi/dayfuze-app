import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTask } from '../contexts/TaskContext';
import Header from '../components/Header';

const ProfileScreen: React.FC = () => {
  const { currentUser, handleLogout } = useAuth();
  const { tasks } = useTask();

  const handleLogoutPress = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: handleLogout
        },
      ]
    );
  };

  const getTaskStats = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    
    const priorityCounts = {
      high: tasks.filter(task => task.priority === 'high').length,
      medium: tasks.filter(task => task.priority === 'medium').length,
      low: tasks.filter(task => task.priority === 'low').length,
    };

    return {
      total: totalTasks,
      completed: completedTasks,
      pending: pendingTasks,
      priority: priorityCounts,
    };
  };

  const stats = getTaskStats();

  const displayName = currentUser?.displayName || 'User';
  const email = currentUser?.email || 'No email';

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color 
  }: { 
    title: string; 
    value: number; 
    icon: string; 
    color: string;
  }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Ionicons name={icon as any} size={24} color="#ffffff" />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  const MenuOption = ({ 
    title, 
    icon, 
    onPress, 
    color = '#666',
    showArrow = true 
  }: { 
    title: string; 
    icon: string; 
    onPress: () => void; 
    color?: string;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity style={styles.menuOption} onPress={onPress}>
      <View style={styles.menuLeft}>
        <Ionicons name={icon as any} size={24} color={color} />
        <Text style={[styles.menuTitle, { color }]}>{title}</Text>
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color="#5B7FFF" />
            </View>
          </View>
          <Text style={styles.displayName}>{displayName}</Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        {/* Task Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Task Statistics</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Tasks"
              value={stats.total}
              icon="list-outline"
              color="#5B7FFF"
            />
            <StatCard
              title="Completed"
              value={stats.completed}
              icon="checkmark-circle-outline"
              color="#30D394"
            />
            <StatCard
              title="Pending"
              value={stats.pending}
              icon="time-outline"
              color="#FFB833"
            />
          </View>
        </View>

        {/* Priority Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Priority Breakdown</Text>
          <View style={styles.priorityContainer}>
            <View style={styles.priorityItem}>
              <View style={[styles.priorityDot, { backgroundColor: '#FF5A77' }]} />
              <Text style={styles.priorityLabel}>High Priority</Text>
              <Text style={styles.priorityCount}>{stats.priority.high}</Text>
            </View>
            <View style={styles.priorityItem}>
              <View style={[styles.priorityDot, { backgroundColor: '#FFB833' }]} />
              <Text style={styles.priorityLabel}>Medium Priority</Text>
              <Text style={styles.priorityCount}>{stats.priority.medium}</Text>
            </View>
            <View style={styles.priorityItem}>
              <View style={[styles.priorityDot, { backgroundColor: '#30D394' }]} />
              <Text style={styles.priorityLabel}>Low Priority</Text>
              <Text style={styles.priorityCount}>{stats.priority.low}</Text>
            </View>
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuContainer}>
            <MenuOption
              title="Edit Profile"
              icon="person-outline"
              onPress={() => Alert.alert('Coming Soon', 'Profile editing will be available soon.')}
            />
            <MenuOption
              title="Notification Settings"
              icon="notifications-outline"
              onPress={() => Alert.alert('Coming Soon', 'Notification settings will be available soon.')}
            />
            <MenuOption
              title="Privacy Settings"
              icon="shield-outline"
              onPress={() => Alert.alert('Coming Soon', 'Privacy settings will be available soon.')}
            />
          </View>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          <View style={styles.menuContainer}>
            <MenuOption
              title="About DayFuse"
              icon="information-circle-outline"
              onPress={() => Alert.alert('DayFuse', 'Your productivity companion\n\nVersion 1.0.0')}
            />
            <MenuOption
              title="Help & Support"
              icon="help-circle-outline"
              onPress={() => Alert.alert('Help', 'For support, please contact us at support@dayfuse.com')}
            />
            <MenuOption
              title="Sign Out"
              icon="log-out-outline"
              onPress={handleLogoutPress}
              color="#FF5A77"
              showArrow={false}
            />
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#ffffff',
    marginBottom: 20,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    marginHorizontal: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statContent: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  priorityContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  priorityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  priorityLabel: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  priorityCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5B7FFF',
  },
  menuContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default ProfileScreen;