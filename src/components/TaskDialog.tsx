import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    title: string;
    description: string;
    status: "todo" | "in-progress" | "done";
    priority: "low" | "medium" | "high";
    due_date: string | null;
  }) => Promise<void>;
  initialData?: {
    title: string;
    description: string | null;
    status: "todo" | "in-progress" | "done";
    priority: "low" | "medium" | "high";
    due_date: string | null;
  };
  title: string;
}

const TaskDialog = ({ open, onOpenChange, onSubmit, initialData, title }: TaskDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"todo" | "in-progress" | "done">("todo");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (open && initialData) {
      setTaskTitle(initialData.title);
      setDescription(initialData.description || "");
      setStatus(initialData.status);
      setPriority(initialData.priority);
      setDueDate(initialData.due_date || "");
    } else if (open) {
      setTaskTitle("");
      setDescription("");
      setStatus("todo");
      setPriority("medium");
      setDueDate("");
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await onSubmit({
      title: taskTitle,
      description,
      status,
      priority,
      due_date: dueDate || null,
    });
    setIsLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Task Title</Label>
            <Input
              id="task-title"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Enter task title"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description (optional)"
              rows={3}
              disabled={isLoading}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="task-status">Status</Label>
              <Select value={status} onValueChange={(value: any) => setStatus(value)} disabled={isLoading}>
                <SelectTrigger id="task-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-priority">Priority</Label>
              <Select value={priority} onValueChange={(value: any) => setPriority(value)} disabled={isLoading}>
                <SelectTrigger id="task-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-due-date">Due Date</Label>
            <Input
              id="task-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDialog;
