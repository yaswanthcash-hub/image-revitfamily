import { useEffect, useState } from 'react'
import { Check, AlertCircle, Box, Ruler, Layers, Eye, EyeOff } from 'lucide-react'
import type { FurnitureCategory, ComponentDetection } from '../data/furniture-categories'

interface AnalysisPreviewProps {
  imageUrl: string
  category: FurnitureCategory
}

const AnalysisPreview = ({ imageUrl, category }: AnalysisPreviewProps) => {
  const [detections, setDetections] = useState<ComponentDetection[]>([])
  const [showDetections, setShowDetections] = useState(false)
  const [showOverlays, setShowOverlays] = useState(true)
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const [overallConfidence, setOverallConfidence] = useState(0)

  useEffect(() => {
    setDetections([])
    setShowDetections(false)

    setTimeout(() => {
      setShowDetections(true)
      category.detections.forEach((det, index) => {
        setTimeout(() => {
          setDetections(prev => [...prev, det])
        }, index * 180)
      })
    }, 400)

    const detectedComponents = category.components.filter(c => c.detected)
    const avg = Math.round(
      detectedComponents.reduce((sum, c) => sum + c.confidence, 0) / detectedComponents.length
    )
    setTimeout(() => setOverallConfidence(avg), 800)
  }, [category])

  const detectedComponents = category.components.filter(c => c.detected)
  const undetectedComponents = category.components.filter(c => !c.detected)

  return (
    <section className="py-24 bg-[#0a0a0a]">
      <div className="max-w-[1280px] mx-auto px-5">
        <div className="text-center mb-16 scroll-animate">
          <div className="inline-flex items-center gap-2 text-[#dc5f00] text-sm uppercase tracking-widest font-medium mb-4">
            <Eye size={16} />
            <span>Step 3 of 6</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            AI-Powered <span className="text-[#dc5f00]">Component Detection</span>
          </h2>
          <p className="text-[#a3a1a1] max-w-2xl mx-auto">
            {detectedComponents.length} of {category.components.length} components detected
            with {overallConfidence}% average confidence for {category.name}.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="scroll-animate relative">
            <div className="relative rounded-lg overflow-hidden border border-[#515151]">
              <img
                src={imageUrl}
                alt={`Analyzed ${category.name}`}
                className="w-full h-auto"
              />

              {showDetections && showOverlays && detections.map((det) => {
                const isSelected = selectedComponent === det.label
                return (
                  <div
                    key={det.id}
                    className={`absolute border-2 transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? 'border-[#dc5f00] bg-[#dc5f00]/20 z-10'
                        : 'border-[#dc5f00]/60 bg-[#dc5f00]/10 hover:border-[#dc5f00] hover:bg-[#dc5f00]/15'
                    }`}
                    style={{
                      left: `${det.x}%`,
                      top: `${det.y}%`,
                      width: `${det.width}%`,
                      height: `${det.height}%`,
                    }}
                    onClick={() => setSelectedComponent(isSelected ? null : det.label)}
                  >
                    <span className={`absolute -top-6 left-0 text-white text-xs px-2 py-0.5 font-medium whitespace-nowrap rounded-sm ${
                      isSelected ? 'bg-[#dc5f00]' : 'bg-[#dc5f00]/80'
                    }`}>
                      {det.label} ({det.confidence}%)
                    </span>
                  </div>
                )
              })}

              {!showDetections && (
                <div className="absolute inset-0 overflow-hidden">
                  <div
                    className="absolute left-0 right-0 h-[2px] bg-[#dc5f00] shadow-[0_0_10px_#dc5f00]"
                    style={{ animation: 'scan 2s linear infinite' }}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setShowOverlays(!showOverlays)}
                className="flex items-center gap-2 text-sm text-[#a3a1a1] hover:text-white transition-colors"
              >
                {showOverlays ? <EyeOff size={16} /> : <Eye size={16} />}
                {showOverlays ? 'Hide overlays' : 'Show overlays'}
              </button>
              <span className="text-xs text-[#515151]">Click a detection to inspect</span>
            </div>

            <div className="mt-6 p-4 bg-[#1a1b1f] border border-[#515151] rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#dc5f00]/10 rounded-lg flex items-center justify-center">
                  <Box className="text-[#dc5f00]" size={20} />
                </div>
                <div>
                  <p className="text-sm text-[#a3a1a1]">Matched Template</p>
                  <p className="font-medium">{category.suggestedTemplate}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-sm text-[#a3a1a1]">Category</p>
                  <p className="text-sm font-medium text-[#dc5f00]">{category.revitCategory}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="scroll-animate space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-medium">Detected Components</h3>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm text-[#a3a1a1]">
                  {detectedComponents.length}/{category.components.length}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {detectedComponents.map((comp, index) => (
                <div
                  key={comp.name}
                  className={`p-4 rounded-lg flex items-center justify-between transition-all duration-300 cursor-pointer ${
                    selectedComponent === comp.name
                      ? 'bg-[#dc5f00]/10 border border-[#dc5f00]/40'
                      : 'bg-[#1a1b1f] border border-[#515151] hover:border-[#dc5f00]/30'
                  }`}
                  style={{
                    opacity: showDetections ? 1 : 0,
                    transform: showDetections ? 'translateY(0)' : 'translateY(10px)',
                    transition: `all 0.3s ease ${index * 80}ms`,
                  }}
                  onClick={() => setSelectedComponent(selectedComponent === comp.name ? null : comp.name)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      comp.confidence >= 95 ? 'bg-green-500/20' : comp.confidence >= 90 ? 'bg-[#dc5f00]/20' : 'bg-yellow-500/20'
                    }`}>
                      <Check size={14} className={
                        comp.confidence >= 95 ? 'text-green-500' : comp.confidence >= 90 ? 'text-[#dc5f00]' : 'text-yellow-500'
                      } />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{comp.name}</p>
                      <p className="text-xs text-[#666]">Confidence: {comp.confidence}%</p>
                    </div>
                  </div>

                  <div className="w-20 h-1.5 bg-[#515151]/30 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        comp.confidence >= 95 ? 'bg-green-500' :
                        comp.confidence >= 90 ? 'bg-[#dc5f00]' : 'bg-yellow-500'
                      }`}
                      style={{
                        width: showDetections ? `${comp.confidence}%` : '0%',
                        transitionDelay: `${index * 80}ms`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {undetectedComponents.length > 0 && (
              <div className="p-4 bg-[#1a1b1f] border border-[#515151]/50 rounded-lg">
                <p className="text-xs text-[#666] mb-2">Not detected (may require manual input):</p>
                <div className="flex flex-wrap gap-2">
                  {undetectedComponents.map(comp => (
                    <span key={comp.name} className="text-xs bg-[#111] border border-[#515151] px-2 py-1 rounded text-[#515151]">
                      {comp.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="p-6 bg-[#1a1b1f] border border-[#515151] rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <Ruler className="text-[#dc5f00]" size={20} />
                <h4 className="font-medium">Estimated Dimensions</h4>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {category.dimensions.slice(0, 6).map(dim => (
                  <div key={dim.key} className="p-3 bg-[#111] rounded-lg">
                    <p className="text-xs text-[#666]">{dim.label}</p>
                    <p className="text-lg font-medium">{dim.default}{dim.unit}</p>
                    <p className="text-[10px] text-[#515151]">Range: {dim.min}-{dim.max}{dim.unit}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-[#1a1b1f] border border-[#515151] rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Layers className="text-[#dc5f00]" size={18} />
                <h4 className="text-sm font-medium">Subcategories</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {category.subcategories.map(sub => (
                  <span key={sub} className="text-xs bg-[#dc5f00]/10 text-[#dc5f00] px-2.5 py-1 rounded-full">
                    {sub}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-[#dc5f00]/10 border border-[#dc5f00]/30 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-[#dc5f00] mt-0.5 flex-shrink-0" />
                <p className="text-xs text-[#a3a1a1]">
                  Overall confidence: <span className="text-[#dc5f00] font-medium">{overallConfidence}%</span>.
                  Dimensions are estimated from image analysis. Verify and adjust in the parameter editor
                  for production accuracy. Manual dimension input achieves 100%.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AnalysisPreview
