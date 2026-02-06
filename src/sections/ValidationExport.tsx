import { useState, useEffect } from 'react'
import { Check, AlertTriangle, Download, FileText, BookOpen, Loader2, Package, Building2, Zap, Droplets, Construction, Fan, type LucideIcon } from 'lucide-react'
import type { RevitFamilyCategory, Discipline } from '../data/revit-categories'

interface ValidationExportProps {
  category?: RevitFamilyCategory
}

interface ValidationStep {
  id: number
  name: string
  status: 'pending' | 'checking' | 'passed' | 'failed'
  icon: LucideIcon
}

const disciplineIcons: Record<Discipline, LucideIcon> = {
  architectural: Building2,
  structural: Construction,
  mechanical: Fan,
  electrical: Zap,
  plumbing: Droplets,
}

const getValidationSteps = (category?: RevitFamilyCategory): ValidationStep[] => {
  const baseSteps: ValidationStep[] = [
    { id: 1, name: 'Family loads in Revit 2022-2025', status: 'pending', icon: Package },
    { id: 2, name: 'Parameters follow naming standards', status: 'pending', icon: FileText },
    { id: 3, name: 'File size under 2MB', status: 'pending', icon: Package },
    { id: 4, name: 'Reference planes correctly positioned', status: 'pending', icon: Package },
    { id: 5, name: 'Geometry is parametric', status: 'pending', icon: Package },
  ]

  if (!category) return baseSteps

  const disciplineSteps: Partial<Record<Discipline, ValidationStep[]>> = {
    architectural: [
      { id: 6, name: 'Host constraints defined', status: 'pending', icon: Building2 },
      { id: 7, name: 'Opening cut geometry valid', status: 'pending', icon: Building2 },
    ],
    structural: [
      { id: 6, name: 'Structural usage parameters set', status: 'pending', icon: Construction },
      { id: 7, name: 'Analytical model enabled', status: 'pending', icon: Construction },
    ],
    mechanical: [
      { id: 6, name: 'HVAC connectors defined', status: 'pending', icon: Fan },
      { id: 7, name: 'Airflow parameters valid', status: 'pending', icon: Fan },
    ],
    electrical: [
      { id: 6, name: 'Electrical connectors defined', status: 'pending', icon: Zap },
      { id: 7, name: 'Load classification set', status: 'pending', icon: Zap },
    ],
    plumbing: [
      { id: 6, name: 'Pipe connectors defined', status: 'pending', icon: Droplets },
      { id: 7, name: 'Flow parameters configured', status: 'pending', icon: Droplets },
    ],
  }

  return [...baseSteps, ...(disciplineSteps[category.discipline] || [])]
}

const getWarnings = (category?: RevitFamilyCategory): string[] => {
  if (!category) return []

  const warnings: string[] = []

  if (category.hostBased) {
    warnings.push('Host-based family requires wall, floor, or ceiling for placement')
  }

  if (category.connectorTypes && category.connectorTypes.length > 0) {
    warnings.push(`MEP connectors detected: ${category.connectorTypes.join(', ')}`)
  }

  if (category.discipline === 'structural') {
    warnings.push('Structural families require analytical model review')
  }

  return warnings
}

