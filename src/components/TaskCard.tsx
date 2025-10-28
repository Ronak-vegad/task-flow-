import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Trash2, Edit, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    status: "todo" | "in-progress" | "done";
    priority: "low" | "medium" | "high";
    due_date: string | null;
  };
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: "todo" | "in-progress" | "done") => void;
}

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) => {
  const statusColors = {
    todo: "bg-status-todo/10 text-status-todo border-status-todo/20",
    "in-progress": "bg-status-in-progress/10 text-status-in-progress border-status-in-progress/20",
    done: "bg-status-done/10 text-status-done border-status-done/20",
  };

  const priorityColors = {
    low: "bg-priority-low/10 text-priority-low border-priority-low/20",
    medium: "bg-priority-medium/10 text-priority-medium border-priority-medium/20",
    high: "bg-priority-high/10 text-priority-high border-priority-high/20",
  };

  const statusLabels = {
    todo: "To Do",
    "in-progress": "In Progress",
    done: "Done",
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200 hover:border-primary/30">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg mb-2 break-words">{task.title}</CardTitle>
            {task.description && (
              <CardDescription className="line-clamp-2 break-words">
                {task.description}
              </CardDescription>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange("todo")}>
                Move to To Do
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange("in-progress")}>
                Move to In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange("done")}>
                Move to Done
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex gap-2 mt-4 flex-wrap">
          <Badge variant="secondary" className={statusColors[task.status]}>
            {statusLabels[task.status]}
          </Badge>
          <Badge variant="secondary" className={priorityColors[task.priority]}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </Badge>
          {task.due_date && (
            <Badge variant="outline" className="gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(task.due_date), "MMM d, yyyy")}
            </Badge>
          )}
        </div>
      </CardHeader>
    </Card>
  );
};

export default TaskCard;
