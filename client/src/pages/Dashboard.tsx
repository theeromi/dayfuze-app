import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { DrawerNavigation } from "@/components/DrawerNavigation";
import { TaskSummary } from "@/components/TaskSummary";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilters } from "@/components/CategoryFilters";
import { TodaysTasksHorizontal } from "@/components/TodaysTasksHorizontal";
import { FAB } from "@/components/FAB";
import { AddTaskModal } from "@/components/AddTaskModal";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [, setLocation] = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || "User";

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
          <h1 className="text-2xl font-bold text-gray-800 mb-1" data-testid="text-greeting">
            {getGreeting()}, {displayName}! 👋
          </h1>
          <p className="text-gray-600">Let's make today productive</p>
        </section>

        <TaskSummary />
        
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
        />

        <CategoryFilters
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        <TodaysTasksHorizontal />

        <section className="px-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
          <div className="bg-white rounded-xl shadow-soft p-6 text-center">
            <p className="text-gray-500">Activity tracking coming soon</p>
            <p className="text-sm text-gray-400 mt-1">We'll show your recent task activities here</p>
          </div>
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
