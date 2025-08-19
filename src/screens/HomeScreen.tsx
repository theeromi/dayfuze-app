import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTask, Task } from '../contexts/TaskContext';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import CategoryFilters, { FilterType } from '../components/CategoryFilters';
import FAB from '../components/FAB';
import AddTaskModal from '../components/AddTaskModal';

const HomeScreen: React.FC = () => {
  const { tasks, loading, deleteTask, toggleTaskCompletion, setTaskPriority } = useTask();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    
    const matchesFilter = activeFilter === 'all' || task.status === activeFilter;
    
    return matchesSearch && matchesFilter;
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#FF5A77';
      case 'medium':
        return '#FFB833';
      case 'low':
        return '#30D394';
      default:
        return '#666';
    }
  };

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
        },
      ]
    );
  };

  const handleToggleCompletion = async (taskId: string) => {
    try {
      await toggleTaskCompletion(taskId);
    } catch (error) {
      Alert.alert('Error', 'Failed to update task completion status');
    }
  };

  const handlePriorityChange = (taskId: string, currentPriority: string) => {
    const priorities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
    const currentIndex = priorities.indexOf(currentPriority as any);
    const nextPriority = priorities[(currentIndex + 1) % priorities.length];
    
    setTaskPriority(taskId, nextPriority);
  };

  const renderTaskItem = ({ item }: { item: Task }) => (
    <View style={[styles.taskCard, { borderLeftColor: getStatusColor(item.status) }]}>
      <View style={styles.taskHeader}>
        <TouchableOpacity
          style={styles.completionButton}
          onPress={() => handleToggleCompletion(item.id)}
        >
          <Ionicons 
            name={item.completed ? 'checkmark-circle' : 'ellipse-outline'} 
            size={24} 
            color={item.completed ? '#30D394' : '#ccc'} 
          />
        </TouchableOpacity>
        
        <View style={styles.taskContent}>
          <Text style={[styles.taskTitle, item.completed && styles.completedTitle]}>
            {item.title}
          </Text>
          {item.description && (
            <Text style={styles.taskDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          <View style={styles.taskMeta}>
            <Text style={styles.dueDate}>
              Due: {item.dueDate.toDate().toLocaleDateString()}
              {item.dueTime && ` at ${item.dueTime}`}
            </Text>
            <View style={styles.badges}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.badgeText}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.taskActions}>
          <TouchableOpacity
            style={[styles.priorityButton, { borderColor: getPriorityColor(item.priority) }]}
            onPress={() => handlePriorityChange(item.id, item.priority)}
          >
            <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
              {item.priority.charAt(0).toUpperCase()}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteTask(item.id, item.title)}
          >
            <Ionicons name="trash-outline" size={20} color="#FF5A77" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      
      <View style={styles.content}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search tasks..."
        />

        <CategoryFilters
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        <View style={styles.taskCountContainer}>
          <Text style={styles.taskCount}>
            {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
          </Text>
        </View>

        <FlatList
          data={filteredTasks}
          renderItem={renderTaskItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.taskList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="clipboard-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>
                {searchQuery || activeFilter !== 'all' 
                  ? 'No tasks found matching your criteria'
                  : 'No tasks yet. Create your first task!'
                }
              </Text>
            </View>
          )}
        />
      </View>

      <FAB onPress={() => setIsAddModalVisible(true)} />

      <AddTaskModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
      />
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
  taskCountContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  taskCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  taskList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  taskCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
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
    alignItems: 'flex-start',
  },
  completionButton: {
    marginRight: 12,
    paddingTop: 2,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueDate: {
    fontSize: 12,
    color: '#666',
  },
  badges: {
    flexDirection: 'row',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  taskActions: {
    marginLeft: 12,
    alignItems: 'center',
  },
  priorityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 40,
  },
});

export default HomeScreen;