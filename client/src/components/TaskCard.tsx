import React, { useState } from 'react';
import { Calendar, Clock, Star, Edit, Trash2, Check } from 'lucide-react';
import { format } from 'date-fns';

import { Timestamp } from 'firebase/firestore';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate: Timestamp;
  dueTime?: string;
  tags?: string[];
  createdAt: Timestamp;
  completedAt?: Timestamp;
  status: 'todo' | 'progress' | 'done';
}

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const priorityColors = {
  low: 'border-green-200 bg-green-50',
  medium: 'border-yellow-200 bg-yellow-50',
  high: 'border-red-200 bg-red-50'
};

const priorityTextColors = {
  low: 'text-green-800',
  medium: 'text-yellow-800',
  high: 'text-red-800'
};

export function TaskCard({ task, onToggle, onEdit, onDelete }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleToggle = () => {
    onToggle(task.id);
  };

  const isOverdue = task.dueDate && !task.completed && new Date() > task.dueDate.toDate();

  return (
    <div
      className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
        task.completed 
          ? 'border-gray-200 bg-gray-50' 
          : priorityColors[task.priority]
      } ${isOverdue ? 'border-red-300 bg-red-50' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`task-card-${task.id}`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={handleToggle}
          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            task.completed
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          data-testid={`toggle-task-${task.id}`}
        >
          {task.completed && <Check size={12} />}
        </button>

        <div className="flex-1 min-w-0">
          <h3 className={`font-medium text-gray-900 ${task.completed ? 'line-through text-gray-500' : ''}`}>
            {task.title}
          </h3>
          
          {task.description && (
            <p className={`text-sm mt-1 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs">
            {/* Priority indicator */}
            <span className={`flex items-center gap-1 ${priorityTextColors[task.priority]}`}>
              <Star size={12} fill={task.priority === 'high' ? 'currentColor' : 'none'} />
              {task.priority}
            </span>

            {/* Due date */}
            {task.dueDate && (
              <span className={`flex items-center gap-1 ${
                isOverdue ? 'text-red-600' : 'text-gray-500'
              }`}>
                <Calendar size={12} />
                {format(task.dueDate.toDate(), 'MMM d')}
              </span>
            )}

            {/* Due time */}
            {task.dueTime && (
              <span className="flex items-center gap-1 text-gray-500">
                <Clock size={12} />
                {task.dueTime}
              </span>
            )}

            {/* Tags */}
            {task.tags && task.tags.map(tag => (
              <span 
                key={tag}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        {isHovered && !task.completed && (
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(task)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              data-testid={`edit-task-${task.id}`}
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              data-testid={`delete-task-${task.id}`}
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {task.completed && task.completedAt && (
        <div className="mt-2 text-xs text-gray-500">
          Completed {task.completedAt ? format(task.completedAt.toDate(), 'MMM d, h:mm a') : ''}
        </div>
      )}
    </div>
  );
}