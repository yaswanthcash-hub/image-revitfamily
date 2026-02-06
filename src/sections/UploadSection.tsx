import { useState, useRef, useCallback } from 'react'
import { Upload, FileImage, X, Check, Loader2, AlertCircle } from 'lucide-react'
import type { FurnitureCategory } from '../data/furniture-categories'

interface UploadSectionProps {
  category: FurnitureCategory
  onImageUpload: (url: string) => void
  onAnalysisComplete: () => void
}

const UploadSection = ({ category, onImageUpload, onAnalysisComplete }: UploadSectionProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisStep, setAnalysisStep] = useState(0)
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
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }, [])

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      return
    }

    setUploadedFile(file)
    let progress = 0
    const interval = setInterval(() => {
      progress += 8
      setUploadProgress(Math.min(progress, 100))
      if (progress >= 100) {
        clearInterval(interval)
        const url = URL.createObjectURL(file)
        onImageUpload(url)
        startAnalysis()
      }
    }, 80)
  }

  const startAnalysis = () => {
    setIsAnalyzing(true)
    let step = 0
    const steps = category.analysisSteps

    const interval = setInterval(() => {
      setAnalysisStep(step)
      step++
      if (step >= steps.length) {
        clearInterval(interval)
        setIsAnalyzing(false)
        setAnalysisComplete(true)
        onAnalysisComplete()
      }
    }, 600)
  }

  const clearFile = () => {
    setUploadedFile(null)
    setUploadProgress(0)
    setAnalysisStep(0)
    setAnalysisComplete(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const steps = category.analysisSteps
  const progressPercent = analysisComplete
    ? 100
    : Math.round((analysisStep / (steps.length - 1)) * 100)

  return (
    <section id="upload" className="py-24 bg-[#111]">
      <div className="max-w-[1280px] mx-auto px-5">
        <div className="text-center mb-12 scroll-animate">
          <div className="inline-flex items-center gap-2 text-[#dc5f00] text-sm uppercase tracking-widest font-medium mb-4">
            <Upload size={16} />
            <span>Step 2 of 6</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            Upload <span className="text-[#dc5f00]">{category.name}</span> Image
          </h2>
          <p className="text-[#a3a1a1] max-w-2xl mx-auto">
            Our AI pipeline will detect {category.components.filter(c => c.detected).length} components,
            extract dimensions, and match to the best Revit template for {category.name.toLowerCase()}.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 scroll-animate">
            {!uploadedFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative border-2 border-dashed rounded-lg p-16 text-center cursor-pointer
                  transition-all duration-300
                  ${isDragging
                    ? 'border-[#dc5f00] bg-[#dc5f00]/5'
                    : 'border-[#515151] hover:border-[#dc5f00]/50 hover:bg-[#1a1b1f]'
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  className="hidden"
                />
                <div className="w-20 h-20 bg-[#dc5f00]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Upload className="text-[#dc5f00]" size={32} />
                </div>
                <h3 className="text-xl font-medium mb-3">
                  Drop your {category.name.toLowerCase()} image here
                </h3>
                <p className="text-[#a3a1a1] mb-2">or click to browse</p>
                <p className="text-sm text-[#666]">
                  Supports: JPG, PNG, PDF (max 10MB)
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-[#515151]">
                  <span>Best results: 3/4 angle</span>
                  <span>|</span>
                  <span>White background preferred</span>
                  <span>|</span>
                  <span>Min 800x600px</span>
                </div>
              </div>
            ) : (
              <div className="border border-[#515151] rounded-lg bg-[#1a1b1f] overflow-hidden">
                {!isAnalyzing && !analysisComplete && uploadProgress < 100 ? (
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#dc5f00]/10 rounded-lg flex items-center justify-center">
                          <FileImage className="text-[#dc5f00]" size={24} />
                        </div>
                        <div>
                          <p className="font-medium">{uploadedFile.name}</p>
                          <p className="text-sm text-[#666]">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={clearFile}
                        className="p-2 hover:bg-[#515151]/30 rounded-lg transition-colors"
                      >
                        <X size={20} className="text-[#666]" />
                      </button>
                    </div>
                    <div className="h-2 bg-[#515151]/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#dc5f00] transition-all duration-100 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-[#a3a1a1] mt-2 text-center">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                ) : (
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      {analysisComplete ? (
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <Check size={18} className="text-white" />
                        </div>
                      ) : (
                        <Loader2 className="text-[#dc5f00] animate-spin" size={24} />
                      )}
                      <span className="text-lg font-medium">
                        {analysisComplete ? 'Analysis Complete' : steps[analysisStep]}
                      </span>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-[#a3a1a1]">Pipeline Progress</span>
                        <span className="text-[#dc5f00]">{progressPercent}%</span>
                      </div>
                      <div className="h-1.5 bg-[#515151]/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#dc5f00] rounded-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 max-h-[320px] overflow-y-auto pr-2">
                      {steps.map((step, index) => (
                        <div
                          key={step}
                          className={`flex items-center gap-3 text-sm py-1.5 transition-all duration-300 ${
                            index <= analysisStep || analysisComplete
                              ? 'text-white'
                              : 'text-[#515151]'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                              (analysisComplete || index < analysisStep)
                                ? 'bg-green-500'
                                : index === analysisStep && !analysisComplete
                                ? 'bg-[#dc5f00]'
                                : 'bg-[#333]'
                            }`}
                          >
                            {(analysisComplete || index < analysisStep) ? (
                              <Check size={11} className="text-white" />
                            ) : index === analysisStep && !analysisComplete ? (
                              <Loader2 size={11} className="text-white animate-spin" />
                            ) : (
                              <span className="text-[10px] text-[#666]">{index + 1}</span>
                            )}
                          </div>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 scroll-animate space-y-6">
            <div className="p-5 bg-[#1a1b1f] border border-[#515151] rounded-lg">
              <h4 className="text-sm font-medium mb-4 text-[#a3a1a1] uppercase tracking-wider">Detection Pipeline</h4>
              <div className="space-y-3">
                {category.components.filter(c => c.detected).slice(0, 6).map((comp) => (
                  <div key={comp.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        comp.confidence >= 95 ? 'bg-green-500' :
                        comp.confidence >= 90 ? 'bg-[#dc5f00]' : 'bg-yellow-500'
                      }`} />
                      <span className="text-sm">{comp.name}</span>
                    </div>
                    <span className={`text-xs font-medium ${
                      comp.confidence >= 95 ? 'text-green-500' :
                      comp.confidence >= 90 ? 'text-[#dc5f00]' : 'text-yellow-500'
                    }`}>{comp.confidence}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 bg-[#1a1b1f] border border-[#515151] rounded-lg">
              <h4 className="text-sm font-medium mb-3 text-[#a3a1a1] uppercase tracking-wider">Template Match</h4>
              <p className="text-sm font-medium text-[#dc5f00]">{category.suggestedTemplate}</p>
              <p className="text-xs text-[#666] mt-1">
                From {category.templates.length} available templates
              </p>
            </div>

            <div className="p-5 bg-[#1a1b1f] border border-[#515151] rounded-lg">
              <h4 className="text-sm font-medium mb-3 text-[#a3a1a1] uppercase tracking-wider">BIM Classification</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#666]">Revit Category</span>
                  <span>{category.revitCategory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666]">OmniClass</span>
                  <span className="text-xs">{category.omniClass}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666]">IFC Entity</span>
                  <span className="text-xs">{category.ifcEntity}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#dc5f00]/10 border border-[#dc5f00]/30 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-[#dc5f00] mt-0.5 flex-shrink-0" />
                <p className="text-xs text-[#a3a1a1]">
                  For best results, upload high-resolution images from a 3/4 angle.
                  Multi-angle uploads (front + side) improve accuracy by 8-12%.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default UploadSection
