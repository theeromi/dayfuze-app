import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTask, Task } from '../contexts/TaskContext';
import Header from '../components/Header';
import TaskSummary from '../components/TaskSummary';
import SearchBar from '../components/SearchBar';
import CategoryFilters, { FilterType } from '../components/CategoryFilters';
import TodaysTasksHorizontal from '../components/TodaysTasksHorizontal';
import FAB from '../components/FAB';
import AddTaskModal from '../components/AddTaskModal';

const DashboardScreen: React.FC = () => {
  const { currentUser } = useAuth();
  const { tasks, loading } = useTask();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    
    const matchesFilter = activeFilter === 'all' || task.status === activeFilter;
    
    return matchesSearch && matchesFilter;
  });

  const handleTaskPress = (task: Task) => {
    // Handle task press - you can navigate to task details or open edit modal
    console.log('Task pressed:', task);
  };

  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>Good day,</Text>
          <Text style={styles.nameText}>{displayName}!</Text>
        </View>

        <TaskSummary />

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search your tasks..."
        />

        <CategoryFilters
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        <TodaysTasksHorizontal
          tasks={filteredTasks}
          onTaskPress={handleTaskPress}
        />

        <View style={styles.bottomSpacing} />
      </ScrollView>

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
  greetingContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  greetingText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
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
  bottomSpacing: {
    height: 100,
  },
});

export default DashboardScreen;