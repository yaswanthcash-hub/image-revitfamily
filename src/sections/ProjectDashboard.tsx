import { useEffect, useState } from 'react';
import { supabase, type Project } from '../lib/supabase';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Loader2, Download, Eye, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import { Suspense } from 'react';

interface ProjectDashboardProps {
  projects: Project[];
  onProjectsUpdate: (projects: Project[]) => void;
}

function Model3D({ url }: { url: string }) {
  try {
    const { scene } = useGLTF(url);
    return <primitive object={scene} scale={1.5} />;
  } catch (error) {
    return null;
  }
}

export default function ProjectDashboard({ projects, onProjectsUpdate }: ProjectDashboardProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [dimensions, setDimensions] = useState({
    height: 0,
    width: 0,
    depth: 0,
  });

  useEffect(() => {
    const channel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const updatedProject = payload.new as Project;
            onProjectsUpdate(
              projects.map((p) => (p.id === updatedProject.id ? updatedProject : p))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projects, onProjectsUpdate]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      completed: 'default',
      processing: 'secondary',
      failed: 'destructive',
      pending: 'outline',
    };
    return (
      <Badge variant={variants[status] || 'outline'} className="capitalize">
        {status}
      </Badge>
    );
  };

  const handleGenerateRevitFamily = async (project: Project) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          dimensions: dimensions,
          status: 'processing',
        })
        .eq('id', project.id)
        .select()
        .single();

      if (error) throw error;

      const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-revit-family`;

      await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          projectId: project.id,
          dimensions: dimensions,
        }),
      });

    } catch (err) {
      console.error('Error generating Revit family:', err);
    }
  };

  return (
    <section className="py-24 px-6 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Your Projects</h2>
          <p className="text-gray-400 text-lg">
            Track your furniture-to-Revit conversions
          </p>
        </div>

        {projects.length === 0 ? (
          <Card className="p-12 bg-[#1a1a1a] border-gray-800 text-center">
            <p className="text-gray-400 text-lg">
              No projects yet. Upload an image to get started!
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="p-6 bg-[#1a1a1a] border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className="flex gap-4">
                  <div className="w-32 h-32 bg-[#0a0a0a] rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={project.image_url}
                      alt={project.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-semibold truncate">
                        {project.name}
                      </h3>
                      {getStatusBadge(project.status)}
                    </div>
                    <p className="text-gray-400 text-sm mb-3 capitalize">
                      {project.furniture_category}
                    </p>
                    <div className="flex items-center gap-2 mb-4">
                      {getStatusIcon(project.status)}
                      <span className="text-gray-500 text-sm">
                        {project.status === 'processing'
                          ? 'Generating 3D model...'
                          : project.status === 'completed'
                          ? 'Ready for Revit export'
                          : project.status === 'failed'
                          ? 'Processing failed'
                          : 'Waiting in queue'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {project.mesh_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedProject(project)}
                          className="bg-[#0a0a0a] border-gray-700"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View 3D
                        </Button>
                      )}
                      {project.revit_family_url && (
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-blue-600 to-purple-600"
                          onClick={() => window.open(project.revit_family_url, '_blank')}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download .rfa
                        </Button>
                      )}
                      {project.mesh_url && !project.revit_family_url && (
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-blue-600 to-purple-600"
                          onClick={() => handleGenerateRevitFamily(project)}
                        >
                          Generate Revit Family
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {selectedProject?.mesh_url && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6">
            <div className="bg-[#1a1a1a] rounded-lg p-6 max-w-4xl w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white text-xl font-semibold">
                  {selectedProject.name}
                </h3>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedProject(null)}
                  className="text-gray-400 hover:text-white"
                >
                  Close
                </Button>
              </div>
              <div className="aspect-video bg-[#0a0a0a] rounded-lg overflow-hidden mb-4">
                <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                  <Suspense fallback={null}>
                    <ambientLight intensity={0.5} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                    <pointLight position={[-10, -10, -10]} />
                    <Model3D url={selectedProject.mesh_url!} />
                    <OrbitControls enableZoom={true} />
                    <Environment preset="studio" />
                  </Suspense>
                </Canvas>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-gray-400 text-sm block mb-2">
                    Height (inches)
                  </label>
                  <input
                    type="number"
                    value={dimensions.height}
                    onChange={(e) =>
                      setDimensions({ ...dimensions, height: Number(e.target.value) })
                    }
                    className="w-full bg-[#0a0a0a] border border-gray-700 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-2">
                    Width (inches)
                  </label>
                  <input
                    type="number"
                    value={dimensions.width}
                    onChange={(e) =>
                      setDimensions({ ...dimensions, width: Number(e.target.value) })
                    }
                    className="w-full bg-[#0a0a0a] border border-gray-700 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-2">
                    Depth (inches)
                  </label>
                  <input
                    type="number"
                    value={dimensions.depth}
                    onChange={(e) =>
                      setDimensions({ ...dimensions, depth: Number(e.target.value) })
                    }
                    className="w-full bg-[#0a0a0a] border border-gray-700 rounded px-3 py-2 text-white"
                  />
                </div>
              </div>
              <Button
                onClick={() => handleGenerateRevitFamily(selectedProject)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
              >
                Generate Revit Family with These Dimensions
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
