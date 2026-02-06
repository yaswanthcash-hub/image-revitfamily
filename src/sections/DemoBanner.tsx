import { Info, ExternalLink } from "lucide-react";

export default function DemoBanner() {
  return (
    <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-amber-500/20">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-center gap-3 text-sm">
          <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span className="text-amber-200">
            Running in <strong>Demo Mode</strong> - 3D models use sample data.
          </span>
          <a
            href="#setup"
            className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 underline underline-offset-2"
          >
            Add API keys for real processing
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
