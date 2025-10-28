import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Plus, FolderKanban } from "lucide-react";
import Layout from "@/components/Layout";
import ProjectCard from "@/components/ProjectCard";
import ProjectDialog from "@/components/ProjectDialog";
import { useNavigate } from "react-router-dom";
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

interface Project {
  id: string;
  name: string;
  description: string | null;
  task_counts?: {
    todo: number;
    "in-progress": number;
    done: number;
  };
}

const Dashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (projectsError) throw projectsError;

      // Fetch task counts for each project
      const projectsWithCounts = await Promise.all(
        (projectsData || []).map(async (project) => {
          const { data: tasks } = await supabase
            .from("tasks")
            .select("status")
            .eq("project_id", project.id);

          const task_counts = {
            todo: tasks?.filter((t) => t.status === "todo").length || 0,
            "in-progress": tasks?.filter((t) => t.status === "in-progress").length || 0,
            done: tasks?.filter((t) => t.status === "done").length || 0,
          };

          return { ...project, task_counts };
        })
      );

      setProjects(projectsWithCounts);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (data: { name: string; description: string }) => {
    try {
      const { error } = await supabase
        .from("projects")
        .insert({
          name: data.name,
          description: data.description || null,
          user_id: user?.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Project created successfully",
      });

      fetchProjects();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateProject = async (data: { name: string; description: string }) => {
    if (!editingProject) return;

    try {
      const { error } = await supabase
        .from("projects")
        .update({
          name: data.name,
          description: data.description || null,
        })
        .eq("id", editingProject.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Project updated successfully",
      });

      setEditingProject(null);
      fetchProjects();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectToDelete);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Project deleted successfully",
      });

      setProjectToDelete(null);
      setDeleteDialogOpen(false);
      fetchProjects();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
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
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
            <p className="text-muted-foreground">
              Manage your projects and tasks
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <FolderKanban className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first project to get started
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onSelect={() => navigate(`/project/${project.id}`)}
                onEdit={() => {
                  setEditingProject(project);
                  setDialogOpen(true);
                }}
                onDelete={() => {
                  setProjectToDelete(project.id);
                  setDeleteDialogOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      <ProjectDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingProject(null);
        }}
        onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
        initialData={editingProject || undefined}
        title={editingProject ? "Edit Project" : "Create New Project"}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this project and all its tasks. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Dashboard;
