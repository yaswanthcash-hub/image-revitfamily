import { useEffect, useState } from 'react'
import { Check, AlertCircle, Box, Ruler, Building2, Construction, Fan, Zap, Droplets } from 'lucide-react'
import type { RevitFamilyCategory, Discipline } from '../data/revit-categories'

interface AnalysisPreviewProps {
  imageUrl: string
  category: RevitFamilyCategory
}

const disciplineIcons: Record<Discipline, React.ReactNode> = {
  architectural: <Building2 size={16} />,
  structural: <Construction size={16} />,
  mechanical: <Fan size={16} />,
  electrical: <Zap size={16} />,
  plumbing: <Droplets size={16} />,
}

const AnalysisPreview = ({ imageUrl, category }: AnalysisPreviewProps) => {
  const [showComponents, setShowComponents] = useState(false)
  const [componentConfidences, setComponentConfidences] = useState<Record<string, number>>({})

  useEffect(() => {
    setShowComponents(false)
    setComponentConfidences({})

    const timer = setTimeout(() => {
      setShowComponents(true)
      const confidences: Record<string, number> = {}
      category.components.forEach((comp, index) => {
        setTimeout(() => {
          const baseConfidence = 85 + Math.random() * 14
          confidences[comp.name] = Math.round(baseConfidence)
          setComponentConfidences({ ...confidences })
        }, index * 150)
      })
    }, 300)

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
            Analyzing {category.name} structure to extract parametric components
            for your Revit family.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="scroll-animate space-y-6">
            <div className="relative rounded-lg overflow-hidden border border-[#515151] bg-[#111]">
              <img src={imageUrl} alt={`Analyzed ${category.name}`} className="w-full h-auto" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[#1a1b1f] border border-[#515151] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#dc5f00]/10 rounded-lg flex items-center justify-center">
                    <Box className="text-[#dc5f00]" size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-[#666]">Template</p>
                    <p className="text-sm font-medium">{category.suggestedTemplate}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-[#1a1b1f] border border-[#515151] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#dc5f00]/10 rounded-lg flex items-center justify-center text-[#dc5f00]">
                    {disciplineIcons[category.discipline]}
                  </div>
                  <div>
                    <p className="text-xs text-[#666]">Discipline</p>
                    <p className="text-sm font-medium capitalize">{category.discipline}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#1a1b1f] border border-[#515151] rounded-lg">
              <p className="text-xs text-[#666] mb-3">BIM Classification</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-[#666]">Revit Category:</span>
                  <span className="ml-2 font-medium">{category.revitCategory}</span>
                </div>
                <div>
                  <span className="text-[#666]">IFC Entity:</span>
                  <span className="ml-2 font-mono text-xs bg-[#515151]/30 px-1.5 py-0.5 rounded">{category.ifcEntity}</span>
                </div>
                <div>
                  <span className="text-[#666]">OmniClass:</span>
                  <span className="ml-2 font-mono text-xs">{category.omniClass}</span>
                </div>
                <div>
                  <span className="text-[#666]">Uniclass:</span>
                  <span className="ml-2 font-mono text-xs">{category.uniclass}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="scroll-animate space-y-6">
            <h3 className="text-xl font-medium">Detected Components</h3>

            <div className="space-y-3">
              {category.components.map((comp, index) => {
                const confidence = componentConfidences[comp.name] || 0
                const detected = confidence > 0
                return (
                  <div
                    key={comp.name}
                    className="p-4 bg-[#1a1b1f] border border-[#515151] rounded-lg flex items-center justify-between"
                    style={{
                      opacity: showComponents ? 1 : 0,
                      transform: showComponents ? 'translateY(0)' : 'translateY(10px)',
                      transition: `all 0.3s ease ${index * 80}ms`
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        detected ? 'bg-green-500/20' : 'bg-[#515151]/30'
                      }`}>
                        {detected ? (
                          <Check size={16} className="text-green-500" />
                        ) : (
                          <AlertCircle size={16} className="text-[#666]" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{comp.name}</p>
                        <p className="text-xs text-[#666]">
                          {detected ? `Confidence: ${confidence}%` : 'Analyzing...'}
                        </p>
                      </div>
                    </div>
                    <div className="w-20 h-2 bg-[#515151]/30 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          confidence >= 95 ? 'bg-green-500' :
                          confidence >= 90 ? 'bg-[#dc5f00]' : 'bg-yellow-500'
                        }`}
                        style={{
                          width: `${confidence}%`,
                          transitionDelay: `${index * 80}ms`
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

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
                  </div>
                ))}
              </div>
            </div>

            {category.hostBased && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-yellow-500">
                  This is a host-based family. It requires a wall, floor, or ceiling to be placed.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default AnalysisPreview
