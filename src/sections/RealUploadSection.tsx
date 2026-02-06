import { useState } from 'react';
import { Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase, type Project } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

interface RealUploadSectionProps {
  onProjectCreated: (project: Project) => void;
}

export default function RealUploadSection({ onProjectCreated }: RealUploadSectionProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');
  const [category, setCategory] = useState('chair');
  const [provider, setProvider] = useState('instantmesh');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);

      if (!projectName) {
        setProjectName(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('project-images')
        .getPublicUrl(filePath);

      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: projectName || 'Untitled Project',
          image_url: publicUrl,
          furniture_category: category,
          status: 'pending',
        })
        .select()
        .single();

      if (projectError) throw projectError;

      const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-image-to-3d`;

      const processResponse = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          projectId: projectData.id,
          imageUrl: publicUrl,
          category: category,
          provider: provider,
        }),
      });

      if (!processResponse.ok) {
        throw new Error('Failed to start processing');
      }

      setSuccess(true);
      onProjectCreated(projectData);

      setTimeout(() => {
        setFile(null);
        setPreview(null);
        setProjectName('');
        setSuccess(false);
      }, 2000);

    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload and process image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] to-[#111]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Upload Your Furniture Image
          </h2>
          <p className="text-gray-400 text-lg">
            Upload an image and we'll generate a custom Revit family using AI
          </p>
        </div>

        <Card className="p-8 bg-[#1a1a1a] border-gray-800">
          <div className="space-y-6">
            <div>
              <Label htmlFor="project-name" className="text-white mb-2 block">
                Project Name
              </Label>
              <Input
                id="project-name"
                type="text"
                placeholder="My Chair Design"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="bg-[#0a0a0a] border-gray-700 text-white"
              />
            </div>

            <div>
              <Label htmlFor="category" className="text-white mb-2 block">
                Furniture Category
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-[#0a0a0a] border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chair">Chair</SelectItem>
                  <SelectItem value="table">Table</SelectItem>
                  <SelectItem value="desk">Desk</SelectItem>
                  <SelectItem value="cabinet">Cabinet</SelectItem>
                  <SelectItem value="sofa">Sofa</SelectItem>
                  <SelectItem value="bed">Bed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="provider" className="text-white mb-2 block">
                3D Reconstruction Model
              </Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger className="bg-[#0a0a0a] border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instantmesh">InstantMesh (Recommended - Fast & Quality)</SelectItem>
                  <SelectItem value="trellis2">TRELLIS-2 (Latest - Microsoft)</SelectItem>
                  <SelectItem value="triposr">TripoSR (Very Fast - Stability AI)</SelectItem>
                  <SelectItem value="wonder3d">Wonder3D (Highest Detail - Slower)</SelectItem>
                  <SelectItem value="meshy">Meshy.ai (Commercial)</SelectItem>
                  <SelectItem value="tripo3d">Tripo3D (Commercial)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-gray-500 text-xs mt-1">
                Free models work in demo mode without API keys
              </p>
            </div>

            <div>
              <Label className="text-white mb-2 block">
                Furniture Image
              </Label>
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-gray-600 transition-colors">
                {preview ? (
                  <div className="space-y-4">
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-h-64 mx-auto rounded-lg"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFile(null);
                        setPreview(null);
                      }}
                      className="bg-[#0a0a0a] border-gray-700"
                    >
                      Change Image
                    </Button>
                  </div>
                ) : (
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                    <p className="text-gray-400 mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-gray-600 text-sm">
                      PNG, JPG, or WebP (max 10MB)
                    </p>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-4 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 text-green-500 bg-green-500/10 p-4 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
                <span>Upload successful! Processing started...</span>
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              size="lg"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Upload & Generate 3D Model
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}
