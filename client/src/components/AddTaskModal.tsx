import React, { useState } from 'react';
import { useTask, TaskInput, RecurringTaskInput } from '@/contexts/TaskContext';
import { useNotification } from '@/contexts/NotificationContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, Plus, Bell, Send, Repeat, Calendar as CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { formatTime12Hour } from '@/lib/timeUtils';
import { Timestamp } from 'firebase/firestore';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AddTaskModalProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export default function AddTaskModal({ trigger, onSuccess }: AddTaskModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addTask } = useTask();
  const { notificationsEnabled, requestPermission } = useNotification();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    status: 'todo' as 'todo' | 'progress' | 'done',
    dueDate: new Date(),
    dueTime: '',
    recurring: false,
    recurringPattern: 'daily' as 'daily' | 'weekly' | 'monthly',
    recurringDays: [] as string[], // For weekly: ['monday', 'tuesday', etc.]
    recurringEndDate: undefined as Date | undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setLoading(true);
    try {
      const taskInput: TaskInput | RecurringTaskInput = formData.recurring ? {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        priority: formData.priority,
        status: formData.status,
        dueDate: Timestamp.fromDate(formData.dueDate),
        dueTime: formData.dueTime || undefined,
        recurring: formData.recurring,
        recurringPattern: formData.recurringPattern,
        recurringDays: formData.recurringDays,
        recurringEndDate: formData.recurringEndDate,
      } : {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        priority: formData.priority,
        status: formData.status,
        dueDate: Timestamp.fromDate(formData.dueDate),
        dueTime: formData.dueTime || undefined,
      };

      // Request notification permission if time is set and notifications aren't enabled
      if (formData.dueTime && !notificationsEnabled) {
        const granted = await requestPermission();
        if (!granted) {
          alert('Please enable notifications to get task reminders');
        }
      }

      await addTask(taskInput);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        dueDate: new Date(),
        dueTime: '',
        recurring: false,
        recurringPattern: 'daily',
        recurringDays: [],
        recurringEndDate: undefined,
      });
      
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to add task:', error);
      alert('Failed to add task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button 
            className="bg-day-blue hover:bg-day-blue/90"
            data-testid="button-add-task"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[95vh] p-0 flex flex-col">
        <div className="p-4 sm:p-6 pb-0 flex-shrink-0">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
        </div>
        
        <ScrollArea className="flex-1 p-4 sm:p-6 pt-4">
          <form onSubmit={handleSubmit} className="space-y-4" id="task-form">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="What needs to be done?"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              data-testid="input-task-title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add details about your task..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              data-testid="input-task-description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: 'low' | 'medium' | 'high') =>
                  setFormData(prev => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger data-testid="select-priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'todo' | 'progress' | 'done') =>
                  setFormData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger data-testid="select-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To-Do</SelectItem>
                  <SelectItem value="progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.dueDate && "text-muted-foreground"
                  )}
                  data-testid="button-select-date"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dueDate ? format(formData.dueDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.dueDate}
                  onSelect={(date) => date && setFormData(prev => ({ ...prev, dueDate: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueTime" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Due Time (Optional)
              {formData.dueTime && !notificationsEnabled && (
                <Bell className="h-4 w-4 text-yellow-500" />
              )}
            </Label>
            <Input
              id="dueTime"
              type="time"
              value={formData.dueTime}
              onChange={(e) => setFormData(prev => ({ ...prev, dueTime: e.target.value }))}
              data-testid="input-task-time"
            />
            {formData.dueTime && (
              <p className="text-sm text-muted-foreground">
                ⏰ You'll get notified at {formatTime12Hour(formData.dueTime)} and 1 minute after
              </p>
            )}
          </div>

          {/* Recurring Task Section */}
          <div className="space-y-4 p-4 bg-muted/20 rounded-lg border border-muted">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="recurring"
                checked={formData.recurring}
                onChange={(e) => setFormData(prev => ({ ...prev, recurring: e.target.checked }))}
                className="w-4 h-4 text-day-blue border-gray-300 rounded focus:ring-day-blue"
                data-testid="checkbox-recurring"
              />
              <Label htmlFor="recurring" className="flex items-center gap-2 cursor-pointer">
                <Repeat className="h-4 w-4 text-day-blue" />
                Make this a recurring task
              </Label>
            </div>

            {formData.recurring && (
              <div className="space-y-4 pl-7">
                <div className="space-y-2">
                  <Label>Repeat Pattern</Label>
                  <Select
                    value={formData.recurringPattern}
                    onValueChange={(value: 'daily' | 'weekly' | 'monthly') =>
                      setFormData(prev => ({ ...prev, recurringPattern: value }))
                    }
                  >
                    <SelectTrigger data-testid="select-recurring-pattern">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.recurringPattern === 'weekly' && (
                  <div className="space-y-2">
                    <Label>Select Days</Label>
                    <div className="grid grid-cols-7 gap-1">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                        const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                        const isSelected = formData.recurringDays.includes(dayNames[index]);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              const dayName = dayNames[index];
                              setFormData(prev => ({
                                ...prev,
                                recurringDays: isSelected
                                  ? prev.recurringDays.filter(d => d !== dayName)
                                  : [...prev.recurringDays, dayName]
                              }));
                            }}
                            className={cn(
                              "p-2 text-xs rounded-md border transition-colors",
                              isSelected
                                ? "bg-day-blue text-white border-day-blue"
                                : "bg-background border-border hover:bg-muted"
                            )}
                            data-testid={`button-day-${day.toLowerCase()}`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>End Date (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.recurringEndDate && "text-muted-foreground"
                        )}
                        data-testid="button-select-end-date"
                      >
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {formData.recurringEndDate ? format(formData.recurringEndDate, "PPP") : "No end date (3 months)"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.recurringEndDate}
                        onSelect={(date) => setFormData(prev => ({ ...prev, recurringEndDate: date }))}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {formData.dueTime && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      <strong>Enhanced Mobile Notifications:</strong>
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                      • Push notifications at {formatTime12Hour(formData.dueTime)} + 1 min after
                      <br />
                      • Automatic calendar integration for mobile devices
                      <br />
                      • iOS/Android compatible notification fallbacks
                      <br />
                      • {formData.recurringPattern === 'daily' ? 'Every day' : 
                          formData.recurringPattern === 'weekly' ? 
                            (formData.recurringDays.length > 0 ? `${formData.recurringDays.join(', ')}` : 'Same day every week') :
                            'Same date every month'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          </form>
        </ScrollArea>
        
        <div className="p-4 sm:p-6 pt-0 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="px-6 py-3 text-base font-medium border-2 hover:bg-muted/50 w-full sm:w-auto"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="task-form"
              disabled={loading || !formData.title.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-base font-semibold shadow-lg hover:shadow-xl w-full sm:w-auto"
              data-testid="button-save-task"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Add Task
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}