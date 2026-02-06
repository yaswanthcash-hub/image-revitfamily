import { useEffect, useState } from 'react'
import { Check, AlertCircle, Box, Ruler } from 'lucide-react'
import type { FurnitureCategory, ComponentDetection } from '../data/furniture-categories'

interface AnalysisPreviewProps {
  imageUrl: string
  category: FurnitureCategory
}

const AnalysisPreview = ({ imageUrl, category }: AnalysisPreviewProps) => {
  const [detections, setDetections] = useState<ComponentDetection[]>([])
  const [showDetections, setShowDetections] = useState(false)

  useEffect(() => {
    setDetections([])
    setShowDetections(false)

    const timer = setTimeout(() => {
      setShowDetections(true)
      category.detections.forEach((det, index) => {
        setTimeout(() => {
          setDetections(prev => [...prev, det])
        }, index * 200)
      })
    }, 500)

    return () => clearTimeout(timer)
  }, [category])

  return (
    <section className="py-24 bg-[#0a0a0a]">
      <div className="max-w-[1280px] mx-auto px-5">
        <div className="text-center mb-16 scroll-animate">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            AI-Powered <span className="text-[#dc5f00]">Component Detection</span>
          </h2>
          <p className="text-[#a3a1a1] max-w-2xl mx-auto">
            Detected {category.components.filter(c => c.detected).length} components
            for your {category.name} with high accuracy.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="scroll-animate relative">
            <div className="relative rounded-lg overflow-hidden border border-[#515151]">
              <img src={imageUrl} alt={`Analyzed ${category.name}`} className="w-full h-auto" />

              {showDetections && detections.map((det) => (
                <div
                  key={det.id}
                  className="absolute border-2 border-[#dc5f00] bg-[#dc5f00]/10 animate-fade-in-up"
                  style={{
                    left: `${det.x}%`,
                    top: `${det.y}%`,
                    width: `${det.width}%`,
                    height: `${det.height}%`,
                  }}
                >
                  <span className="absolute -top-6 left-0 bg-[#dc5f00] text-white text-xs px-2 py-1 font-medium whitespace-nowrap">
                    {det.label} ({det.confidence}%)
                  </span>
                </div>
              ))}

              {!showDetections && (
                <div className="absolute inset-0 overflow-hidden">
                  <div
                    className="absolute left-0 right-0 h-[2px] bg-[#dc5f00] shadow-[0_0_10px_#dc5f00]"
                    style={{ animation: 'scan 2s linear infinite' }}
                  />
                </div>
              )}
            </div>

            <div className="mt-6 p-4 bg-[#1a1b1f] border border-[#515151] rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#dc5f00]/10 rounded-lg flex items-center justify-center">
                  <Box className="text-[#dc5f00]" size={20} />
                </div>
                <div>
                  <p className="text-sm text-[#a3a1a1]">Suggested Template</p>
                  <p className="font-medium">{category.suggestedTemplate}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="scroll-animate space-y-6">
            <h3 className="text-xl font-medium mb-6">Detected Components</h3>

            <div className="space-y-4">
              {category.components.map((comp, index) => (
                <div
                  key={comp.name}
                  className="p-4 bg-[#1a1b1f] border border-[#515151] rounded-lg flex items-center justify-between"
                  style={{
                    opacity: showDetections ? 1 : 0,
                    transform: showDetections ? 'translateY(0)' : 'translateY(10px)',
                    transition: `all 0.3s ease ${index * 100}ms`
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      comp.detected ? 'bg-green-500/20' : 'bg-[#515151]/30'
                    }`}>
                      {comp.detected ? (
                        <Check size={16} className="text-green-500" />
                      ) : (
                        <AlertCircle size={16} className="text-[#666]" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{comp.name}</p>
                      <p className="text-sm text-[#666]">
                        Confidence: {comp.confidence}%
                        {!comp.detected && ' (not detected)'}
                      </p>
                    </div>
                  </div>
                  <div className="w-24 h-2 bg-[#515151]/30 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        comp.confidence >= 95 ? 'bg-green-500' :
                        comp.confidence >= 90 ? 'bg-[#dc5f00]' : 'bg-yellow-500'
                      }`}
                      style={{
                        width: showDetections ? `${comp.confidence}%` : '0%',
                        transitionDelay: `${index * 100}ms`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-[#1a1b1f] border border-[#515151] rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <Ruler className="text-[#dc5f00]" size={20} />
                <h4 className="font-medium">Estimated Dimensions</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {category.dimensions.slice(0, 4).map(dim => (
                  <div key={dim.key} className="p-3 bg-[#111] rounded-lg">
                    <p className="text-sm text-[#666]">{dim.label}</p>
                    <p className="text-lg font-medium">{dim.default}{dim.unit}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AnalysisPreview
