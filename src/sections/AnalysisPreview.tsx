import { useEffect, useState } from 'react'
import { Check, AlertCircle, Box, Ruler } from 'lucide-react'

interface AnalysisPreviewProps {
  imageUrl: string
}

interface Detection {
  id: string
  label: string
  confidence: number
  x: number
  y: number
  width: number
  height: number
}

const AnalysisPreview = ({ imageUrl }: AnalysisPreviewProps) => {
  const [detections, setDetections] = useState<Detection[]>([])
  const [showDetections, setShowDetections] = useState(false)

  useEffect(() => {
    // Simulate detection results appearing
    const mockDetections: Detection[] = [
      { id: '1', label: 'Seat', confidence: 98, x: 25, y: 45, width: 50, height: 25 },
      { id: '2', label: 'Backrest', confidence: 96, x: 25, y: 15, width: 50, height: 35 },
      { id: '3', label: 'Armrests', confidence: 94, x: 10, y: 35, width: 80, height: 15 },
      { id: '4', label: 'Base', confidence: 97, x: 35, y: 70, width: 30, height: 25 },
      { id: '5', label: 'Casters', confidence: 92, x: 20, y: 90, width: 60, height: 8 },
    ]

    setTimeout(() => {
      setShowDetections(true)
      mockDetections.forEach((det, index) => {
        setTimeout(() => {
          setDetections(prev => [...prev, det])
        }, index * 200)
      })
    }, 500)
  }, [])

  const components = [
    { name: 'Seat', confidence: 98, detected: true },
    { name: 'Backrest', confidence: 96, detected: true },
    { name: 'Armrests', confidence: 94, detected: true },
    { name: 'Base/Legs', confidence: 97, detected: true },
    { name: 'Casters', confidence: 92, detected: true },
  ]

  return (
    <section className="py-24 bg-[#0a0a0a]">
      <div className="max-w-[1280px] mx-auto px-5">
        {/* Section Header */}
        <div className="text-center mb-16 scroll-animate">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            AI-Powered <span className="text-[#dc5f00]">Component Detection</span>
          </h2>
          <p className="text-[#a3a1a1] max-w-2xl mx-auto">
            Our computer vision models automatically identify furniture components 
            with high accuracy.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image with Detections */}
          <div className="scroll-animate relative">
            <div className="relative rounded-lg overflow-hidden border border-[#515151]">
              <img
                src={imageUrl}
                alt="Analyzed chair"
                className="w-full h-auto"
              />
              
              {/* Detection Overlays */}
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

              {/* Scanning Line Animation */}
              {!showDetections && (
                <div className="absolute inset-0 overflow-hidden">
                  <div 
                    className="absolute left-0 right-0 h-[2px] bg-[#dc5f00] shadow-[0_0_10px_#dc5f00]"
                    style={{
                      animation: 'scan 2s linear infinite'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Template Suggestion */}
            <div className="mt-6 p-4 bg-[#1a1b1f] border border-[#515151] rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#dc5f00]/10 rounded-lg flex items-center justify-center">
                  <Box className="text-[#dc5f00]" size={20} />
                </div>
                <div>
                  <p className="text-sm text-[#a3a1a1]">Suggested Template</p>
                  <p className="font-medium">Task Chair - 5 Star Base</p>
                </div>
              </div>
            </div>
          </div>

          {/* Detection Results */}
          <div className="scroll-animate space-y-6">
            <h3 className="text-xl font-medium mb-6">Detected Components</h3>
            
            <div className="space-y-4">
              {components.map((comp, index) => (
                <div
                  key={comp.name}
                  className="p-4 bg-[#1a1b1f] border border-[#515151] rounded-lg flex items-center justify-between"
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    opacity: showDetections ? 1 : 0,
                    transform: showDetections ? 'translateY(0)' : 'translateY(10px)',
                    transition: 'all 0.3s ease'
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
                      </p>
                    </div>
                  </div>
                  
                  {/* Confidence Bar */}
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

            {/* Dimension Estimates */}
            <div className="mt-8 p-6 bg-[#1a1b1f] border border-[#515151] rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <Ruler className="text-[#dc5f00]" size={20} />
                <h4 className="font-medium">Estimated Dimensions</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-[#111] rounded-lg">
                  <p className="text-sm text-[#666]">Overall Height</p>
                  <p className="text-lg font-medium">33"</p>
                </div>
                <div className="p-3 bg-[#111] rounded-lg">
                  <p className="text-sm text-[#666]">Overall Width</p>
                  <p className="text-lg font-medium">24"</p>
                </div>
                <div className="p-3 bg-[#111] rounded-lg">
                  <p className="text-sm text-[#666]">Seat Height</p>
                  <p className="text-lg font-medium">18"</p>
                </div>
                <div className="p-3 bg-[#111] rounded-lg">
                  <p className="text-sm text-[#666]">Depth</p>
                  <p className="text-lg font-medium">24"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AnalysisPreview
