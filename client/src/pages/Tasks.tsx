import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTask, Task } from '@/contexts/TaskContext';
import { useLocation } from 'wouter';
import Header from '@/components/ui/Header';
import SearchBar from '@/components/ui/SearchBar';
import CategoryFilters, { FilterType } from '@/components/ui/CategoryFilters';
import AddTaskModal from '@/components/AddTaskModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MoreHorizontal, 
  Calendar, 
  Clock, 
  Flag, 
  Edit, 
  Trash2, 
  CheckSquare 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

export default function Tasks() {
  const { currentUser, loading: authLoading } = useAuth();
  const { tasks, loading: tasksLoading, deleteTask, toggleTaskCompletion, setTaskPriority } = useTask();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/login');
    }
  }, [currentUser, authLoading, navigate]);

  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(task => task.status === activeFilter);
    }

    return filtered;
  }, [tasks, searchQuery, activeFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'bg-accent-red text-white';
      case 'progress':
        return 'bg-accent-yellow text-white';
      case 'done':
        return 'bg-accent-green text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getPriorityIcon = (priority: string) => {
    const color = priority === 'high' ? 'text-accent-red' : 
                  priority === 'medium' ? 'text-accent-yellow' : 'text-muted-foreground';
    return <Flag className={`h-4 w-4 ${color}`} />;
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
      } catch (error) {
        console.error('Failed to delete task:', error);
        alert('Failed to delete task. Please try again.');
      }
    }
  };

  const handleToggleCompletion = async (taskId: string) => {
    try {
      await toggleTaskCompletion(taskId);
    } catch (error) {
      console.error('Failed to toggle task completion:', error);
      alert('Failed to update task. Please try again.');
    }
  };

  const handlePriorityChange = async (taskId: string, priority: 'low' | 'medium' | 'high') => {
    try {
      await setTaskPriority(taskId, priority);
    } catch (error) {
      console.error('Failed to update task priority:', error);
      alert('Failed to update priority. Please try again.');
    }
  };

  if (authLoading || tasksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-day-blue mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Tasks</h1>
          <AddTaskModal />
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search tasks..."
            />
          </div>
          <CategoryFilters
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        </div>

        {/* Tasks Count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredTasks.length} of {tasks.length} tasks
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="space-y-4">
                <CheckSquare className="h-16 w-16 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">
                    {tasks.length === 0 ? 'No tasks yet' : 'No tasks match your filters'}
                  </h3>
                  <p className="text-muted-foreground">
                    {tasks.length === 0 
                      ? 'Create your first task to get started!'
                      : 'Try adjusting your search or filters.'
                    }
                  </p>
                </div>
                {tasks.length === 0 && (
                  <AddTaskModal trigger={
                    <Button className="bg-day-blue hover:bg-day-blue/90">
                      Create Your First Task
                    </Button>
                  } />
                )}
              </div>
            </Card>
          ) : (
            filteredTasks.map((task: Task) => (
              <Card 
                key={task.id} 
                className={`transition-all hover:shadow-md border-l-4 ${
                  task.status === 'todo' 
                    ? 'border-l-accent-red' 
                    : task.status === 'progress'
                    ? 'border-l-accent-yellow'
                    : 'border-l-accent-green'
                } ${task.completed ? 'opacity-75' : ''}`}
                data-testid={`card-task-${task.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getPriorityIcon(task.priority)}
                      <span className="text-sm text-muted-foreground capitalize">
                        {task.priority} Priority
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" data-testid={`button-task-menu-${task.id}`}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleToggleCompletion(task.id)}
                            data-testid={`button-toggle-complete-${task.id}`}
                          >
                            <CheckSquare className="mr-2 h-4 w-4" />
                            {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePriorityChange(task.id, 'high')}>
                            <Flag className="mr-2 h-4 w-4 text-accent-red" />
                            High Priority
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePriorityChange(task.id, 'medium')}>
                            <Flag className="mr-2 h-4 w-4 text-accent-yellow" />
                            Medium Priority
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePriorityChange(task.id, 'low')}>
                            <Flag className="mr-2 h-4 w-4 text-muted-foreground" />
                            Low Priority
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-red-600"
                            data-testid={`button-delete-${task.id}`}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <h3 className={`font-semibold mb-2 ${task.completed ? 'line-through' : ''}`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(task.dueDate.toDate(), 'MMM dd, yyyy')}
                    </div>
                    {task.dueTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {task.dueTime}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}