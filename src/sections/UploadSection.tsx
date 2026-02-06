import { useState, useRef, useCallback } from 'react'
import { Upload, FileImage, X, Check, Loader2, Armchair, Sofa, LampDesk } from 'lucide-react'
import { furnitureCategories, type FurnitureCategory } from '../data/furniture-categories'

interface UploadSectionProps {
  onImageUpload: (url: string) => void
  onAnalysisComplete: () => void
  onCategoryDetected: (category: FurnitureCategory) => void
}

const categoryIcons: Record<string, React.ReactNode> = {
  'accent-chair': <Armchair size={28} />,
  'office-chair': <Armchair size={28} />,
  'sofa-lounge': <Sofa size={28} />,
  'dining-table': <LampDesk size={28} />,
  'office-desk': <LampDesk size={28} />,
  'storage-cabinet': <LampDesk size={28} />,
  'pendant-light': <LampDesk size={28} />,
}

const UploadSection = ({ onImageUpload, onAnalysisComplete, onCategoryDetected }: UploadSectionProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadDone, setUploadDone] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<FurnitureCategory | null>(null)
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

  const handleCategorySelect = async (category: FurnitureCategory) => {
    setSelectedCategory(category)
    onCategoryDetected(category)
    setIsAnalyzing(true)
    setAnalysisStep(0)

    const steps = category.analysisSteps
    for (let i = 0; i < steps.length; i++) {
      setAnalysisStep(i)
      await new Promise(r => setTimeout(r, 400))
    }

    setIsAnalyzing(false)
    setAnalysisComplete(true)
    onAnalysisComplete()
  }

  const clearFile = () => {
    setUploadedFile(null)
    setUploadProgress(0)
    setUploadDone(false)
    setImageUrl(null)
    setSelectedCategory(null)
    setAnalysisStep(0)
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
            Upload a photo of your furniture, then tell us what type it is.
            Our AI will analyze components and extract dimensions.
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
              <h3 className="text-xl font-medium mb-3">Drop your furniture image here</h3>
              <p className="text-[#a3a1a1] mb-2">or click to browse</p>
              <p className="text-sm text-[#666]">Supports: JPG, PNG, PDF (max 10MB)</p>
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
          ) : !selectedCategory ? (
            <div className="space-y-8">
              <div className="flex items-start gap-6 p-5 bg-[#1a1b1f] border border-[#515151] rounded-lg">
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="Uploaded furniture"
                    className="w-28 h-28 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{uploadedFile.name}</p>
                      <p className="text-sm text-green-500 mt-1">Upload complete</p>
                    </div>
                    <button onClick={clearFile} className="p-2 hover:bg-[#515151]/30 rounded-lg transition-colors">
                      <X size={20} className="text-[#666]" />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-2 text-center">What type of furniture is this?</h3>
                <p className="text-[#a3a1a1] text-sm text-center mb-6">Select the category that best matches your uploaded image.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {furnitureCategories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat)}
                      className="group p-5 bg-[#1a1b1f] border border-[#515151] rounded-lg text-left hover:border-[#dc5f00] hover:bg-[#dc5f00]/5 transition-all duration-200"
                    >
                      <div className="w-12 h-12 bg-[#dc5f00]/10 rounded-lg flex items-center justify-center mb-3 text-[#dc5f00] group-hover:bg-[#dc5f00]/20 transition-colors">
                        {categoryIcons[cat.id] || <Armchair size={28} />}
                      </div>
                      <p className="font-medium text-sm mb-1">{cat.name}</p>
                      <p className="text-[11px] text-[#666] leading-tight line-clamp-2">{cat.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-start gap-6 p-5 bg-[#1a1b1f] border border-[#515151] rounded-lg">
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="Uploaded furniture"
                    className="w-28 h-28 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{uploadedFile.name}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1 bg-[#dc5f00]/10 text-[#dc5f00] rounded-full font-medium">
                      {selectedCategory.name}
                    </span>
                    {!isAnalyzing && analysisComplete && (
                      <span className="text-xs text-green-500">Analysis complete</span>
                    )}
                  </div>
                  {!analysisComplete && (
                    <button
                      onClick={() => { setSelectedCategory(null); setIsAnalyzing(false); setAnalysisStep(0) }}
                      className="text-xs text-[#666] hover:text-[#a3a1a1] mt-2 underline"
                    >
                      Change category
                    </button>
                  )}
                </div>
                {!analysisComplete && (
                  <button onClick={clearFile} className="p-2 hover:bg-[#515151]/30 rounded-lg transition-colors flex-shrink-0">
                    <X size={20} className="text-[#666]" />
                  </button>
                )}
              </div>

              <div className="p-6 bg-[#1a1b1f] border border-[#515151] rounded-lg">
                <div className="flex items-center justify-center gap-3 mb-6">
                  {isAnalyzing && <Loader2 className="text-[#dc5f00] animate-spin" size={20} />}
                  <span className={`text-sm font-medium ${isAnalyzing ? 'text-white' : 'text-green-500'}`}>
                    {isAnalyzing ? (selectedCategory.analysisSteps[analysisStep] || 'Analyzing...') : 'Analysis Complete'}
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedCategory.analysisSteps.map((step, index) => (
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
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default UploadSection
