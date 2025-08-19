import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../contexts/TaskContext';

interface VerticalTimelineProps {
  selectedDate: Date;
  tasks: Task[];
  onTaskPress: (task: Task) => void;
}

const VerticalTimeline: React.FC<VerticalTimelineProps> = ({ 
  selectedDate, 
  tasks, 
  onTaskPress 
}) => {
  const selectedDateStart = new Date(selectedDate);
  selectedDateStart.setHours(0, 0, 0, 0);
  
  const selectedDateEnd = new Date(selectedDate);
  selectedDateEnd.setHours(23, 59, 59, 999);

  const filteredTasks = tasks.filter(task => {
    const taskDate = task.dueDate.toDate();
    return taskDate >= selectedDateStart && taskDate <= selectedDateEnd;
  }).sort((a, b) => {
    const timeA = a.dueTime || '00:00';
    const timeB = b.dueTime || '00:00';
    return timeA.localeCompare(timeB);
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (filteredTasks.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.dateHeader}>{formatDate(selectedDate)}</Text>
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No tasks for this day</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.dateHeader}>{formatDate(selectedDate)}</Text>
      <ScrollView style={styles.timelineContainer}>
        {filteredTasks.map((task, index) => (
          <View key={task.id} style={styles.timelineItem}>
            <View style={styles.timelineLeft}>
              <Text style={styles.timeText}>{task.dueTime || '--:--'}</Text>
            </View>
            <View style={styles.timelineLine}>
              <View style={[styles.timelineDot, { backgroundColor: getStatusColor(task.status) }]} />
              {index < filteredTasks.length - 1 && <View style={styles.timelineConnector} />}
            </View>
            <TouchableOpacity 
              style={styles.timelineRight}
              onPress={() => onTaskPress(task)}
            >
              <View style={[styles.taskCard, { borderLeftColor: getStatusColor(task.status) }]}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskTitle} numberOfLines={1}>
                    {task.title}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
                    <Text style={styles.statusText}>
                      {task.status}
                    </Text>
                  </View>
                </View>
                {task.description && (
                  <Text style={styles.taskDescription} numberOfLines={2}>
                    {task.description}
                  </Text>
                )}
                <View style={styles.taskFooter}>
                  <Text style={styles.priorityText}>
                    Priority: {task.priority}
                  </Text>
                  <Ionicons 
                    name={task.completed ? 'checkmark-circle' : 'ellipse-outline'} 
                    size={20} 
                    color={task.completed ? '#30D394' : '#ccc'} 
                  />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  dateHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  timelineContainer: {
    flex: 1,
    padding: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineLeft: {
    width: 60,
    alignItems: 'center',
    paddingTop: 10,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  timelineLine: {
    width: 20,
    alignItems: 'center',
    position: 'relative',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 10,
  },
  timelineConnector: {
    position: 'absolute',
    top: 22,
    width: 2,
    height: 60,
    backgroundColor: '#e0e0e0',
  },
  timelineRight: {
    flex: 1,
    marginLeft: 20,
  },
  taskCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
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
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 12,
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
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
});

export default VerticalTimeline;