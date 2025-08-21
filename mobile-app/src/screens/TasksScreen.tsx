import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTask } from '../contexts/TaskContext';
import { useTheme } from '../contexts/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';

const TasksScreen: React.FC = () => {
  const { tasks, loading, toggleTaskComplete, deleteTask } = useTask();
  const { colors } = useTheme();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const handleDeleteTask = (taskId: string, taskTitle: string) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${taskTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteTask(taskId)
        }
      ]
    );
  };

  const TaskItem: React.FC<{ task: any }> = ({ task }) => (
    <View style={[styles.taskItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <TouchableOpacity
        style={styles.taskCheck}
        onPress={() => toggleTaskComplete(task.id)}
      >
        <MaterialIcons
          name={task.completed ? "check-circle" : "radio-button-unchecked"}
          size={24}
          color={task.completed ? colors.success : colors.textSecondary}
        />
      </TouchableOpacity>

      <View style={styles.taskContent}>
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
          <Text
            style={[styles.taskDescription, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {task.description}
          </Text>
        )}

        <View style={styles.taskMeta}>
          {task.dueDate && (
            <View style={styles.metaItem}>
              <MaterialIcons name="schedule" size={12} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {task.dueDate.toLocaleDateString()}
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
        </View>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteTask(task.id, task.title)}
      >
        <MaterialIcons name="delete" size={20} color={colors.error} />
      </TouchableOpacity>
    </View>
  );

  const FilterButton: React.FC<{ title: string; value: typeof filter; count: number }> = 
    ({ title, value, count }) => (
      <TouchableOpacity
        style={[
          styles.filterButton,
          { backgroundColor: filter === value ? colors.primary : colors.surface },
        ]}
        onPress={() => setFilter(value)}
      >
        <Text
          style={[
            styles.filterText,
            { color: filter === value ? 'white' : colors.text }
          ]}
        >
          {title} ({count})
        </Text>
      </TouchableOpacity>
    );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.filters}>
        <FilterButton 
          title="All" 
          value="all" 
          count={tasks.length} 
        />
        <FilterButton 
          title="Pending" 
          value="pending" 
          count={tasks.filter(t => !t.completed).length} 
        />
        <FilterButton 
          title="Completed" 
          value="completed" 
          count={tasks.filter(t => t.completed).length} 
        />
      </View>

      {filteredTasks.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
          <MaterialIcons 
            name={
              filter === 'completed' ? "check-circle" : 
              filter === 'pending' ? "pending-actions" : "assignment"
            } 
            size={48} 
            color={colors.textSecondary} 
          />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {filter === 'completed' ? 'No completed tasks yet' :
             filter === 'pending' ? 'No pending tasks' : 
             'No tasks yet. Create your first task!'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          renderItem={({ item }) => <TaskItem task={item} />}
          keyExtractor={(item) => item.id}
          style={styles.tasksList}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => {/* TODO: Navigate to add task */}}
      >
        <MaterialIcons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tasksList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  taskCheck: {
    marginRight: 12,
    paddingTop: 2,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
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
  deleteButton: {
    marginLeft: 12,
    paddingTop: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
    padding: 40,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

export default TasksScreen;