import { Flag, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/contexts/TaskContext';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TodaysTasksHorizontalProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export default function TodaysTasksHorizontal({ tasks, onTaskClick }: TodaysTasksHorizontalProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysTasks = tasks.filter(task => {
    const taskDate = task.dueDate.toDate();
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() === today.getTime();
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'bg-accent-red';
      case 'progress':
        return 'bg-accent-yellow';
      case 'done':
        return 'bg-accent-green';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityIcon = (priority: string) => {
    return <Flag className={`h-4 w-4 ${priority === 'high' ? 'text-accent-red' : 'text-muted-foreground'}`} />;
  };

  if (todaysTasks.length === 0) {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-4">Today's Tasks</h3>
        <Card className="p-8 text-center text-muted-foreground">
          <p>No tasks for today. Enjoy your day!</p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Today's Tasks</h3>
      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-4">
          {todaysTasks.map((task) => (
            <Card
              key={task.id}
              className={`min-w-[280px] cursor-pointer transition-all hover:shadow-md border-l-4 ${
                task.status === 'todo'
                  ? 'border-l-accent-red'
                  : task.status === 'progress'
                  ? 'border-l-accent-yellow'
                  : 'border-l-accent-green'
              }`}
              onClick={() => onTaskClick?.(task)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  {getPriorityIcon(task.priority)}
                  {task.dueTime && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {task.dueTime}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <h4 className="font-semibold line-clamp-2 mb-2">{task.title}</h4>
                {task.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {task.description}
                  </p>
                )}
                <div className="flex justify-between items-center">
                  <Badge className={`${getStatusColor(task.status)} text-white`}>
                    {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}