import { useTask } from "@/contexts/TaskContext";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

export function TaskSummary() {
  const { tasks } = useTask();
  
  const currentMonth = format(new Date(), "yyyy-MM");
  const thisMonthTasks = tasks.filter(task => {
    if (!task.createdAt) return false;
    try {
      const taskDate = task.createdAt.toDate();
      return format(taskDate, "yyyy-MM") === currentMonth;
    } catch (error) {
      console.warn("Invalid createdAt date for task:", task.id);
      return false;
    }
  });
  
  const completedTasks = thisMonthTasks.filter(task => task.completed);
  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    try {
      const dueDate = task.dueDate.toDate();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return dueDate < today && !task.completed;
    } catch (error) {
      console.warn("Invalid dueDate for task:", task.id);
      return false;
    }
  });
  
  const completionRate = thisMonthTasks.length > 0 
    ? Math.round((completedTasks.length / thisMonthTasks.length) * 100)
    : 0;

  return (
    <section className="px-4 mb-6">
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-gray-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-800" data-testid="text-total-tasks">
              {thisMonthTasks.length}
            </div>
            <div className="text-xs text-gray-500 mt-1">Total Tasks</div>
            <div className="text-xs text-gray-400">This month</div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-accent-green" data-testid="text-completed-tasks">
              {completedTasks.length}
            </div>
            <div className="text-xs text-gray-500 mt-1">Completed</div>
            <div className="text-xs text-accent-green">{completionRate}% done</div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-accent-red" data-testid="text-overdue-tasks">
              {overdueTasks.length}
            </div>
            <div className="text-xs text-gray-500 mt-1">Overdue</div>
            <div className="text-xs text-accent-red">Need attention</div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
