import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Header';
import { TaskList } from '../components/TaskList';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { QuickAddModal } from '../components/QuickAddModal';

export default function Dashboard() {
  const { user } = useAuth();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  if (!user) {
    return <div>Please login to continue</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-gray-600 mt-2">Let's make today productive</p>
        </div>
        
        <TaskList />
        
        <FloatingActionButton onQuickAdd={() => setIsQuickAddOpen(true)} />
        
        <QuickAddModal 
          isOpen={isQuickAddOpen} 
          onClose={() => setIsQuickAddOpen(false)} 
        />
      </main>
    </div>
  );
}