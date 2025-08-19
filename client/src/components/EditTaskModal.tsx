import { useState, useEffect } from "react";
import { X, Flag, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTask, CreateTaskData, Task } from "@/contexts/TaskContext";
import { format } from "date-fns";

interface EditTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
}

export function EditTaskModal({ open, onOpenChange, task }: EditTaskModalProps) {
  const { editTask } = useTask();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    status: "todo" as "todo" | "progress" | "done",
    dueDate: format(new Date(), "yyyy-MM-dd"),
    dueTime: "",
  });

  // Update form when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? format(task.dueDate.toDate(), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
        dueTime: task.dueTime || "",
      });
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !task) return;

    setLoading(true);
    try {
      const updates: Partial<CreateTaskData> = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        status: formData.status,
        dueDate: new Date(formData.dueDate),
        dueTime: formData.dueTime || undefined,
      };

      await editTask(task.id, updates);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to edit task:", error);
      
      // Show user-friendly error message
      if (error.code === 'permission-denied') {
        alert("Permission denied. Please check if Firestore is set up with proper security rules.");
      } else if (error.code === 'unavailable') {
        alert("Firebase is currently unavailable. Please try again in a moment.");
      } else {
        alert("Failed to edit task. Please check your internet connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const setPriority = (priority: "low" | "medium" | "high") => {
    setFormData({ ...formData, priority });
  };

  const setStatus = (status: "todo" | "progress" | "done") => {
    setFormData({ ...formData, status });
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md mx-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Edit Task
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-title" className="text-sm font-medium text-gray-700">
              Task Title
            </Label>
            <Input
              id="edit-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter task title"
              className="mt-1"
              required
              data-testid="input-edit-title"
            />
          </div>

          <div>
            <Label htmlFor="edit-description" className="text-sm font-medium text-gray-700">
              Description
            </Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter task description"
              className="mt-1 min-h-[80px]"
              data-testid="textarea-edit-description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-date" className="text-sm font-medium text-gray-700">
                Due Date
              </Label>
              <Input
                id="edit-date"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="mt-1"
                required
                data-testid="input-edit-date"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-time" className="text-sm font-medium text-gray-700">
                Due Time
              </Label>
              <Input
                id="edit-time"
                type="time"
                value={formData.dueTime}
                onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                className="mt-1"
                data-testid="input-edit-time"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Priority
            </Label>
            <div className="flex space-x-2">
              {["low", "medium", "high"].map((priority) => (
                <Button
                  key={priority}
                  type="button"
                  variant={formData.priority === priority ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPriority(priority as "low" | "medium" | "high")}
                  className={`flex items-center space-x-1 ${
                    formData.priority === priority
                      ? priority === "high"
                        ? "bg-red-500 hover:bg-red-600"
                        : priority === "medium"
                        ? "bg-yellow-500 hover:bg-yellow-600"
                        : "bg-green-500 hover:bg-green-600"
                      : ""
                  }`}
                  data-testid={`button-priority-${priority}`}
                >
                  <Flag className="w-3 h-3" />
                  <span className="capitalize">{priority}</span>
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Status
            </Label>
            <div className="flex space-x-2">
              {[
                { value: "todo", label: "To Do" },
                { value: "progress", label: "In Progress" },
                { value: "done", label: "Done" }
              ].map((status) => (
                <Button
                  key={status.value}
                  type="button"
                  variant={formData.status === status.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatus(status.value as "todo" | "progress" | "done")}
                  className={`${
                    formData.status === status.value
                      ? status.value === "done"
                        ? "bg-green-500 hover:bg-green-600"
                        : status.value === "progress"
                        ? "bg-blue-500 hover:bg-blue-600"
                        : "bg-gray-500 hover:bg-gray-600"
                      : ""
                  }`}
                  data-testid={`button-status-${status.value}`}
                >
                  {status.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-edit"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="bg-primary hover:bg-primary/90"
              data-testid="button-save-edit"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}