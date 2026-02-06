import { useState, useEffect, Suspense } from "react";
import { supabase, type Project } from "../lib/supabase";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Slider } from "../components/ui/slider";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Loader2,
  Download,
  CheckCircle2,
  XCircle,
  Image,
  Box,
  Ruler,
  FileBox,
  ArrowRight,
  RotateCcw,
  X,
} from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, Center } from "@react-three/drei";

interface ProjectWorkflowProps {
  project: Project;
  onClose: () => void;
  onUpdate: (project: Project) => void;
}

const WORKFLOW_STEPS = [
  { id: "upload", label: "Upload", icon: Image },
  { id: "processing", label: "3D Generation", icon: Box },
  { id: "dimensions", label: "Dimensions", icon: Ruler },
  { id: "export", label: "Revit Export", icon: FileBox },
];

function Model3D({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return (
    <Center>
      <primitive object={scene} scale={2} />
    </Center>
  );
}

function ModelFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#3b82f6" />
    </mesh>
  );
}

export default function ProjectWorkflow({
  project,
  onClose,
  onUpdate,
}: ProjectWorkflowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dimensions, setDimensions] = useState({
    height: project.dimensions?.height || 32,
    width: project.dimensions?.width || 18,
    depth: project.dimensions?.depth || 20,
  });
  const [generating, setGenerating] = useState(false);
  const [modelError] = useState(false);

  useEffect(() => {
    if (project.status === "pending") {
      setCurrentStep(0);
    } else if (project.status === "processing") {
      setCurrentStep(1);
    } else if (project.status === "mesh_ready" || project.status === "completed") {
      setCurrentStep(2);
    }
    if (project.revit_family_url) {
      setCurrentStep(3);
    }
  }, [project.status, project.revit_family_url]);

  useEffect(() => {
    const channel = supabase
      .channel(`project-${project.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "projects",
          filter: `id=eq.${project.id}`,
        },
        (payload) => {
          onUpdate(payload.new as Project);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [project.id, onUpdate]);

  const handleRetryProcessing = async () => {
    try {
      await supabase
        .from("projects")
        .update({ status: "pending", error_message: null })
        .eq("id", project.id);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-image-to-3d`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            projectId: project.id,
            imageUrl: project.image_url,
            category: project.furniture_category,
            provider: project.processing_provider || "instantmesh",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to retry processing");
      }
    } catch (error) {
      console.error("Retry failed:", error);
    }
  };

  const handleEstimateDimensions = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/estimate-dimensions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            projectId: project.id,
            imageUrl: project.image_url,
            category: project.furniture_category,
          }),
        }
      );

      const data = await response.json();
      if (data.success && data.dimensions) {
        setDimensions({
          height: data.dimensions.height,
          width: data.dimensions.width,
          depth: data.dimensions.depth,
        });
      }
    } catch (error) {
      console.error("Dimension estimation failed:", error);
    }
  };

  const handleGenerateRevitFamily = async () => {
    setGenerating(true);
    try {
      await supabase
        .from("projects")
        .update({ dimensions, status: "processing" })
        .eq("id", project.id);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-revit-family`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            projectId: project.id,
            dimensions,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate Revit family");
      }
    } catch (error) {
      console.error("Error generating Revit family:", error);
    } finally {
      setGenerating(false);
    }
  };

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return "completed";
    if (stepIndex === currentStep) return "current";
    return "pending";
  };

  const getProgressPercentage = () => {
    if (project.status === "pending") return 10;
    if (project.status === "processing") return 40;
    if (project.status === "mesh_ready") return 70;
    if (project.status === "completed") return 100;
    if (project.status === "failed") return 0;
    return 0;
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 overflow-auto">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">{project.name}</h2>
            <p className="text-gray-400 capitalize">
              {project.furniture_category} - {project.processing_provider || "AI Processing"}
            </p>
          </div>
          <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </Button>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {WORKFLOW_STEPS.map((step, index) => {
              const status = getStepStatus(index);
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                      status === "completed"
                        ? "bg-green-500 border-green-500"
                        : status === "current"
                        ? "bg-blue-500 border-blue-500"
                        : "bg-transparent border-gray-600"
                    }`}
                  >
                    {status === "completed" ? (
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    ) : (
                      <Icon
                        className={`w-6 h-6 ${
                          status === "current" ? "text-white" : "text-gray-500"
                        }`}
                      />
                    )}
                  </div>
                  <span
                    className={`ml-3 font-medium ${
                      status === "current"
                        ? "text-white"
                        : status === "completed"
                        ? "text-green-400"
                        : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>
                  {index < WORKFLOW_STEPS.length - 1 && (
                    <ArrowRight className="w-6 h-6 mx-6 text-gray-600" />
                  )}
                </div>
              );
            })}
          </div>
          <Progress value={getProgressPercentage()} className="h-2" />
        </div>

        {project.status === "failed" && (
          <Card className="p-6 bg-red-500/10 border-red-500/50 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <XCircle className="w-6 h-6 text-red-500" />
                <div>
                  <p className="text-red-400 font-medium">Processing Failed</p>
                  <p className="text-red-400/70 text-sm">
                    {project.error_message || "An error occurred during processing"}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetryProcessing}
                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-[#1a1a1a] border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Source Image</h3>
            <div className="aspect-square bg-[#0a0a0a] rounded-lg overflow-hidden">
              <img
                src={project.image_url}
                alt={project.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="mt-4 flex gap-2">
              <Badge variant="outline" className="capitalize">
                {project.furniture_category}
              </Badge>
              <Badge
                variant={
                  project.status === "completed" || project.status === "mesh_ready"
                    ? "default"
                    : project.status === "failed"
                    ? "destructive"
                    : "secondary"
                }
              >
                {project.status === "mesh_ready" ? "3D Ready" : project.status}
              </Badge>
            </div>
          </Card>

          <Card className="p-6 bg-[#1a1a1a] border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">3D Preview</h3>
            <div className="aspect-square bg-[#0a0a0a] rounded-lg overflow-hidden">
              {project.mesh_url && !modelError ? (
                <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                  <Suspense fallback={<ModelFallback />}>
                    <ambientLight intensity={0.5} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                    <pointLight position={[-10, -10, -10]} />
                    <Model3D url={project.mesh_url} />
                    <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={2} />
                    <Environment preset="studio" />
                  </Suspense>
                </Canvas>
              ) : project.status === "processing" ? (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                  <p className="text-gray-400">Generating 3D model...</p>
                  <p className="text-gray-500 text-sm mt-2">This may take 1-3 minutes</p>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <Box className="w-12 h-12 text-gray-600 mb-4" />
                  <p className="text-gray-500">3D model will appear here</p>
                </div>
              )}
            </div>
            {project.mesh_url && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(project.mesh_url!, "_blank")}
                  className="bg-[#0a0a0a] border-gray-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download GLB
                </Button>
              </div>
            )}
          </Card>

          <Card className="p-6 bg-[#1a1a1a] border-gray-800 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Dimensions (inches)</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEstimateDimensions}
                className="bg-[#0a0a0a] border-gray-700"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Auto-Estimate
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label className="text-gray-400 mb-2 block">Height</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[dimensions.height]}
                    onValueChange={([v]) => setDimensions({ ...dimensions, height: v })}
                    max={96}
                    min={6}
                    step={1}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={dimensions.height}
                    onChange={(e) =>
                      setDimensions({ ...dimensions, height: Number(e.target.value) })
                    }
                    className="w-20 bg-[#0a0a0a] border-gray-700 text-white"
                  />
                </div>
              </div>

              <div>
                <Label className="text-gray-400 mb-2 block">Width</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[dimensions.width]}
                    onValueChange={([v]) => setDimensions({ ...dimensions, width: v })}
                    max={120}
                    min={6}
                    step={1}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={dimensions.width}
                    onChange={(e) =>
                      setDimensions({ ...dimensions, width: Number(e.target.value) })
                    }
                    className="w-20 bg-[#0a0a0a] border-gray-700 text-white"
                  />
                </div>
              </div>

              <div>
                <Label className="text-gray-400 mb-2 block">Depth</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[dimensions.depth]}
                    onValueChange={([v]) => setDimensions({ ...dimensions, depth: v })}
                    max={120}
                    min={6}
                    step={1}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={dimensions.depth}
                    onChange={(e) =>
                      setDimensions({ ...dimensions, depth: Number(e.target.value) })
                    }
                    className="w-20 bg-[#0a0a0a] border-gray-700 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              {project.revit_family_url ? (
                <Button
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
                  size="lg"
                  onClick={() => window.open(project.revit_family_url!, "_blank")}
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Revit Family (.rfa)
                </Button>
              ) : (
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600"
                  size="lg"
                  onClick={handleGenerateRevitFamily}
                  disabled={!project.mesh_url || generating}
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Revit Family...
                    </>
                  ) : (
                    <>
                      <FileBox className="w-5 h-5 mr-2" />
                      Generate Revit Family
                    </>
                  )}
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
