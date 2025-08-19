import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useTask, Task } from '../contexts/TaskContext';
import Header from '../components/Header';
import VerticalTimeline from '../components/VerticalTimeline';
import FAB from '../components/FAB';
import AddTaskModal from '../components/AddTaskModal';

const TimelineScreen: React.FC = () => {
  const { tasks, loading } = useTask();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  const getWeekDates = (date: Date) => {
    const week = [];
    const startDate = new Date(date);
    const day = startDate.getDay();
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    startDate.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(startDate);
      weekDate.setDate(startDate.getDate() + i);
      week.push(weekDate);
    }
    return week;
  };

  const weekDates = getWeekDates(selectedDate);
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameDate = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  };

  const getTaskCountForDate = (date: Date) => {
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);

    return tasks.filter(task => {
      const taskDate = task.dueDate.toDate();
      return taskDate >= dateStart && taskDate <= dateEnd;
    }).length;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedDate(newDate);
  };

  const handleTaskPress = (task: Task) => {
    // Handle task press - you can navigate to task details or open edit modal
    console.log('Task pressed:', task);
  };

  const getMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading timeline...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      
      <View style={styles.content}>
        {/* Week Navigation */}
        <View style={styles.weekNavigation}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigateWeek('prev')}
          >
            <Text style={styles.navButtonText}>←</Text>
          </TouchableOpacity>
          
          <Text style={styles.monthYear}>
            {getMonthYear(selectedDate)}
          </Text>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigateWeek('next')}
          >
            <Text style={styles.navButtonText}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Week Header */}
        <View style={styles.weekHeader}>
          {weekDates.map((date, index) => (
            <TouchableOpacity
              key={date.toISOString()}
              style={[
                styles.dayButton,
                isSameDate(date, selectedDate) && styles.selectedDayButton,
                isToday(date) && styles.todayButton,
              ]}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={[
                styles.dayLabel,
                isSameDate(date, selectedDate) && styles.selectedDayLabel,
                isToday(date) && styles.todayLabel,
              ]}>
                {weekDays[index]}
              </Text>
              <Text style={[
                styles.dayNumber,
                isSameDate(date, selectedDate) && styles.selectedDayNumber,
                isToday(date) && styles.todayNumber,
              ]}>
                {date.getDate()}
              </Text>
              {getTaskCountForDate(date) > 0 && (
                <View style={[
                  styles.taskIndicator,
                  isSameDate(date, selectedDate) && styles.selectedTaskIndicator,
                ]}>
                  <Text style={[
                    styles.taskIndicatorText,
                    isSameDate(date, selectedDate) && styles.selectedTaskIndicatorText,
                  ]}>
                    {getTaskCountForDate(date)}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Timeline */}
        <VerticalTimeline
          selectedDate={selectedDate}
          tasks={tasks}
          onTaskPress={handleTaskPress}
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
  weekNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  navButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5B7FFF',
  },
  monthYear: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  weekHeader: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dayButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  selectedDayButton: {
    backgroundColor: '#5B7FFF',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  todayButton: {
    backgroundColor: '#FFB833',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  selectedDayLabel: {
    color: '#ffffff',
  },
  todayLabel: {
    color: '#ffffff',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedDayNumber: {
    color: '#ffffff',
  },
  todayNumber: {
    color: '#ffffff',
  },
  taskIndicator: {
    position: 'absolute',
    top: 4,
    right: 8,
    backgroundColor: '#FF5A77',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  selectedTaskIndicator: {
    backgroundColor: '#ffffff',
  },
  taskIndicatorText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  selectedTaskIndicatorText: {
    color: '#5B7FFF',
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
});

export default TimelineScreen;