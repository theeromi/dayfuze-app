import { useState } from 'react';
import { useTask } from '../contexts/TaskContext';
import { TaskCard, Task } from './TaskCard';
import { MotivationalQuote } from './MotivationalQuote';
import { AddTaskModal } from './AddTaskModal';

export function TaskList() {
  const { tasks, toggleTask, deleteTask } = useTask();
  const [showQuote, setShowQuote] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleTaskToggle = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && !task.completed) {
      // Task just completed, show motivational quote
      setShowQuote(true);
    }
    await toggleTask(taskId);
  };

  // Show recent tasks (limit to 5 for dashboard)
  const recentTasks = tasks.slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Recent Tasks</h2>
        <span className="text-sm text-gray-500">
          {tasks.filter(t => !t.completed).length} active
        </span>
      </div>
      
      <div className="space-y-3">
        {recentTasks.length > 0 ? (
          recentTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={handleTaskToggle}
              onEdit={setEditingTask}
              onDelete={deleteTask}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No tasks yet. Add one to get started!
          </div>
        )}
      </div>

      {tasks.length > 5 && (
        <div className="text-center pt-4">
          <a href="/tasks" className="text-blue-600 hover:text-blue-800 text-sm">
            View all tasks ({tasks.length})
          </a>
        </div>
      )}

      <MotivationalQuote 
        show={showQuote} 
        onHide={() => setShowQuote(false)} 
      />

      <AddTaskModal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        editingTask={editingTask}
      />
    </div>
  );
}