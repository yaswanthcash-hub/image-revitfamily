import { useState, useRef, useCallback } from 'react'
import { Upload, FileImage, X, Check, Loader2, ChevronDown } from 'lucide-react'
import { analyzeImage } from '../lib/image-analyzer'
import { furnitureCategories, type FurnitureCategory } from '../data/furniture-categories'

interface UploadSectionProps {
  onImageUpload: (url: string) => void
  onAnalysisComplete: () => void
  onCategoryDetected: (category: FurnitureCategory) => void
}

const UploadSection = ({ onImageUpload, onAnalysisComplete, onCategoryDetected }: UploadSectionProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisStep, setAnalysisStep] = useState(0)
  const [detectedCategory, setDetectedCategory] = useState<FurnitureCategory | null>(null)
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const [analysisSteps, setAnalysisSteps] = useState<string[]>([])
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
        onImageUpload(url)
        startAnalysis(url)
      }
    }, 80)
  }

  const startAnalysis = async (imageUrl: string) => {
    setIsAnalyzing(true)
    setAnalysisStep(0)
    setAnalysisSteps(['Analyzing image content...'])

    const category = await analyzeImage(imageUrl)
    setDetectedCategory(category)
    onCategoryDetected(category)

    const steps = category.analysisSteps
    setAnalysisSteps(steps)

    for (let i = 0; i < steps.length; i++) {
      setAnalysisStep(i)
      await new Promise(r => setTimeout(r, 450))
    }

    setIsAnalyzing(false)
    setAnalysisComplete(true)
    onAnalysisComplete()
  }

  const handleCategoryChange = (cat: FurnitureCategory) => {
    setDetectedCategory(cat)
    onCategoryDetected(cat)
    setShowCategoryPicker(false)
    setAnalysisSteps(cat.analysisSteps)
  }

  const clearFile = () => {
    setUploadedFile(null)
    setUploadProgress(0)
    setAnalysisStep(0)
    setDetectedCategory(null)
    setAnalysisSteps([])
    setAnalysisComplete(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <section id="upload" className="py-24 bg-[#111]">
      <div className="max-w-[1280px] mx-auto px-5">
        <div className="text-center mb-16 scroll-animate">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            Upload Your <span className="text-[#dc5f00]">Furniture Image</span>
          </h2>
          <p className="text-[#a3a1a1] max-w-2xl mx-auto">
            Our AI analyzes your image to detect the furniture type, identify components,
            and extract dimensions automatically.
          </p>
        </div>

        <div className="scroll-animate max-w-2xl mx-auto">
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
              <h3 className="text-xl font-medium mb-3">Drop your furniture image here</h3>
              <p className="text-[#a3a1a1] mb-2">or click to browse</p>
              <p className="text-sm text-[#666]">Supports: JPG, PNG, PDF (max 10MB)</p>
            </div>
          ) : (
            <div className="border border-[#515151] rounded-lg p-8 bg-[#1a1b1f]">
              {uploadProgress < 100 ? (
                <>
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
                </>
              ) : (
                <div>
                  {detectedCategory && (
                    <div className="mb-6 p-4 bg-[#0a0a0a] border border-[#515151] rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-[#666] uppercase tracking-wider mb-1">Detected Category</p>
                          <p className="font-medium text-[#dc5f00] text-lg">{detectedCategory.name}</p>
                          <p className="text-xs text-[#a3a1a1] mt-1">{detectedCategory.description}</p>
                        </div>
                        <div className="relative">
                          <button
                            onClick={() => setShowCategoryPicker(!showCategoryPicker)}
                            className="text-xs px-3 py-1.5 border border-[#515151] rounded-lg text-[#a3a1a1] hover:border-[#dc5f00] transition-colors flex items-center gap-1"
                          >
                            Change <ChevronDown size={12} />
                          </button>
                          {showCategoryPicker && (
                            <div className="absolute right-0 top-full mt-2 w-60 bg-[#1a1b1f] border border-[#515151] rounded-lg shadow-xl z-10 overflow-hidden">
                              {furnitureCategories.map(cat => (
                                <button
                                  key={cat.id}
                                  onClick={() => handleCategoryChange(cat)}
                                  className={`w-full text-left px-4 py-3 text-sm hover:bg-[#515151]/30 transition-colors flex items-center justify-between ${
                                    cat.id === detectedCategory.id ? 'text-[#dc5f00]' : 'text-[#a3a1a1]'
                                  }`}
                                >
                                  {cat.name}
                                  {cat.id === detectedCategory.id && <Check size={14} />}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-3 mb-6">
                    {isAnalyzing && <Loader2 className="text-[#dc5f00] animate-spin" size={20} />}
                    <span className={`text-sm font-medium ${isAnalyzing ? 'text-white' : analysisComplete ? 'text-green-500' : 'text-white'}`}>
                      {isAnalyzing
                        ? (analysisSteps[analysisStep] || 'Analyzing...')
                        : analysisComplete
                        ? 'Analysis Complete'
                        : 'Analyzing...'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {analysisSteps.map((step, index) => (
                      <div
                        key={`${step}-${index}`}
                        className={`flex items-center gap-3 text-sm ${
                          index <= analysisStep ? 'text-white' : 'text-[#666]'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          index < analysisStep || (analysisComplete && index === analysisStep)
                            ? 'bg-green-500'
                            : index === analysisStep
                            ? 'bg-[#dc5f00]'
                            : 'bg-[#515151]'
                        }`}>
                          {index < analysisStep || (analysisComplete && index === analysisStep)
                            ? <Check size={12} />
                            : <span className="text-[10px]">{index + 1}</span>
                          }
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
