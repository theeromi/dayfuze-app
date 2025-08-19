import { useState } from "react";
import { Header } from "@/components/Header";
import { DrawerNavigation } from "@/components/DrawerNavigation";
import { TaskCard } from "@/components/TaskCard";
import { useTask } from "@/contexts/TaskContext";
import { useLocation } from "wouter";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";

export default function Timeline() {
  const { tasks, toggleTaskCompletion } = useTask();
  const [, setLocation] = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const selectedDateTasks = tasks.filter(task => {
    const taskDate = task.dueDate.toDate();
    return isSameDay(taskDate, selectedDate);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onMenuClick={() => setDrawerOpen(true)}
        onProfileClick={() => setLocation("/profile")}
      />

      <DrawerNavigation
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      <main className="pb-20">
        <section className="px-4 pt-6 pb-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Weekly Timeline</h1>
          <p className="text-gray-600">View your tasks by day</p>
        </section>

        <section className="px-4 mb-6">
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day) => {
              const isSelected = isSameDay(day, selectedDate);
              const dayTasks = tasks.filter(task => isSameDay(task.dueDate.toDate(), day));
              
              return (
                <Button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  variant="ghost"
                  className={`p-3 h-auto rounded-lg transition-colors ${
                    isSelected 
                      ? "bg-primary text-white" 
                      : dayTasks.length > 0 
                      ? "bg-blue-50 text-primary" 
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  data-testid={`button-day-${format(day, "yyyy-MM-dd")}`}
                >
                  <div className="text-center">
                    <div className="text-xs mb-1">{format(day, "EEE")}</div>
                    <div className="text-lg font-semibold">{format(day, "d")}</div>
                    {dayTasks.length > 0 && (
                      <div className="text-xs mt-1">
                        {dayTasks.length} task{dayTasks.length !== 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                </Button>
              );
            })}
          </div>
        </section>

        <section className="px-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Tasks for {format(selectedDate, "EEEE, MMMM d")}
          </h2>
          
          {selectedDateTasks.length === 0 ? (
            <div className="bg-white rounded-xl shadow-soft p-6 text-center">
              <p className="text-gray-500">No tasks scheduled for this day</p>
              <p className="text-sm text-gray-400 mt-1">Select another day or create a new task</p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedDateTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={toggleTaskCompletion}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
