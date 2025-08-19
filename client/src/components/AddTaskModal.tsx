import { useState } from "react";
import { X, Flag, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTask, CreateTaskData } from "@/contexts/TaskContext";
import { format } from "date-fns";

interface AddTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTaskModal({ open, onOpenChange }: AddTaskModalProps) {
  const { addTask } = useTask();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    status: "todo" as "todo" | "progress" | "done",
    dueDate: format(new Date(), "yyyy-MM-dd"),
    dueTime: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setLoading(true);
    try {
      const taskData: CreateTaskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        status: formData.status,
        dueDate: new Date(formData.dueDate),
        dueTime: formData.dueTime || undefined,
      };

      await addTask(taskData);
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        status: "todo",
        dueDate: format(new Date(), "yyyy-MM-dd"),
        dueTime: "",
      });
      
      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to add task:", error);
      
      // Show user-friendly error message
      if (error.code === 'permission-denied') {
        alert("Permission denied. Please check if Firestore is set up with proper security rules.");
      } else if (error.code === 'unavailable') {
        alert("Firebase is currently unavailable. Please try again in a moment.");
      } else {
        alert("Failed to add task. Please check your internet connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const setPriority = (priority: "low" | "medium" | "high") => {
    setFormData({ ...formData, priority });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">Add New Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Task Title *
            </Label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter task title"
              required
              className="w-full rounded-xl"
              data-testid="input-task-title"
            />
          </div>

          <div>
            <Label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </Label>
            <Textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add task description (optional)"
              className="w-full rounded-xl resize-none"
              data-testid="textarea-task-description"
            />
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">Priority</Label>
            <div className="flex space-x-3">
              <Button
                type="button"
                onClick={() => setPriority("low")}
                className={`flex-1 py-3 px-4 border-2 rounded-xl text-sm font-medium focus:outline-none ${
                  formData.priority === "low"
                    ? "border-accent-green bg-green-50 text-accent-green"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
                data-testid="button-priority-low"
              >
                <Flag className="w-4 h-4 mr-2 text-accent-green" />
                Low
              </Button>
              <Button
                type="button"
                onClick={() => setPriority("medium")}
                className={`flex-1 py-3 px-4 border-2 rounded-xl text-sm font-medium focus:outline-none ${
                  formData.priority === "medium"
                    ? "border-accent-yellow bg-yellow-50 text-accent-yellow"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
                data-testid="button-priority-medium"
              >
                <Flag className="w-4 h-4 mr-2 text-accent-yellow" />
                Medium
              </Button>
              <Button
                type="button"
                onClick={() => setPriority("high")}
                className={`flex-1 py-3 px-4 border-2 rounded-xl text-sm font-medium focus:outline-none ${
                  formData.priority === "high"
                    ? "border-accent-red bg-red-50 text-accent-red"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
                data-testid="button-priority-high"
              >
                <Flag className="w-4 h-4 mr-2 text-accent-red" />
                High
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
              Due Date *
            </Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
              className="w-full rounded-xl"
              data-testid="input-due-date"
            />
          </div>

          <div>
            <Label htmlFor="dueTime" className="block text-sm font-medium text-gray-700 mb-2">
              Due Time (Optional)
            </Label>
            <Input
              id="dueTime"
              type="time"
              value={formData.dueTime}
              onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
              className="w-full rounded-xl"
              data-testid="input-due-time"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-blue-600 text-white font-semibold py-4 rounded-xl transition-colors"
            data-testid="button-submit-task"
          >
            <Plus className="w-4 h-4 mr-2" />
            {loading ? "Adding Task..." : "Add Task"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
