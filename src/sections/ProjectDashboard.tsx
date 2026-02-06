import { useEffect, useState } from "react";
import { supabase, type Project } from "../lib/supabase";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Loader2,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Box,
} from "lucide-react";
import ProjectWorkflow from "./ProjectWorkflow";

interface ProjectDashboardProps {
  projects: Project[];
  onProjectsUpdate: (projects: Project[]) => void;
}

export default function ProjectDashboard({
  projects,
  onProjectsUpdate,
}: ProjectDashboardProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel("projects-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "projects",
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            const updatedProject = payload.new as Project;
            onProjectsUpdate(
              projects.map((p) => (p.id === updatedProject.id ? updatedProject : p))
            );
            if (selectedProject?.id === updatedProject.id) {
              setSelectedProject(updatedProject);
            }
          } else if (payload.eventType === "DELETE") {
            onProjectsUpdate(projects.filter((p) => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projects, onProjectsUpdate, selectedProject]);

  const handleDeleteProject = async (projectId: string) => {
    try {
      await supabase.from("projects").delete().eq("id", projectId);
      onProjectsUpdate(projects.filter((p) => p.id !== projectId));
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "mesh_ready":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "processing":
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<
      string,
      { variant: "default" | "secondary" | "destructive" | "outline"; label: string }
    > = {
      completed: { variant: "default", label: "Completed" },
      mesh_ready: { variant: "default", label: "3D Ready" },
      processing: { variant: "secondary", label: "Processing" },
      failed: { variant: "destructive", label: "Failed" },
      pending: { variant: "outline", label: "Pending" },
    };
    const { variant, label } = config[status] || config.pending;
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getStatusMessage = (project: Project) => {
    switch (project.status) {
      case "processing":
        return `Generating 3D model with ${project.processing_provider || "AI"}...`;
      case "mesh_ready":
        return "3D model ready - Set dimensions to generate Revit family";
      case "completed":
        return "Revit family ready for download";
      case "failed":
        return project.error_message || "Processing failed";
      default:
        return "Waiting in queue";
    }
  };

  if (projects.length === 0) {
    return (
      <section className="py-24 px-6 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Your Projects</h2>
            <p className="text-gray-400 text-lg">
              Track your furniture-to-Revit conversions
            </p>
          </div>
          <Card className="p-12 bg-[#1a1a1a] border-gray-800 text-center">
            <Box className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 text-lg mb-2">No projects yet</p>
            <p className="text-gray-500">
              Upload a furniture image above to get started!
            </p>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 px-6 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Your Projects</h2>
          <p className="text-gray-400 text-lg">
            {projects.length} project{projects.length !== 1 ? "s" : ""} - Track your
            furniture-to-Revit conversions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="bg-[#1a1a1a] border-gray-800 hover:border-gray-700 transition-all overflow-hidden group"
            >
              <div className="aspect-video bg-[#0a0a0a] relative overflow-hidden">
                <img
                  src={project.image_url}
                  alt={project.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">{getStatusBadge(project.status)}</div>
                {project.status === "processing" && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-2" />
                      <p className="text-white text-sm">Processing...</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-5">
                <h3 className="text-white font-semibold text-lg mb-1 truncate">
                  {project.name}
                </h3>
                <p className="text-gray-400 text-sm capitalize mb-3">
                  {project.furniture_category}
                </p>

                <div className="flex items-start gap-2 mb-4 min-h-[40px]">
                  {getStatusIcon(project.status)}
                  <span className="text-gray-500 text-sm leading-tight">
                    {getStatusMessage(project)}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedProject(project)}
                    className="flex-1 bg-[#0a0a0a] border-gray-700 hover:bg-gray-800"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Open
                  </Button>

                  {project.revit_family_url && (
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-cyan-600"
                      onClick={() => window.open(project.revit_family_url!, "_blank")}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      IFC
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteProject(project.id)}
                    className="text-gray-500 hover:text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {selectedProject && (
        <ProjectWorkflow
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onUpdate={(updated) => {
            setSelectedProject(updated);
            onProjectsUpdate(
              projects.map((p) => (p.id === updated.id ? updated : p))
            );
          }}
        />
      )}
    </section>
  );
}
