import { useState } from "react";
import { Header } from "@/components/Header";
import { DrawerNavigation } from "@/components/DrawerNavigation";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilters } from "@/components/CategoryFilters";
import { TaskCard } from "@/components/TaskCard";
import { FAB } from "@/components/FAB";
import { AddTaskModal } from "@/components/AddTaskModal";
import { useTask } from "@/contexts/TaskContext";
import { useLocation } from "wouter";

export default function Tasks() {
  const { tasks, toggleTaskCompletion, deleteTask } = useTask();
  const [, setLocation] = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    if (activeFilter !== "all") {
      matchesFilter = task.status === activeFilter;
    }

    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (taskId: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(taskId);
      } catch (error) {
        console.error("Failed to delete task:", error);
      }
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-800 mb-1">All Tasks</h1>
          <p className="text-gray-600">Manage your tasks efficiently</p>
        </section>

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
        />

        <CategoryFilters
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        <section className="px-4">
          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-xl shadow-soft p-6 text-center">
              <p className="text-gray-500">
                {searchQuery || activeFilter !== "all" 
                  ? "No tasks found matching your criteria" 
                  : "No tasks yet"}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {searchQuery || activeFilter !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "Create your first task to get started"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={toggleTaskCompletion}
                  onDelete={handleDelete}
                  showActions={true}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <FAB onClick={() => setAddTaskModalOpen(true)} />

      <AddTaskModal
        open={addTaskModalOpen}
        onOpenChange={setAddTaskModalOpen}
      />
    </div>
  );
}
