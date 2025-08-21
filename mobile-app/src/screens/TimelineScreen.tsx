import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useTask } from '../contexts/TaskContext';
import { useTheme } from '../contexts/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';

const TimelineScreen: React.FC = () => {
  const { tasks } = useTask();
  const { colors } = useTheme();

  // Group tasks by date
  const groupTasksByDate = () => {
    const grouped: { [key: string]: any[] } = {};
    
    tasks
      .filter(task => task.dueDate)
      .sort((a, b) => (a.dueDate?.getTime() || 0) - (b.dueDate?.getTime() || 0))
      .forEach(task => {
        if (task.dueDate) {
          const dateKey = task.dueDate.toDateString();
          if (!grouped[dateKey]) {
            grouped[dateKey] = [];
          }
          grouped[dateKey].push(task);
        }
      });
    
    return grouped;
  };

  const groupedTasks = groupTasksByDate();
  const dateKeys = Object.keys(groupedTasks);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const TaskTimelineItem: React.FC<{ task: any; isLast: boolean }> = ({ task, isLast }) => (
    <View style={styles.timelineItem}>
      <View style={styles.timelineLeft}>
        <View style={[
          styles.timelineMarker,
          { backgroundColor: task.completed ? colors.success : colors.primary }
        ]}>
          <MaterialIcons
            name={task.completed ? "check" : "schedule"}
            size={12}
            color="white"
          />
        </View>
        {!isLast && <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />}
      </View>

      <View style={[styles.timelineContent, { backgroundColor: colors.surface }]}>
        <Text
          style={[
            styles.taskTitle,
            { color: colors.text },
            task.completed && { textDecorationLine: 'line-through', opacity: 0.6 }
          ]}
        >
          {task.title}
        </Text>
        
        {task.description && (
          <Text style={[styles.taskDescription, { color: colors.textSecondary }]}>
            {task.description}
          </Text>
        )}

        <View style={styles.taskDetails}>
          {task.dueTime && (
            <View style={styles.detailItem}>
              <MaterialIcons name="access-time" size={12} color={colors.textSecondary} />
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                {task.dueTime}
              </Text>
            </View>
          )}
          
          <View style={[
            styles.priorityBadge,
            { backgroundColor: 
              task.priority === 'high' ? colors.error :
              task.priority === 'medium' ? colors.warning : colors.success
            }
          ]}>
            <Text style={styles.priorityText}>{task.priority}</Text>
          </View>

          <View style={[
            styles.statusBadge,
            { backgroundColor: task.completed ? colors.success : colors.warning }
          ]}>
            <Text style={styles.statusText}>
              {task.completed ? 'Completed' : 'Pending'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {dateKeys.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
          <MaterialIcons name="timeline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No scheduled tasks yet
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Tasks with due dates will appear here in chronological order
          </Text>
        </View>
      ) : (
        <View style={styles.timeline}>
          {dateKeys.map((dateKey) => {
            const dateTasks = groupedTasks[dateKey];
            return (
              <View key={dateKey} style={styles.dateSection}>
                <View style={[styles.dateHeader, { backgroundColor: colors.primary }]}>
                  <Text style={styles.dateHeaderText}>
                    {formatDate(dateKey)}
                  </Text>
                  <Text style={styles.taskCount}>
                    {dateTasks.length} task{dateTasks.length !== 1 ? 's' : ''}
                  </Text>
                </View>

                <View style={styles.dateTasks}>
                  {dateTasks.map((task, index) => (
                    <TaskTimelineItem
                      key={task.id}
                      task={task}
                      isLast={index === dateTasks.length - 1}
                    />
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  timeline: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  dateSection: {
    marginBottom: 24,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  dateHeaderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  taskCount: {
    color: 'white',
    fontSize: 12,
    opacity: 0.9,
  },
  dateTasks: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  taskDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  priorityText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '500',
  },
  emptyState: {
    margin: 20,
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.8,
  },
});

export default TimelineScreen;