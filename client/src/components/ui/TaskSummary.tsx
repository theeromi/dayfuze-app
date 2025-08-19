import { useTask } from '@/contexts/TaskContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TaskSummary() {
  const { tasks } = useTask();

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const currentMonthTasks = tasks.filter(task => {
    const taskDate = task.dueDate.toDate();
    return taskDate.getMonth() === currentMonth && taskDate.getFullYear() === currentYear;
  });

  const completedCount = currentMonthTasks.filter(task => task.completed).length;
  const totalCount = currentMonthTasks.length;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">This Month</CardTitle>
        <div className="text-2xl font-bold text-primary">
          {monthNames[currentMonth]} {currentYear}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-accent-green">{completedCount}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-accent-yellow">{totalCount - completedCount}</div>
            <div className="text-sm text-muted-foreground">Remaining</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-day-blue">{totalCount}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}