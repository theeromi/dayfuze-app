import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Mic } from "lucide-react";
import { QuickAddTask } from "@/components/QuickAddTask";

interface FABProps {
  onClick: () => void;
}

export function FAB({ onClick }: FABProps) {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const handleMainClick = () => {
    if (showOptions) {
      setShowOptions(false);
    } else {
      setShowOptions(true);
    }
  };

  const handleQuickAdd = () => {
    setShowOptions(false);
    setShowQuickAdd(true);
  };

  const handleFullModal = () => {
    setShowOptions(false);
    onClick();
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        {/* Option buttons - appear when main FAB is clicked */}
        {showOptions && (
          <div className="absolute bottom-16 right-0 space-y-3 animate-fade-in">
            <Button
              onClick={handleQuickAdd}
              className="w-12 h-12 rounded-full shadow-lg bg-green-600 hover:bg-green-700 text-white flex items-center justify-center"
              data-testid="button-quick-add"
            >
              <Mic className="h-5 w-5" />
            </Button>
            <Button
              onClick={handleFullModal}
              className="w-12 h-12 rounded-full shadow-lg bg-gray-600 hover:bg-gray-700 text-white flex items-center justify-center"
              data-testid="button-full-add"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Main FAB */}
        <Button
          onClick={handleMainClick}
          className={`w-14 h-14 rounded-full shadow-lg text-white z-50 transition-transform ${
            showOptions ? 'rotate-45 bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
          }`}
          data-testid="button-fab"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Quick Add Modal */}
      <QuickAddTask
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
      />
    </>
  );
}
