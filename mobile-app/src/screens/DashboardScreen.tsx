import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTask } from '../contexts/TaskContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { tasks } = useTask();
  const { user } = useAuth();
  const { colors } = useTheme();

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const todayTasks = tasks.filter(task => {
    const today = new Date();
    return task.dueDate && 
           task.dueDate.getDate() === today.getDate() &&
           task.dueDate.getMonth() === today.getMonth() &&
           task.dueDate.getFullYear() === today.getFullYear();
  }).length;

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: string;
    color: string;
    onPress?: () => void;
  }> = ({ title, value, icon, color, onPress }) => (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor: colors.surface }]}
      onPress={onPress}
    >
      <MaterialIcons name={icon as any} size={24} color={color} />
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: colors.text }]}>
          {getGreeting()}, {user?.email?.split('@')[0] || 'User'}!
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Here's your productivity overview
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <StatCard
          title="Total Tasks"
          value={totalTasks}
          icon="assignment"
          color={colors.primary}
          onPress={() => navigation.navigate('Tasks' as never)}
        />
        <StatCard
          title="Completed"
          value={completedTasks}
          icon="check-circle"
          color={colors.success}
        />
        <StatCard
          title="Pending"
          value={pendingTasks}
          icon="pending"
          color={colors.warning}
        />
        <StatCard
          title="Due Today"
          value={todayTasks}
          icon="today"
          color={colors.error}
        />
      </View>

      <View style={styles.quickActions}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Quick Actions
        </Text>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('Tasks' as never)}
        >
          <MaterialIcons name="add" size={24} color="white" />
          <Text style={styles.actionButtonText}>Add New Task</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}
          onPress={() => navigation.navigate('Timeline' as never)}
        >
          <MaterialIcons name="timeline" size={24} color={colors.primary} />
          <Text style={[styles.actionButtonText, { color: colors.primary }]}>View Timeline</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Tasks */}
      <View style={styles.recentTasks}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Recent Tasks
        </Text>
        
        {tasks.slice(0, 3).map((task) => (
          <View
            key={task.id}
            style={[styles.taskItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <MaterialIcons
              name={task.completed ? "check-circle" : "radio-button-unchecked"}
              size={20}
              color={task.completed ? colors.success : colors.textSecondary}
            />
            <View style={styles.taskContent}>
              <Text
                style={[
                  styles.taskTitle,
                  { color: colors.text },
                  task.completed && { textDecorationLine: 'line-through', opacity: 0.6 }
                ]}
                numberOfLines={1}
              >
                {task.title}
              </Text>
              {task.dueDate && (
                <Text style={[styles.taskDue, { color: colors.textSecondary }]}>
                  Due: {task.dueDate.toLocaleDateString()}
                </Text>
              )}
            </View>
            <View style={[
              styles.priorityIndicator,
              { backgroundColor: 
                task.priority === 'high' ? colors.error :
                task.priority === 'medium' ? colors.warning : colors.success
              }
            ]} />
          </View>
        ))}

        {tasks.length === 0 && (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <MaterialIcons name="assignment" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No tasks yet. Create your first task to get started!
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('Tasks' as never)}
            >
              <Text style={styles.emptyButtonText}>Create Task</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    margin: 4,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statTitle: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  recentTasks: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  taskContent: {
    flex: 1,
    marginLeft: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  taskDue: {
    fontSize: 12,
    marginTop: 4,
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyState: {
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DashboardScreen;