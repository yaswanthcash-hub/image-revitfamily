import { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

interface SampleImagesProps {
  onSelectSample: (imageUrl: string, name: string, category: string) => void;
}

const SAMPLE_FURNITURE = [
  {
    id: 1,
    name: "Modern Office Chair",
    category: "chair",
    imageUrl: "https://images.pexels.com/photos/1957478/pexels-photo-1957478.jpeg?auto=compress&cs=tinysrgb&w=600",
    description: "Ergonomic office chair with mesh back",
  },
  {
    id: 2,
    name: "Wooden Dining Table",
    category: "table",
    imageUrl: "https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=600",
    description: "Solid wood dining table",
  },
  {
    id: 3,
    name: "Minimalist Desk",
    category: "desk",
    imageUrl: "https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg?auto=compress&cs=tinysrgb&w=600",
    description: "Clean modern workspace desk",
  },
  {
    id: 4,
    name: "Leather Sofa",
    category: "sofa",
    imageUrl: "https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg?auto=compress&cs=tinysrgb&w=600",
    description: "Contemporary leather sectional",
  },
  {
    id: 5,
    name: "Accent Chair",
    category: "chair",
    imageUrl: "https://images.pexels.com/photos/1148955/pexels-photo-1148955.jpeg?auto=compress&cs=tinysrgb&w=600",
    description: "Mid-century modern accent chair",
  },
  {
    id: 6,
    name: "Storage Cabinet",
    category: "cabinet",
    imageUrl: "https://images.pexels.com/photos/2062431/pexels-photo-2062431.jpeg?auto=compress&cs=tinysrgb&w=600",
    description: "Modern storage solution",
  },
];

export default function SampleImages({ onSelectSample }: SampleImagesProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <section className="py-16 px-6 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 text-sm font-medium">Quick Start</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">
            Try with Sample Furniture
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Don't have an image ready? Click any sample below to instantly test the AI pipeline
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {SAMPLE_FURNITURE.map((item) => (
            <Card
              key={item.id}
              className="relative overflow-hidden bg-[#1a1a1a] border-gray-800 hover:border-blue-500/50 transition-all cursor-pointer group"
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onSelectSample(item.imageUrl, item.name, item.category)}
            >
              <div className="aspect-square relative">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity ${hoveredId === item.id ? 'opacity-100' : 'opacity-60'}`} />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white text-sm font-medium truncate">{item.name}</p>
                  <p className="text-gray-400 text-xs capitalize">{item.category}</p>
                </div>
                {hoveredId === item.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Use This
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
