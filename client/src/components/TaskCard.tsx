import { Clock, Flag, Users, CheckCircle, Circle, Edit2, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Task } from "@/contexts/TaskContext";
import { format } from "date-fns";
import { useState } from "react";
import { TaskCompletionCelebration } from "./TaskCompletionCelebration";

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export function TaskCard({ task, onToggleComplete, onEdit, onDelete, showActions = false }: TaskCardProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  
  const priorityColors = {
    high: "border-accent-red bg-red-100 text-accent-red",
    medium: "border-accent-yellow bg-yellow-100 text-accent-yellow",
    low: "border-accent-green bg-green-100 text-accent-green",
  };

  const priorityBorderColors = {
    high: "border-accent-red",
    medium: "border-accent-yellow",
    low: "border-accent-green",
  };

  const statusColors = {
    todo: "bg-gray-100 text-gray-600",
    progress: "bg-blue-100 text-primary",
    done: "bg-green-100 text-accent-green",
  };

  return (
    <Card className={`bg-white rounded-xl shadow-card border-l-4 ${priorityBorderColors[task.priority]} min-w-[280px]`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColors[task.priority]}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
            <span className={`px-2 py-1 text-xs rounded-full ${statusColors[task.status]}`}>
              {task.status === "progress" ? "In Progress" : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // Show celebration if task is being completed (not uncompleted)
              if (!task.completed) {
                setShowCelebration(true);
              }
              onToggleComplete(task.id);
            }}
            className={`p-1 ${task.completed ? "text-accent-green" : "text-gray-400 hover:text-gray-600"}`}
            data-testid={`button-toggle-${task.id}`}
          >
            {task.completed ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
          </Button>
        </div>
        
        <h3 className={`font-semibold text-gray-800 mb-2 ${task.completed ? "line-through text-gray-500" : ""}`}>
          {task.title}
        </h3>
        
        {task.description && (
          <p className={`text-sm mb-3 ${task.completed ? "text-gray-500" : "text-gray-600"}`}>
            {task.description}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{task.dueTime || (task.dueDate ? format(task.dueDate.toDate(), "MMM dd") : "No date")}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Flag className={`w-3 h-3 ${task.priority === "high" ? "text-accent-red" : task.priority === "medium" ? "text-accent-yellow" : "text-accent-green"}`} />
              <span className="capitalize">{task.priority}</span>
            </div>
          </div>
          
          {showActions && (
            <div className="flex items-center space-x-1">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(task)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  data-testid={`button-edit-${task.id}`}
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(task.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                  data-testid={`button-delete-${task.id}`}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
      
      {/* Task Completion Celebration */}
      <TaskCompletionCelebration
        show={showCelebration}
        taskTitle={task.title}
        onComplete={() => setShowCelebration(false)}
      />
    </Card>
  );
}