const ValidationExport = ({ category }: ValidationExportProps) => {
  const [validationSteps, setValidationSteps] = useState<ValidationStep[]>(() => getValidationSteps(category))
  const [warnings, setWarnings] = useState<string[]>([])
  const [isExporting, setIsExporting] = useState(false)
  const [exportComplete, setExportComplete] = useState(false)

  useEffect(() => {
    const steps = getValidationSteps(category)
    setValidationSteps(steps)
    setWarnings([])
    setExportComplete(false)

    let step = 0
    const interval = setInterval(() => {
      if (step < steps.length) {
        setValidationSteps(prev => prev.map((s, i) =>
          i === step ? { ...s, status: 'checking' } : s
        ))

        setTimeout(() => {
          setValidationSteps(prev => prev.map((s, i) =>
            i === step ? { ...s, status: 'passed' } : s
          ))
        }, 600)

        step++
      } else {
        clearInterval(interval)
        setWarnings(getWarnings(category))
      }
    }, 800)

    return () => clearInterval(interval)
  }, [category])

  const allPassed = validationSteps.every(s => s.status === 'passed')

  const handleExport = () => {
    setIsExporting(true)
    setTimeout(() => {
      setIsExporting(false)
      setExportComplete(true)
    }, 2000)
  }

  const DisciplineIcon = category ? disciplineIcons[category.discipline] : Package

  return (
    <section className="py-24 bg-[#111]">
      <div className="max-w-[1280px] mx-auto px-5">
        <div className="text-center mb-12 scroll-animate">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            Validate <span className="text-[#dc5f00]">& Export</span>
          </h2>
          <p className="text-[#a3a1a1] max-w-2xl mx-auto">
            {category
              ? `Validating ${category.name} against ${category.discipline} family standards`
              : 'Run automated checks to ensure quality, then download your .rfa file ready for Revit.'
            }
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="scroll-animate">
            <h3 className="text-xl font-medium mb-6">Validation Checklist</h3>

            <div className="space-y-4">
              {validationSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`p-4 border rounded-lg flex items-center justify-between transition-all duration-300 ${
                    step.status === 'passed'
                      ? 'bg-green-500/10 border-green-500/30'
                      : step.status === 'checking'
                      ? 'bg-[#dc5f00]/10 border-[#dc5f00]/30'
                      : step.status === 'failed'
                      ? 'bg-red-500/10 border-red-500/30'
                      : 'bg-[#1a1b1f] border-[#515151]'
                  }`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        step.status === 'passed'
                          ? 'bg-green-500'
                          : step.status === 'checking'
                          ? 'bg-[#dc5f00]'
                          : step.status === 'failed'
                          ? 'bg-red-500'
                          : 'bg-[#515151]'
                      }`}
                    >
                      {step.status === 'passed' ? (
                        <Check size={20} className="text-white" />
                      ) : step.status === 'checking' ? (
                        <Loader2 size={20} className="text-white animate-spin" />
                      ) : (
                        <step.icon size={20} color="#666" />
                      )}
                    </div>
                    <span
                      className={`font-medium ${
                        step.status === 'pending' ? 'text-[#666]' : 'text-white'
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>

                  {step.status === 'passed' && (
                    <span className="text-green-500 text-sm">Passed</span>
                  )}
                  {step.status === 'checking' && (
                    <span className="text-[#dc5f00] text-sm">Checking...</span>
                  )}
                </div>
              ))}
            </div>

            {warnings.length > 0 && (
              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={18} className="text-yellow-500" />
                  <span className="font-medium text-yellow-500">Notes</span>
                </div>
                <ul className="space-y-2">
                  {warnings.map((warning, index) => (
                    <li key={index} className="text-sm text-[#a3a1a1] flex items-start gap-2">
                      <span className="text-yellow-500 mt-1">-</span>
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-[#a3a1a1]">Validation Progress</span>
                <span className="text-[#dc5f00]">
                  {validationSteps.filter(s => s.status === 'passed').length} / {validationSteps.length}
                </span>
              </div>
              <div className="h-2 bg-[#515151]/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#dc5f00] rounded-full transition-all duration-500"
                  style={{
                    width: `${(validationSteps.filter(s => s.status === 'passed').length / validationSteps.length) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>

          <div className="scroll-animate">
            <h3 className="text-xl font-medium mb-6">Export Options</h3>

            <div className="space-y-4">
              <div className="p-6 bg-[#1a1b1f] border border-[#515151] rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#dc5f00]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <DisciplineIcon color="#dc5f00" size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">Revit Family (.rfa)</h4>
                    <p className="text-sm text-[#a3a1a1] mb-4">
                      {category
                        ? `${category.name} - ${category.revitCategory} family`
                        : 'Parametric family file compatible with Revit 2022-2025'
                      }
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-[#666]">
                      <span>Version: 2022</span>
                      <span>Size: ~1.2 MB</span>
                      {category && <span>IFC: {category.ifcEntity}</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-[#1a1b1f] border border-[#515151] rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#515151]/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="text-[#a3a1a1]" size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">Usage Instructions (.pdf)</h4>
                    <p className="text-sm text-[#a3a1a1] mb-4">
                      Documentation with parameter reference and loading instructions
                    </p>
                    <div className="flex items-center gap-4 text-sm text-[#666]">
                      <span>Pages: 3</span>
                      <span>Size: ~150 KB</span>
                    </div>
                  </div>
                </div>
              </div>

              {category && (
                <div className="p-4 bg-[#1a1b1f] border border-[#515151] rounded-lg">
                  <p className="text-xs text-[#666] mb-2">BIM Classification</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-[#666]">OmniClass:</span>
                      <span className="ml-2">{category.omniClass}</span>
                    </div>
                    <div>
                      <span className="text-[#666]">Uniclass:</span>
                      <span className="ml-2">{category.uniclass}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 bg-[#1a1b1f] border border-[#515151] rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 accent-[#dc5f00] rounded" />
                  <span className="text-sm">Save to personal library for future use</span>
                </label>
              </div>

              <button
                onClick={handleExport}
                disabled={!allPassed || isExporting}
                className={`w-full py-4 rounded-lg font-medium uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 ${
                  allPassed && !isExporting
                    ? 'bg-[#dc5f00] text-white hover:bg-white hover:text-black'
                    : exportComplete
                    ? 'bg-green-500 text-white'
                    : 'bg-[#515151]/50 text-[#666] cursor-not-allowed'
                }`}
              >
                {isExporting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Generating Family...
                  </>
                ) : exportComplete ? (
                  <>
                    <Check size={20} />
                    Export Complete!
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    Download Family
                  </>
                )}
              </button>

              {exportComplete && (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
                  <p className="text-green-500 font-medium mb-1">Success!</p>
                  <p className="text-sm text-[#a3a1a1]">
                    {category
                      ? `Your ${category.name} Revit family has been downloaded.`
                      : 'Your Revit family has been downloaded.'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ValidationExport
