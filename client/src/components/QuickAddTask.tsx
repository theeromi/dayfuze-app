import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X } from "lucide-react";
import { useTask } from "@/contexts/TaskContext";
import { useToast } from "@/hooks/use-toast";
import { VoiceInput } from "@/components/VoiceInput";

interface QuickAddTaskProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickAddTask({ isOpen, onClose }: QuickAddTaskProps) {
  const [title, setTitle] = useState("");
  const [isListening, setIsListening] = useState(false);
  const { addTask } = useTask();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        title: "Task title required",
        description: "Please enter a task title or use voice input.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addTask({
        title: title.trim(),
        description: "",
        priority: "medium",
        status: "todo",
        dueDate: new Date()
      });

      toast({
        title: "Task added successfully",
        description: `"${title.trim()}" has been added to your tasks.`,
      });

      setTitle("");
      onClose();
    } catch (error) {
      console.error('Failed to add task:', error);
      toast({
        title: "Failed to add task",
        description: "There was an error adding your task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVoiceTranscription = (transcript: string) => {
    setTitle(transcript);
    toast({
      title: "Voice input received",
      description: `Captured: "${transcript}"`,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleToggleListening = () => {
    setIsListening(!isListening);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center p-4">
      <Card className="w-full max-w-md animate-slide-up">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Quick Add Task</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              data-testid="button-close-quick-add"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="What needs to be done?"
                className="flex-1"
                autoFocus
                data-testid="input-quick-task-title"
              />
              <VoiceInput
                onTranscription={handleVoiceTranscription}
                isListening={isListening}
                onToggleListening={handleToggleListening}
              />
            </div>

            {isListening && (
              <div className="text-center py-2">
                <div className="inline-flex items-center space-x-2 text-red-500">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">Listening...</span>
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <Button
                onClick={handleSubmit}
                className="flex-1"
                disabled={isListening}
                data-testid="button-add-quick-task"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isListening}
                data-testid="button-cancel-quick-add"
              >
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}