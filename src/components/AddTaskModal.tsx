import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Timestamp } from 'firebase/firestore';
import { useTask, TaskInput } from '../contexts/TaskContext';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ visible, onClose }) => {
  const { addTask } = useTask();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [status, setStatus] = useState<'todo' | 'progress' | 'done'>('todo');
  const [dueDate, setDueDate] = useState(new Date());
  const [dueTime, setDueTime] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setStatus('todo');
    setDueDate(new Date());
    setDueTime('');
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    setLoading(true);
    try {
      const taskInput: TaskInput = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        status,
        dueDate: Timestamp.fromDate(dueDate),
        dueTime: dueTime || undefined,
      };

      await addTask(taskInput);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error adding task:', error);
      Alert.alert('Error', 'Failed to add task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const timeString = selectedTime.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      setDueTime(timeString);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  const PriorityButton = ({ 
    level, 
    label, 
    color 
  }: { 
    level: 'low' | 'medium' | 'high'; 
    label: string; 
    color: string;
  }) => (
    <TouchableOpacity
      style={[
        styles.priorityButton,
        priority === level && { backgroundColor: color, borderColor: color }
      ]}
      onPress={() => setPriority(level)}
    >
      <Text style={[
        styles.priorityText,
        priority === level && styles.selectedPriorityText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const StatusButton = ({ 
    statusType, 
    label, 
    color 
  }: { 
    statusType: 'todo' | 'progress' | 'done'; 
    label: string; 
    color: string;
  }) => (
    <TouchableOpacity
      style={[
        styles.statusButton,
        status === statusType && { backgroundColor: color, borderColor: color }
      ]}
      onPress={() => setStatus(statusType)}
    >
      <Text style={[
        styles.statusText,
        status === statusType && styles.selectedStatusText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add New Task</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={loading}>
            <Text style={[styles.saveButton, loading && styles.disabledButton]}>
              {loading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter task title"
              maxLength={100}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter task description (optional)"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.buttonGroup}>
              <PriorityButton level="low" label="Low" color="#30D394" />
              <PriorityButton level="medium" label="Medium" color="#FFB833" />
              <PriorityButton level="high" label="High" color="#FF5A77" />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.buttonGroup}>
              <StatusButton statusType="todo" label="To-Do" color="#FF5A77" />
              <StatusButton statusType="progress" label="Progress" color="#FFB833" />
              <StatusButton statusType="done" label="Done" color="#30D394" />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Due Date *</Text>
            <TouchableOpacity 
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.dateTimeText}>{formatDate(dueDate)}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Due Time (Optional)</Text>
            <TouchableOpacity 
              style={styles.dateTimeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.dateTimeText}>
                {dueTime || 'Select time'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {showDatePicker && (
          <DateTimePicker
            value={dueDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={new Date()}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5B7FFF',
  },
  disabledButton: {
    color: '#ccc',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  textArea: {
    height: 100,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  selectedPriorityText: {
    color: '#ffffff',
  },
  statusButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  selectedStatusText: {
    color: '#ffffff',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
  },
  dateTimeText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
});

export default AddTaskModal;