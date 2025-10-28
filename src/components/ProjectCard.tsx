import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Trash2, Edit } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    task_counts?: {
      todo: number;
      "in-progress": number;
      done: number;
    };
  };
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ProjectCard = ({ project, onSelect, onEdit, onDelete }: ProjectCardProps) => {
  const totalTasks =
    (project.task_counts?.todo || 0) +
    (project.task_counts?.["in-progress"] || 0) +
    (project.task_counts?.done || 0);

  return (
    <Card
      className="hover:shadow-lg transition-all duration-300 cursor-pointer group hover:border-primary/50"
      onClick={onSelect}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
              {project.name}
            </CardTitle>
            {project.description && (
              <CardDescription className="line-clamp-2">
                {project.description}
              </CardDescription>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {totalTasks > 0 && (
          <div className="flex gap-2 mt-4 flex-wrap">
            {project.task_counts && project.task_counts.todo > 0 && (
              <Badge variant="secondary" className="bg-status-todo/10 text-status-todo border-status-todo/20">
                {project.task_counts.todo} Todo
              </Badge>
            )}
            {project.task_counts && project.task_counts["in-progress"] > 0 && (
              <Badge variant="secondary" className="bg-status-in-progress/10 text-status-in-progress border-status-in-progress/20">
                {project.task_counts["in-progress"]} In Progress
              </Badge>
            )}
            {project.task_counts && project.task_counts.done > 0 && (
              <Badge variant="secondary" className="bg-status-done/10 text-status-done border-status-done/20">
                {project.task_counts.done} Done
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
    </Card>
  );
};

export default ProjectCard;
