import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTask } from '../contexts/TaskContext';
import { Header } from '../components/Header';
import { TaskCard, Task } from '../components/TaskCard';
import { AddTaskModal } from '../components/AddTaskModal';
import { FAB } from '../components/FAB';
import { VoiceInput } from '../components/VoiceInput';
import { SearchBar } from '../components/SearchBar';
import { MotivationalQuote } from '../components/MotivationalQuote';
import { Search, Filter } from 'lucide-react';

type FilterType = 'all' | 'active' | 'completed';
type SortType = 'newest' | 'oldest' | 'priority' | 'dueDate';

export default function Tasks() {
  const { user } = useAuth();
  const { tasks, toggleTask, deleteTask } = useTask();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('newest');
  const [showQuote, setShowQuote] = useState(false);

  if (!user) {
    return <div>Please login to continue</div>;
  }

  // Filter and sort tasks
  const filteredTasks = tasks
    .filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filter === 'all' || 
                           (filter === 'active' && !task.completed) ||
                           (filter === 'completed' && task.completed);
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        default:
          return 0;
      }
    });

  const handleTaskToggle = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && !task.completed) {
      setShowQuote(true);
    }
    await toggleTask(taskId);
  };

  const handleVoiceResult = (text: string) => {
    setShowVoiceInput(false);
    // Create a quick task from voice input
    setEditingTask({
      id: '',
      title: text,
      completed: false,
      priority: 'medium',
      createdAt: new Date()
    } as Task);
    setShowAddModal(true);
  };

  const activeTasks = tasks.filter(task => !task.completed).length;
  const completedTasks = tasks.filter(task => task.completed).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">
            {activeTasks} active, {completedTasks} completed
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <SearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search tasks..."
          />
          
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-full text-sm ${
                  filter === 'all' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All ({tasks.length})
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-3 py-1 rounded-full text-sm ${
                  filter === 'active' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Active ({activeTasks})
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-3 py-1 rounded-full text-sm ${
                  filter === 'completed' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Completed ({completedTasks})
              </button>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortType)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="priority">Priority</option>
              <option value="dueDate">Due date</option>
            </select>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {filteredTasks.length > 0 ? (
            filteredTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={handleTaskToggle}
                onEdit={setEditingTask}
                onDelete={deleteTask}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchQuery || filter !== 'all' 
                  ? 'No tasks match your current filters' 
                  : 'No tasks yet. Add one to get started!'
                }
              </p>
            </div>
          )}
        </div>

        {/* FAB */}
        <FAB
          onQuickAdd={() => setShowAddModal(true)}
          onVoiceAdd={() => setShowVoiceInput(true)}
          onFullAdd={() => setShowAddModal(true)}
        />

        {/* Modals */}
        <AddTaskModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setEditingTask(null);
          }}
          editingTask={editingTask}
        />

        {showVoiceInput && (
          <VoiceInput
            onResult={handleVoiceResult}
            onClose={() => setShowVoiceInput(false)}
          />
        )}

        <MotivationalQuote
          show={showQuote}
          onHide={() => setShowQuote(false)}
        />
      </main>
    </div>
  );
}