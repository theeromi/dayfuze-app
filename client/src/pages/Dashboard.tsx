import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTask } from '../contexts/TaskContext';
import { Header } from '../components/Header';
import { TaskList } from '../components/TaskList';
import { FAB } from '../components/FAB';
import { AddTaskModal } from '../components/AddTaskModal';
import { VoiceInput } from '../components/VoiceInput';
import { Link } from 'wouter';
import { CheckCircle, Clock, Calendar, Star } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();
  const { tasks } = useTask();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);

  if (!user) {
    return <div>Please login to continue</div>;
  }

  const handleVoiceResult = (text: string) => {
    setShowVoiceInput(false);
    // Create a quick task from voice input
    setShowAddModal(true);
  };

  const activeTasks = tasks.filter(task => !task.completed);
  const completedToday = tasks.filter(task => 
    task.completed && 
    task.completedAt && 
    format(task.completedAt, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  );
  
  const highPriorityTasks = activeTasks.filter(task => task.priority === 'high');
  const dueSoon = activeTasks.filter(task => 
    task.dueDate && 
    task.dueDate <= new Date(Date.now() + 24 * 60 * 60 * 1000) // Due within 24 hours
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-gray-600 mt-2">Let's make today productive</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <Clock className="text-blue-600" size={20} />
              <span className="text-sm text-gray-600">Active</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{activeTasks.length}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-green-600" size={20} />
              <span className="text-sm text-gray-600">Today</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{completedToday.length}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <Star className="text-red-600" size={20} />
              <span className="text-sm text-gray-600">High Priority</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{highPriorityTasks.length}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <Calendar className="text-orange-600" size={20} />
              <span className="text-sm text-gray-600">Due Soon</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{dueSoon.length}</p>
          </div>
        </div>
        
        <TaskList />

        <div className="mt-6 text-center">
          <Link href="/tasks">
            <span className="text-blue-600 hover:text-blue-800 cursor-pointer">View all tasks →</span>
          </Link>
        </div>
        
        <FAB
          onQuickAdd={() => setShowAddModal(true)}
          onVoiceAdd={() => setShowVoiceInput(true)}
          onFullAdd={() => setShowAddModal(true)}
        />
        
        <AddTaskModal 
          isOpen={showAddModal} 
          onClose={() => setShowAddModal(false)} 
        />

        {showVoiceInput && (
          <VoiceInput
            onResult={handleVoiceResult}
            onClose={() => setShowVoiceInput(false)}
          />
        )}
      </main>
    </div>
  );
}