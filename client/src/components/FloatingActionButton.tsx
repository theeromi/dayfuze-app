import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onQuickAdd: () => void;
}

export function FloatingActionButton({ onQuickAdd }: FloatingActionButtonProps) {
  return (
    <button
      onClick={onQuickAdd}
      className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
      aria-label="Add new task"
    >
      <Plus size={24} />
    </button>
  );
}