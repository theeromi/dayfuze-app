import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FABProps {
  onClick: () => void;
}

export function FAB({ onClick }: FABProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-blue-600 text-white rounded-full shadow-card z-20 transition-all transform hover:scale-105"
      data-testid="button-add-task"
    >
      <Plus className="w-6 h-6" />
    </Button>
  );
}
