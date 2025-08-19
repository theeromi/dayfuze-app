import { useState, useEffect } from 'react';
import { MotivationalQuote } from './MotivationalQuote';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Review daily goals', completed: false, createdAt: new Date() },
    { id: '2', title: 'Complete project proposal', completed: false, createdAt: new Date() },
    { id: '3', title: 'Exercise for 30 minutes', completed: true, createdAt: new Date() },
  ]);
  const [showQuote, setShowQuote] = useState(false);

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        const updatedTask = { ...task, completed: !task.completed };
        if (!task.completed && updatedTask.completed) {
          // Task just completed, show motivational quote
          setShowQuote(true);
        }
        return updatedTask;
      }
      return task;
    }));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Your Tasks</h2>
      
      <div className="space-y-2">
        {tasks.map(task => (
          <div
            key={task.id}
            className={`flex items-center p-4 bg-white rounded-lg shadow-sm border ${
              task.completed ? 'bg-green-50' : ''
            }`}
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task.id)}
              className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {task.title}
            </span>
            {task.completed && (
              <span className="text-green-600 font-medium">✓ Complete</span>
            )}
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No tasks yet. Add one to get started!
        </div>
      )}

      <MotivationalQuote 
        show={showQuote} 
        onHide={() => setShowQuote(false)} 
      />
    </div>
  );
}