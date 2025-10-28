import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, ListTodo } from "lucide-react";
import Layout from "@/components/Layout";
import TaskCard from "@/components/TaskCard";
import TaskDialog from "@/components/TaskDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  due_date: string | null;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
}

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && id) {
      fetchProjectAndTasks();
    }
  }, [user, id]);

  const fetchProjectAndTasks = async () => {
    try {
      // Fetch project
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);

      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: false });

      if (tasksError) throw tasksError;
      setTasks((tasksData || []) as Task[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (data: {
    title: string;
    description: string;
    status: "todo" | "in-progress" | "done";
    priority: "low" | "medium" | "high";
    due_date: string | null;
  }) => {
    try {
      const { error } = await supabase.from("tasks").insert({
        title: data.title,
        description: data.description || null,
        status: data.status,
        priority: data.priority,
        due_date: data.due_date,
        project_id: id,
        user_id: user?.id,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Task created successfully",
      });

      fetchProjectAndTasks();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateTask = async (data: {
    title: string;
    description: string;
    status: "todo" | "in-progress" | "done";
    priority: "low" | "medium" | "high";
    due_date: string | null;
  }) => {
    if (!editingTask) return;

    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          title: data.title,
          description: data.description || null,
          status: data.status,
          priority: data.priority,
          due_date: data.due_date,
        })
        .eq("id", editingTask.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Task updated successfully",
      });

      setEditingTask(null);
      fetchProjectAndTasks();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskToDelete);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Task deleted successfully",
      });

      setTaskToDelete(null);
      setDeleteDialogOpen(false);
      fetchProjectAndTasks();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: "todo" | "in-progress" | "done") => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", taskId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Task status updated",
      });

      fetchProjectAndTasks();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getTasksByStatus = (status: "todo" | "in-progress" | "done") => {
    return tasks.filter((task) => task.status === status);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="mb-2 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
            <h2 className="text-3xl font-bold tracking-tight">{project?.name}</h2>
            {project?.description && (
              <p className="text-muted-foreground">{project.description}</p>
            )}
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Tasks ({tasks.length})</TabsTrigger>
            <TabsTrigger value="todo">To Do ({getTasksByStatus("todo").length})</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress ({getTasksByStatus("in-progress").length})</TabsTrigger>
            <TabsTrigger value="done">Done ({getTasksByStatus("done").length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {tasks.length === 0 ? (
              <EmptyState onCreateTask={() => setDialogOpen(true)} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={() => {
                      setEditingTask(task);
                      setDialogOpen(true);
                    }}
                    onDelete={() => {
                      setTaskToDelete(task.id);
                      setDeleteDialogOpen(true);
                    }}
                    onStatusChange={(status) => handleStatusChange(task.id, status)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {(["todo", "in-progress", "done"] as const).map((status) => (
            <TabsContent key={status} value={status} className="mt-6">
              {getTasksByStatus(status).length === 0 ? (
                <EmptyState onCreateTask={() => setDialogOpen(true)} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getTasksByStatus(status).map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={() => {
                        setEditingTask(task);
                        setDialogOpen(true);
                      }}
                      onDelete={() => {
                        setTaskToDelete(task.id);
                        setDeleteDialogOpen(true);
                      }}
                      onStatusChange={(newStatus) => handleStatusChange(task.id, newStatus)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingTask(null);
        }}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        initialData={editingTask || undefined}
        title={editingTask ? "Edit Task" : "Create New Task"}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this task. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTask} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

const EmptyState = ({ onCreateTask }: { onCreateTask: () => void }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
      <ListTodo className="w-8 h-8 text-primary" />
    </div>
    <h3 className="text-xl font-semibold mb-2">No tasks yet</h3>
    <p className="text-muted-foreground mb-6">
      Create your first task to get started
    </p>
    <Button onClick={onCreateTask}>
      <Plus className="w-4 h-4 mr-2" />
      Create Task
    </Button>
  </div>
);

export default ProjectDetail;
