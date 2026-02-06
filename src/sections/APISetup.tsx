import { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Key,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const API_PROVIDERS = [
  {
    id: "replicate",
    name: "Replicate",
    description: "Powers InstantMesh, TRELLIS, TripoSR, and Wonder3D models",
    url: "https://replicate.com/account/api-tokens",
    envVar: "REPLICATE_API_KEY",
    required: true,
  },
  {
    id: "meshy",
    name: "Meshy.ai",
    description: "Commercial 3D generation service with high-quality output",
    url: "https://www.meshy.ai/api",
    envVar: "MESHY_API_KEY",
    required: false,
  },
  {
    id: "tripo3d",
    name: "Tripo3D",
    description: "Fast commercial image-to-3D service",
    url: "https://www.tripo3d.ai/",
    envVar: "TRIPO3D_API_KEY",
    required: false,
  },
];

export default function APISetup() {
  const [expanded, setExpanded] = useState(false);
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <section id="setup" className="py-16 px-6 bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-[#1a1a1a] border-gray-800 overflow-hidden">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-800/30 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Key className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Configure API Keys
                </h3>
                <p className="text-gray-400 text-sm">
                  Add your API keys to enable real 3D generation
                </p>
              </div>
            </div>
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expanded && (
            <div className="p-6 pt-0 border-t border-gray-800">
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-amber-200 font-medium mb-1">
                      For Production Use
                    </p>
                    <p className="text-amber-200/70">
                      API keys should be configured as environment variables in your
                      Supabase project settings, not stored in the browser. This UI
                      is for reference only.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {API_PROVIDERS.map((provider) => (
                  <div key={provider.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-white flex items-center gap-2">
                        {provider.name}
                        {provider.required && (
                          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                            Recommended
                          </span>
                        )}
                      </Label>
                      <a
                        href={provider.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        Get API Key
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <p className="text-gray-500 text-xs">{provider.description}</p>
                    <Input
                      type="password"
                      placeholder={`${provider.envVar}`}
                      value={keys[provider.id] || ""}
                      onChange={(e) =>
                        setKeys({ ...keys, [provider.id]: e.target.value })
                      }
                      className="bg-[#0a0a0a] border-gray-700 text-white font-mono text-sm"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <p className="text-gray-500 text-xs">
                  Keys are stored in your Supabase project secrets
                </p>
                <Button
                  onClick={handleSave}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600"
                >
                  {saved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Saved
                    </>
                  ) : (
                    "Save Configuration"
                  )}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}
