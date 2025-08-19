import React, { useState } from 'react';
import { Plus, Mic, Edit3 } from 'lucide-react';

interface FABProps {
  onQuickAdd: () => void;
  onVoiceAdd: () => void;
  onFullAdd: () => void;
}

export function FAB({ onQuickAdd, onVoiceAdd, onFullAdd }: FABProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Expanded options */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 space-y-2 mb-2">
          <button
            onClick={() => {
              onVoiceAdd();
              setIsExpanded(false);
            }}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-purple-700 transition-all"
            data-testid="voice-add-fab"
          >
            <Mic size={16} />
            <span className="text-sm">Voice Add</span>
          </button>
          
          <button
            onClick={() => {
              onFullAdd();
              setIsExpanded(false);
            }}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-green-700 transition-all"
            data-testid="full-add-fab"
          >
            <Edit3 size={16} />
            <span className="text-sm">Full Form</span>
          </button>
          
          <button
            onClick={() => {
              onQuickAdd();
              setIsExpanded(false);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-all"
            data-testid="quick-add-fab"
          >
            <Plus size={16} />
            <span className="text-sm">Quick Add</span>
          </button>
        </div>
      )}

      {/* Main FAB button */}
      <button
        onClick={toggleExpanded}
        className={`bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all transform ${
          isExpanded ? 'rotate-45' : 'rotate-0'
        }`}
        data-testid="main-fab"
        aria-label={isExpanded ? "Close options" : "Add new task"}
      >
        <Plus size={24} />
      </button>
    </div>
  );
}