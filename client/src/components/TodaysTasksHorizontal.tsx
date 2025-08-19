import { useTask } from "@/contexts/TaskContext";
import { TaskCard } from "./TaskCard";
import { isToday } from "date-fns";

export function TodaysTasksHorizontal() {
  const { tasks, toggleTaskCompletion } = useTask();

  const todaysTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    try {
      const taskDate = task.dueDate.toDate();
      return isToday(taskDate);
    } catch (error) {
      console.warn("Invalid dueDate for task:", task.id);
      return false;
    }
  });

  return (
    <section className="mb-8">
      <div className="px-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Today's Tasks</h2>
        <p className="text-sm text-gray-500">Tasks due today</p>
      </div>
      
      {todaysTasks.length === 0 ? (
        <div className="px-4">
          <div className="bg-white rounded-xl shadow-soft p-6 text-center">
            <p className="text-gray-500">No tasks due today</p>
            <p className="text-sm text-gray-400 mt-1">You're all caught up! 🎉</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="flex space-x-4 px-4 pb-2">
            {todaysTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={toggleTaskCompletion}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
