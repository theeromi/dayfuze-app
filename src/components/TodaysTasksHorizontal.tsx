import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../contexts/TaskContext';

interface TodaysTasksHorizontalProps {
  tasks: Task[];
  onTaskPress: (task: Task) => void;
}

const TodaysTasksHorizontal: React.FC<TodaysTasksHorizontalProps> = ({ tasks, onTaskPress }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todaysTasks = tasks.filter(task => {
    const taskDate = task.dueDate.toDate();
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() === today.getTime();
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return '#FF5A77';
      case 'progress':
        return '#FFB833';
      case 'done':
        return '#30D394';
      default:
        return '#666';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'flag';
      case 'medium':
        return 'flag-outline';
      case 'low':
        return 'flag-outline';
      default:
        return 'flag-outline';
    }
  };

  if (todaysTasks.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Today's Tasks</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tasks for today</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Today's Tasks</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tasksContainer}>
          {todaysTasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={[styles.taskCard, { borderLeftColor: getStatusColor(task.status) }]}
              onPress={() => onTaskPress(task)}
            >
              <View style={styles.taskHeader}>
                <Ionicons 
                  name={getPriorityIcon(task.priority)} 
                  size={16} 
                  color={task.priority === 'high' ? '#FF5A77' : '#666'} 
                />
                <Text style={styles.taskTime}>
                  {task.dueTime || ''}
                </Text>
              </View>
              <Text style={styles.taskTitle} numberOfLines={2}>
                {task.title}
              </Text>
              <Text style={styles.taskDescription} numberOfLines={2}>
                {task.description}
              </Text>
              <View style={styles.taskFooter}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
                  <Text style={styles.statusText}>
                    {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    marginHorizontal: 20,
  },
  tasksContainer: {
    paddingLeft: 20,
    flexDirection: 'row',
  },
  taskCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    width: 250,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTime: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    marginHorizontal: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default TodaysTasksHorizontal;