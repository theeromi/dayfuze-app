import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTask, Task } from '@/contexts/TaskContext';
import { useLocation } from 'wouter';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { format, addDays, subDays, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { formatTime12Hour } from '@/lib/timeUtils';

export default function Timeline() {
  const { currentUser, loading: authLoading } = useAuth();
  const { tasks, loading: tasksLoading } = useTask();
  const [, navigate] = useLocation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');

  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/login');
    }
  }, [currentUser, authLoading, navigate]);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  const filteredTasks = useMemo(() => {
    if (viewMode === 'day') {
      return tasks.filter(task => isSameDay(task.dueDate.toDate(), currentDate));
    } else {
      // Week view
      return tasks.filter(task => {
        const taskDate = task.dueDate.toDate();
        return taskDate >= weekStart && taskDate <= weekEnd;
      });
    }
  }, [tasks, currentDate, viewMode, weekStart, weekEnd]);

  const tasksByDate = useMemo(() => {
    const grouped: { [key: string]: Task[] } = {};
    
    if (viewMode === 'day') {
      const dateKey = format(currentDate, 'yyyy-MM-dd');
      grouped[dateKey] = filteredTasks;
    } else {
      // Group by each day of the week
      for (let i = 0; i < 7; i++) {
        const date = addDays(weekStart, i);
        const dateKey = format(date, 'yyyy-MM-dd');
        grouped[dateKey] = tasks.filter(task => 
          isSameDay(task.dueDate.toDate(), date)
        );
      }
    }
    
    return grouped;
  }, [filteredTasks, tasks, currentDate, viewMode, weekStart]);

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

  const navigateDate = (direction: 'prev' | 'next') => {
    if (viewMode === 'day') {
      setCurrentDate(direction === 'next' ? addDays(currentDate, 1) : subDays(currentDate, 1));
    } else {
      setCurrentDate(direction === 'next' ? addDays(currentDate, 7) : subDays(currentDate, 7));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  if (authLoading || tasksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-day-blue mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your timeline...</p>
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
        {/* Header Controls */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Timeline</h1>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('day')}
              data-testid="button-day-view"
            >
              Day
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('week')}
              data-testid="button-week-view"
            >
              Week
            </Button>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('prev')}
              data-testid="button-prev"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('next')}
              data-testid="button-next"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              data-testid="button-today"
            >
              Today
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
            <span className="text-lg font-semibold" data-testid="text-current-period">
              {viewMode === 'day' 
                ? format(currentDate, 'EEEE, MMMM dd, yyyy')
                : `${format(weekStart, 'MMM dd')} - ${format(weekEnd, 'MMM dd, yyyy')}`
              }
            </span>
          </div>
        </div>

        {/* Task Count Summary */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-day-blue">
                  {filteredTasks.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total {viewMode === 'day' ? 'Today' : 'This Week'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-green">
                  {filteredTasks.filter(task => task.completed).length}
                </div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-red">
                  {filteredTasks.filter(task => !task.completed).length}
                </div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline Content */}
        <div className="space-y-4">
          {viewMode === 'day' ? (
            // Day View
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  {format(currentDate, 'EEEE, MMMM dd, yyyy')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tasksByDate[format(currentDate, 'yyyy-MM-dd')]?.length > 0 ? (
                  <div className="space-y-3">
                    {tasksByDate[format(currentDate, 'yyyy-MM-dd')]
                      .sort((a, b) => {
                        if (a.dueTime && b.dueTime) {
                          return a.dueTime.localeCompare(b.dueTime);
                        }
                        if (a.dueTime && !b.dueTime) return -1;
                        if (!a.dueTime && b.dueTime) return 1;
                        return 0;
                      })
                      .map((task) => (
                        <div
                          key={task.id}
                          className={`p-3 rounded-lg border-l-4 ${
                            task.status === 'todo' ? 'border-l-accent-red bg-accent-red/5' :
                            task.status === 'progress' ? 'border-l-accent-yellow bg-accent-yellow/5' :
                            'border-l-accent-green bg-accent-green/5'
                          } ${task.completed ? 'opacity-75' : ''}`}
                          data-testid={`timeline-task-${task.id}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {task.dueTime && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {formatTime12Hour(task.dueTime)}
                                </div>
                              )}
                              <Badge className={getStatusColor(task.status)}>
                                {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                              </Badge>
                            </div>
                          </div>
                          <h4 className={`font-semibold ${task.completed ? 'line-through' : ''}`}>
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {task.description}
                            </p>
                          )}
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No tasks scheduled for this day</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            // Week View
            <div className="grid gap-4">
              {Array.from({ length: 7 }, (_, i) => {
                const date = addDays(weekStart, i);
                const dateKey = format(date, 'yyyy-MM-dd');
                const dayTasks = tasksByDate[dateKey] || [];
                const isToday = isSameDay(date, new Date());

                return (
                  <Card key={dateKey} className={isToday ? 'ring-2 ring-day-blue' : ''}>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={isToday ? 'text-day-blue font-bold' : ''}>
                            {format(date, 'EEEE, MMM dd')}
                          </span>
                          {isToday && (
                            <Badge className="bg-day-blue text-white text-xs">Today</Badge>
                          )}
                        </div>
                        <Badge variant="outline">
                          {dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {dayTasks.length > 0 ? (
                        <div className="space-y-2">
                          {dayTasks.slice(0, 3).map((task) => (
                            <div
                              key={task.id}
                              className={`p-2 rounded border-l-2 text-sm ${
                                task.status === 'todo' ? 'border-l-accent-red bg-accent-red/5' :
                                task.status === 'progress' ? 'border-l-accent-yellow bg-accent-yellow/5' :
                                'border-l-accent-green bg-accent-green/5'
                              } ${task.completed ? 'opacity-75' : ''}`}
                            >
                              <div className="flex items-center justify-between">
                                <span className={`font-medium ${task.completed ? 'line-through' : ''}`}>
                                  {task.title}
                                </span>
                                {task.dueTime && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {task.dueTime}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                          {dayTasks.length > 3 && (
                            <div className="text-xs text-muted-foreground text-center pt-1">
                              +{dayTasks.length - 3} more task{dayTasks.length - 3 !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground text-sm">
                          No tasks scheduled
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={() => navigate('/tasks')}
            className="bg-day-blue hover:bg-day-blue/90"
            data-testid="button-manage-tasks"
          >
            Manage Tasks
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}