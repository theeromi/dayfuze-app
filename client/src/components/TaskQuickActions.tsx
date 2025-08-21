import React from 'react';
import { Task } from '@/contexts/TaskContext';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Clock, Flag, Calendar, Trash2, CheckCircle2, CirclePlay } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatTime12Hour } from '@/lib/timeUtils';
import { format } from 'date-fns';

interface TaskQuickActionsProps {
  task: Task;
  onStatusChange: (status: 'todo' | 'progress' | 'done') => void;
  onPriorityChange: (priority: 'low' | 'medium' | 'high') => void;
  onSnooze: (minutes: number) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function TaskQuickActions({
  task,
  onStatusChange,
  onPriorityChange,
  onSnooze,
  onEdit,
  onDelete,
}: TaskQuickActionsProps) {
  const priorityColors = {
    low: 'text-green-600 dark:text-green-400',
    medium: 'text-yellow-600 dark:text-yellow-400',
    high: 'text-red-600 dark:text-red-400',
  };

  const statusIcons = {
    todo: CirclePlay,
    progress: Clock,
    done: CheckCircle2,
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-muted"
          data-testid="button-task-actions"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 sm:w-56">
        {/* Quick Status Changes */}
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
          Status
        </div>
        {(['todo', 'progress', 'done'] as const).map((status) => {
          const Icon = statusIcons[status];
          return (
            <DropdownMenuItem
              key={status}
              onClick={() => onStatusChange(status)}
              className={task.status === status ? 'bg-muted' : ''}
              data-testid={`button-status-${status}`}
            >
              <Icon className="mr-2 h-4 w-4" />
              {status === 'todo' ? 'To-Do' : status === 'progress' ? 'In Progress' : 'Done'}
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />

        {/* Quick Priority Changes */}
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
          Priority
        </div>
        {(['low', 'medium', 'high'] as const).map((priority) => (
          <DropdownMenuItem
            key={priority}
            onClick={() => onPriorityChange(priority)}
            className={task.priority === priority ? 'bg-muted' : ''}
            data-testid={`button-priority-${priority}`}
          >
            <Flag className={`mr-2 h-4 w-4 ${priorityColors[priority]}`} />
            {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        {/* Snooze Options (only if task has time) */}
        {task.dueTime && (
          <>
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              Snooze
            </div>
            <DropdownMenuItem
              onClick={() => onSnooze(10)}
              data-testid="button-snooze-10"
            >
              <Clock className="mr-2 h-4 w-4" />
              10 minutes
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSnooze(30)}
              data-testid="button-snooze-30"
            >
              <Clock className="mr-2 h-4 w-4" />
              30 minutes
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSnooze(60)}
              data-testid="button-snooze-60"
            >
              <Clock className="mr-2 h-4 w-4" />
              1 hour
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Task Info */}
        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1 mb-1">
            <Calendar className="h-3 w-3" />
            {format(task.dueDate.toDate(), 'MMM dd, yyyy')}
          </div>
          {task.dueTime && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime12Hour(task.dueTime)}
            </div>
          )}
        </div>

        <DropdownMenuSeparator />

        {/* Edit & Delete */}
        <DropdownMenuItem
          onClick={onEdit}
          data-testid="button-edit-task"
        >
          Edit Task
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onDelete}
          className="text-destructive focus:text-destructive"
          data-testid="button-delete-task"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Task
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}