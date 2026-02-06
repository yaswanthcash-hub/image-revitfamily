import { useState, useRef, useCallback } from 'react'
import { Upload, FileImage, FileText, X, Check, Loader2 } from 'lucide-react'

interface UploadSectionProps {
  onImageUpload: (url: string) => void
  onAnalysisComplete: () => void
}

const UploadSection = ({ onImageUpload, onAnalysisComplete }: UploadSectionProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisStep, setAnalysisStep] = useState(0)
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
      alert('Please upload an image or PDF file')
      return
    }
    
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    setUploadedFile(file)
    
    // Simulate upload progress
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setUploadProgress(progress)
      if (progress >= 100) {
        clearInterval(interval)
        const url = URL.createObjectURL(file)
        onImageUpload(url)
        startAnalysis()
      }
    }, 100)
  }

  const startAnalysis = () => {
    setIsAnalyzing(true)
    const steps = [
      'Detecting furniture type...',
      'Identifying components...',
      'Extracting dimensions...',
      'Matching templates...',
      'Analysis complete!'
    ]
    
    let step = 0
    const interval = setInterval(() => {
      setAnalysisStep(step)
      step++
      if (step >= steps.length) {
        clearInterval(interval)
        setIsAnalyzing(false)
        onAnalysisComplete()
      }
    }, 800)
  }

  const clearFile = () => {
    setUploadedFile(null)
    setUploadProgress(0)
    setAnalysisStep(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const steps = [
    {
      icon: Upload,
      title: 'Upload',
      description: 'Drag & drop product images or catalog PDFs'
    },
    {
      icon: FileImage,
      title: 'Analyze',
      description: 'AI detects components, dimensions, and geometry'
    },
    {
      icon: FileText,
      title: 'Configure',
      description: 'Adjust parameters and export .rfa file'
    }
  ]

  const analysisSteps = [
    'Detecting furniture type...',
    'Identifying components...',
    'Extracting dimensions...',
    'Matching templates...',
    'Analysis complete!'
  ]

  return (
    <section id="upload" className="py-24 bg-[#111]">
      <div className="max-w-[1280px] mx-auto px-5">
        {/* Section Header */}
        <div className="text-center mb-16 scroll-animate">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            From Image to Family in <span className="text-[#dc5f00]">3 Steps</span>
          </h2>
          <p className="text-[#a3a1a1] max-w-2xl mx-auto">
            Our AI-powered pipeline transforms product images into parametric Revit families 
            with proper BIM structure in minutes.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="scroll-animate card-hover p-8 rounded-lg text-center"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-16 h-16 bg-[#dc5f00]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <step.icon className="text-[#dc5f00]" size={28} />
              </div>
              <div className="w-8 h-8 bg-[#dc5f00] rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-semibold">
                {index + 1}
              </div>
              <h3 className="text-xl font-medium mb-3">{step.title}</h3>
              <p className="text-[#a3a1a1] text-sm">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Upload Zone */}
        <div className="scroll-animate max-w-2xl mx-auto">
          {!uploadedFile ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
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
                Drop your chair image here
              </h3>
              <p className="text-[#a3a1a1] mb-2">
                or click to browse
              </p>
              <p className="text-sm text-[#666]">
                Supports: JPG, PNG, PDF (max 10MB)
              </p>
            </div>
          ) : (
            <div className="border border-[#515151] rounded-lg p-8 bg-[#1a1b1f]">
              {!isAnalyzing && uploadProgress < 100 ? (
                <>
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
                      className="h-full bg-[#dc5f00] transition-all duration-100"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-[#a3a1a1] mt-2 text-center">
                    Uploading... {uploadProgress}%
                  </p>
                </>
              ) : (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <Loader2 className="text-[#dc5f00] animate-spin" size={24} />
                    <span className="text-lg font-medium">
                      {analysisSteps[analysisStep]}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {analysisSteps.map((step, index) => (
                      <div
                        key={step}
                        className={`flex items-center gap-3 text-sm ${
                          index <= analysisStep
                            ? 'text-white'
                            : 'text-[#666]'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            index < analysisStep
                              ? 'bg-green-500'
                              : index === analysisStep
                              ? 'bg-[#dc5f00]'
                              : 'bg-[#515151]'
                          }`}
                        >
                          {index < analysisStep ? (
                            <Check size={12} />
                          ) : (
                            <span className="text-xs">{index + 1}</span>
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
      </div>
    </section>
  )
}

export default UploadSection
