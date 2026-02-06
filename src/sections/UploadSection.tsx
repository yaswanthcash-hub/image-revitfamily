import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, FileImage, X, Check, Loader2, Building2, Construction, Fan, Zap, Droplets, Cpu, ChevronDown, Sparkles } from 'lucide-react'
import { disciplines, getCategoriesByDiscipline, type RevitFamilyCategory, type Discipline } from '../data/revit-categories'
import { detectObjects, initializeDetector, getModelStatus, type DetectionResult, type DetectionBox } from '../lib/ai-detector'

interface UploadSectionProps {
  onImageUpload: (url: string) => void
  onAnalysisComplete: () => void
  onCategoryDetected: (category: RevitFamilyCategory) => void
}

const disciplineIcons: Record<Discipline, React.ReactNode> = {
  architectural: <Building2 size={20} />,
  structural: <Construction size={20} />,
  mechanical: <Fan size={20} />,
  electrical: <Zap size={20} />,
  plumbing: <Droplets size={20} />,
}

const analysisSteps = [
  'Loading AI model',
  'Preprocessing image',
  'Running object detection',
  'Classifying components',
  'Extracting dimensions',
]

const UploadSection = ({ onImageUpload, onAnalysisComplete, onCategoryDetected }: UploadSectionProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadDone, setUploadDone] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<RevitFamilyCategory | null>(null)
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [modelProgress, setModelProgress] = useState(0)
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const [expandedDiscipline, setExpandedDiscipline] = useState<Discipline | null>(null)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') return
    if (file.size > 10 * 1024 * 1024) return

    setUploadedFile(file)
    let progress = 0
    const interval = setInterval(() => {
      progress += 12
      if (progress > 100) progress = 100
      setUploadProgress(progress)
      if (progress >= 100) {
        clearInterval(interval)
        const url = URL.createObjectURL(file)
        setImageUrl(url)
        onImageUpload(url)
        setUploadDone(true)
      }
    }, 80)
  }

  useEffect(() => {
    if (uploadDone && imageUrl && !isDetecting && !detectionResult) {
      runDetection(imageUrl)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadDone, imageUrl])

  const runDetection = async (url: string) => {
    setIsDetecting(true)
    setCurrentStep(0)

    const status = getModelStatus()
    if (!status.loaded) {
      await initializeDetector((progress) => {
        setModelProgress(progress)
      })
    }
    setCurrentStep(1)
    await new Promise(r => setTimeout(r, 200))
    setCurrentStep(2)

    const result = await detectObjects(url)
    setCurrentStep(3)
    await new Promise(r => setTimeout(r, 300))
    setCurrentStep(4)
    await new Promise(r => setTimeout(r, 200))

    setDetectionResult(result)

    if (result.category) {
      setSelectedCategory(result.category)
      onCategoryDetected(result.category)
    }

    setIsDetecting(false)
    setAnalysisComplete(true)
    onAnalysisComplete()
  }

  const handleCategoryOverride = (category: RevitFamilyCategory) => {
    setSelectedCategory(category)
    onCategoryDetected(category)
    setShowCategoryPicker(false)
    if (!analysisComplete) {
      setAnalysisComplete(true)
      onAnalysisComplete()
    }
  }

  const clearFile = () => {
    setUploadedFile(null)
    setUploadProgress(0)
    setUploadDone(false)
    setImageUrl(null)
    setSelectedCategory(null)
    setDetectionResult(null)
    setIsDetecting(false)
    setCurrentStep(0)
    setAnalysisComplete(false)
    setShowCategoryPicker(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const renderDetectionBoxes = (detections: DetectionBox[]) => (
    <>
      {detections.slice(0, 5).map((det, i) => {
        const { xmin, ymin, xmax, ymax } = det.box
        return (
          <div
            key={i}
            className="absolute border-2 border-[#dc5f00] pointer-events-none"
            style={{
              left: `${xmin * 100}%`,
              top: `${ymin * 100}%`,
              width: `${(xmax - xmin) * 100}%`,
              height: `${(ymax - ymin) * 100}%`,
            }}
          >
            <span className="absolute -top-5 left-0 text-[10px] bg-[#dc5f00] text-white px-1.5 py-0.5 rounded whitespace-nowrap">
              {det.label} ({Math.round(det.score * 100)}%)
            </span>
          </div>
        )
      })}
    </>
  )

  return (
    <section id="upload" className="py-24 bg-[#111]">
      <div className="max-w-[1280px] mx-auto px-5">
        <div className="text-center mb-16 scroll-animate">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            Upload Your <span className="text-[#dc5f00]">Component Image</span>
          </h2>
          <p className="text-[#a3a1a1] max-w-2xl mx-auto">
            Upload a photo of any building component. Our AI will detect what it is and extract parameters for your Revit family.
          </p>
        </div>

        <div className="scroll-animate max-w-4xl mx-auto">
          {!uploadedFile ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-300 ${
                isDragging
                  ? 'border-[#dc5f00] bg-[#dc5f00]/5'
                  : 'border-[#515151] hover:border-[#dc5f00]/50 hover:bg-[#1a1b1f]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
                className="hidden"
              />
              <div className="w-20 h-20 bg-[#dc5f00]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="text-[#dc5f00]" size={32} />
              </div>
              <h3 className="text-xl font-medium mb-3">Drop your image here</h3>
              <p className="text-[#a3a1a1] mb-2">or click to browse</p>
              <p className="text-sm text-[#666]">Supports: JPG, PNG, PDF (max 10MB)</p>
              <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs text-[#666]">
                <span className="px-2 py-1 bg-[#1a1b1f] rounded">Doors</span>
                <span className="px-2 py-1 bg-[#1a1b1f] rounded">Windows</span>
                <span className="px-2 py-1 bg-[#1a1b1f] rounded">Furniture</span>
                <span className="px-2 py-1 bg-[#1a1b1f] rounded">Lighting</span>
                <span className="px-2 py-1 bg-[#1a1b1f] rounded">Plumbing</span>
                <span className="px-2 py-1 bg-[#1a1b1f] rounded">HVAC</span>
                <span className="px-2 py-1 bg-[#1a1b1f] rounded">Structural</span>
              </div>
            </div>
          ) : !uploadDone ? (
            <div className="border border-[#515151] rounded-lg p-8 bg-[#1a1b1f]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#dc5f00]/10 rounded-lg flex items-center justify-center">
                    <FileImage className="text-[#dc5f00]" size={24} />
                  </div>
                  <div>
                    <p className="font-medium">{uploadedFile.name}</p>
                    <p className="text-sm text-[#666]">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button onClick={clearFile} className="p-2 hover:bg-[#515151]/30 rounded-lg transition-colors">
                  <X size={20} className="text-[#666]" />
                </button>
              </div>
              <div className="h-2 bg-[#515151]/30 rounded-full overflow-hidden">
                <div className="h-full bg-[#dc5f00] transition-all duration-100" style={{ width: `${uploadProgress}%` }} />
              </div>
              <p className="text-sm text-[#a3a1a1] mt-2 text-center">Uploading... {uploadProgress}%</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden border border-[#515151] bg-[#0a0a0a]">
                  {imageUrl && (
                    <div className="relative">
                      <img
                        src={imageUrl}
                        alt="Uploaded"
                        className="w-full h-auto max-h-[400px] object-contain"
                      />
                      {detectionResult && !isDetecting && renderDetectionBoxes(detectionResult.detections)}
                      {isDetecting && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="text-center">
                            <Cpu className="w-12 h-12 text-[#dc5f00] mx-auto mb-3 animate-pulse" />
                            <p className="text-sm text-white">Analyzing image...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#666]">{uploadedFile.name}</span>
                  <button onClick={clearFile} className="text-[#666] hover:text-[#dc5f00] transition-colors">
                    Upload different image
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {isDetecting ? (
                  <div className="p-6 bg-[#1a1b1f] border border-[#515151] rounded-lg">
                    <div className="flex items-center gap-3 mb-6">
                      <Loader2 className="text-[#dc5f00] animate-spin" size={20} />
                      <span className="font-medium">{analysisSteps[currentStep]}</span>
                    </div>
                    {currentStep === 0 && modelProgress > 0 && modelProgress < 100 && (
                      <div className="mb-4">
                        <div className="h-2 bg-[#515151]/30 rounded-full overflow-hidden">
                          <div className="h-full bg-[#dc5f00] transition-all" style={{ width: `${modelProgress}%` }} />
                        </div>
                        <p className="text-xs text-[#666] mt-1">Downloading model: {Math.round(modelProgress)}%</p>
                      </div>
                    )}
                    <div className="space-y-2">
                      {analysisSteps.map((step, i) => (
                        <div key={step} className={`flex items-center gap-3 text-sm ${i <= currentStep ? 'text-white' : 'text-[#666]'}`}>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                            i < currentStep ? 'bg-green-500' : i === currentStep ? 'bg-[#dc5f00]' : 'bg-[#515151]'
                          }`}>
                            {i < currentStep ? <Check size={12} /> : <span className="text-[10px]">{i + 1}</span>}
                          </div>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : detectionResult ? (
                  <div className="space-y-4">
                    <div className="p-5 bg-[#1a1b1f] border border-[#515151] rounded-lg">
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="text-[#dc5f00]" size={18} />
                        <span className="font-medium">AI Detection Result</span>
                        {detectionResult.inferenceTime > 0 && (
                          <span className="text-xs text-[#666] ml-auto">{Math.round(detectionResult.inferenceTime)}ms</span>
                        )}
                      </div>

                      {selectedCategory ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-lg font-medium">{selectedCategory.name}</p>
                              <p className="text-sm text-[#666]">{selectedCategory.revitCategory}</p>
                            </div>
                            <span className={`text-sm px-2.5 py-1 rounded-full font-medium ${
                              detectionResult.confidence >= 0.7 ? 'bg-green-500/10 text-green-500' :
                              detectionResult.confidence >= 0.5 ? 'bg-[#dc5f00]/10 text-[#dc5f00]' :
                              'bg-yellow-500/10 text-yellow-500'
                            }`}>
                              {Math.round(detectionResult.confidence * 100)}% match
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-[#666]">Discipline:</span>
                            <span className="px-2 py-0.5 bg-[#515151]/30 rounded flex items-center gap-1.5">
                              {disciplineIcons[selectedCategory.discipline]}
                              {disciplines.find(d => d.id === selectedCategory.discipline)?.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-[#666]">IFC Entity:</span>
                            <span className="px-2 py-0.5 bg-[#515151]/30 rounded font-mono">{selectedCategory.ifcEntity}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-[#a3a1a1] mb-2">Could not identify the component automatically.</p>
                          <p className="text-sm text-[#666]">Please select the category manually below.</p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setShowCategoryPicker(!showCategoryPicker)}
                      className="w-full flex items-center justify-between p-4 bg-[#1a1b1f] border border-[#515151] rounded-lg hover:border-[#dc5f00]/50 transition-colors"
                    >
                      <span className="text-sm">
                        {selectedCategory ? 'Change category' : 'Select category manually'}
                      </span>
                      <ChevronDown className={`text-[#666] transition-transform ${showCategoryPicker ? 'rotate-180' : ''}`} size={18} />
                    </button>

                    {showCategoryPicker && (
                      <div className="p-4 bg-[#1a1b1f] border border-[#515151] rounded-lg max-h-[400px] overflow-y-auto">
                        <div className="space-y-2">
                          {disciplines.map(disc => (
                            <div key={disc.id} className="border border-[#515151]/50 rounded-lg overflow-hidden">
                              <button
                                onClick={() => setExpandedDiscipline(expandedDiscipline === disc.id ? null : disc.id)}
                                className="w-full flex items-center justify-between p-3 hover:bg-[#515151]/10 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  {disciplineIcons[disc.id]}
                                  <span className="font-medium text-sm">{disc.name}</span>
                                  <span className="text-xs text-[#666]">
                                    ({getCategoriesByDiscipline(disc.id).length})
                                  </span>
                                </div>
                                <ChevronDown className={`text-[#666] transition-transform ${expandedDiscipline === disc.id ? 'rotate-180' : ''}`} size={16} />
                              </button>
                              {expandedDiscipline === disc.id && (
                                <div className="border-t border-[#515151]/50 p-2 grid grid-cols-2 gap-1.5">
                                  {getCategoriesByDiscipline(disc.id).map(cat => (
                                    <button
                                      key={cat.id}
                                      onClick={() => handleCategoryOverride(cat)}
                                      className={`text-left p-2 rounded text-xs hover:bg-[#dc5f00]/10 transition-colors ${
                                        selectedCategory?.id === cat.id ? 'bg-[#dc5f00]/20 text-[#dc5f00]' : 'text-[#a3a1a1]'
                                      }`}
                                    >
                                      {cat.name}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {detectionResult.allDetections.length > 0 && (
                      <div className="p-4 bg-[#1a1b1f] border border-[#515151] rounded-lg">
                        <p className="text-xs text-[#666] mb-2">All detected objects ({detectionResult.allDetections.length})</p>
                        <div className="flex flex-wrap gap-1.5">
                          {detectionResult.allDetections.slice(0, 8).map((det, i) => (
                            <span key={i} className="text-xs px-2 py-1 bg-[#515151]/30 rounded">
                              {det.label}: {Math.round(det.score * 100)}%
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 bg-[#1a1b1f] border border-[#515151] rounded-lg">
                    <p className="text-[#a3a1a1] text-center">Processing...</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default UploadSection
