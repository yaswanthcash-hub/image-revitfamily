import { useState, useEffect, useMemo } from 'react'
import { Check, AlertTriangle, Download, Loader2, Package, FileText, BookOpen, Database, Shield, X } from 'lucide-react'
import type { FurnitureCategory } from '../data/furniture-categories'
import { validationRules } from '../data/furniture-categories'

type RuleStatus = 'pending' | 'checking' | 'passed' | 'warning' | 'failed'

interface ValidationResult {
  id: number
  category: string
  name: string
  severity: string
  status: RuleStatus
}

interface ValidationExportProps {
  category: FurnitureCategory
}

const ruleCategories = [...new Set(validationRules.map(r => r.category))]

const exportFormats = [
  {
    id: 'rfa',
    label: 'Revit Family (.rfa)',
    desc: 'Parametric family file compatible with Revit 2022-2025',
    icon: Package,
    primary: true,
    meta: ['Version: 2022', 'Size: ~1.2 MB', 'Format: .rfa'],
  },
  {
    id: 'typecatalog',
    label: 'Type Catalog (.txt)',
    desc: 'Multi-type definitions for family types and sizes',
    icon: FileText,
    primary: false,
    meta: ['Format: .txt', 'Comma-delimited'],
  },
  {
    id: 'docs',
    label: 'Documentation (.pdf)',
    desc: 'Parameter reference, loading instructions, and BIM notes',
    icon: BookOpen,
    primary: false,
    meta: ['Pages: 4-6', 'Size: ~250 KB'],
  },
  {
    id: 'ifc',
    label: 'IFC Export (.ifc)',
    desc: 'Industry Foundation Classes file for open BIM exchange',
    icon: Database,
    primary: false,
    meta: ['IFC 4.3', 'Certified export'],
  },
]

const ValidationExport = ({ category }: ValidationExportProps) => {
  const [results, setResults] = useState<ValidationResult[]>([])
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [exportComplete, setExportComplete] = useState(false)
  const [selectedFormats, setSelectedFormats] = useState<Set<string>>(new Set(['rfa']))

  useEffect(() => {
    const initial: ValidationResult[] = validationRules.map(r => ({
      ...r,
      status: 'pending' as RuleStatus,
    }))
    setResults(initial)

    let idx = 0
    const interval = setInterval(() => {
      if (idx < initial.length) {
        const currentIdx = idx
        setResults(prev => prev.map((r, i) =>
          i === currentIdx ? { ...r, status: 'checking' } : r
        ))

        setTimeout(() => {
          setResults(prev => prev.map((r, i) => {
            if (i !== currentIdx) return r
            const rng = Math.random()
            if (r.severity === 'warning' && rng < 0.25) {
              return { ...r, status: 'warning' }
            }
            if (r.severity === 'error' && rng < 0.08) {
              return { ...r, status: 'failed' }
            }
            return { ...r, status: 'passed' }
          }))
        }, 350)

        idx++
      } else {
        clearInterval(interval)
      }
    }, 180)

    return () => clearInterval(interval)
  }, [])

  const passedCount = results.filter(r => r.status === 'passed').length
  const warningCount = results.filter(r => r.status === 'warning').length
  const failedCount = results.filter(r => r.status === 'failed').length
  const checkedCount = passedCount + warningCount + failedCount

  const score = useMemo(() => {
    if (checkedCount === 0) return 0
    return Math.round(((passedCount + warningCount * 0.7) / results.length) * 100)
  }, [passedCount, warningCount, checkedCount, results.length])

  const filteredResults = activeFilter
    ? results.filter(r => r.category === activeFilter)
    : results

  const allChecked = checkedCount === results.length

  const handleExport = () => {
    setIsExporting(true)
    setTimeout(() => {
      setIsExporting(false)
      setExportComplete(true)
    }, 2500)
  }

  const toggleFormat = (id: string) => {
    setSelectedFormats(prev => {
      const next = new Set(prev)
      if (id === 'rfa') return next
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const statusIcon = (status: RuleStatus) => {
    switch (status) {
      case 'passed': return <Check size={14} className="text-green-500" />
      case 'warning': return <AlertTriangle size={14} className="text-yellow-500" />
      case 'failed': return <X size={14} className="text-red-500" />
      case 'checking': return <Loader2 size={14} className="text-[#dc5f00] animate-spin" />
      default: return <div className="w-3.5 h-3.5 rounded-full bg-[#333]" />
    }
  }

  return (
    <section className="py-24 bg-[#111]">
      <div className="max-w-[1280px] mx-auto px-5">
        <div className="text-center mb-12 scroll-animate">
          <div className="inline-flex items-center gap-2 text-[#dc5f00] text-sm uppercase tracking-widest font-medium mb-4">
            <Shield size={16} />
            <span>Step 6 of 6</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            Validate <span className="text-[#dc5f00]">& Export</span>
          </h2>
          <p className="text-[#a3a1a1] max-w-2xl mx-auto">
            {validationRules.length} automated checks against Revit content standards
            for your {category.name} family. Download when validation passes.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="scroll-animate">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Validation Checklist</h3>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-green-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full" /> {passedCount}
                </span>
                <span className="flex items-center gap-1 text-yellow-500">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" /> {warningCount}
                </span>
                <span className="flex items-center gap-1 text-red-500">
                  <div className="w-2 h-2 bg-red-500 rounded-full" /> {failedCount}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setActiveFilter(null)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  !activeFilter
                    ? 'bg-[#dc5f00] border-[#dc5f00] text-white'
                    : 'border-[#515151] text-[#a3a1a1] hover:border-[#dc5f00]/50'
                }`}
              >
                All ({results.length})
              </button>
              {ruleCategories.map(cat => {
                const count = results.filter(r => r.category === cat).length
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveFilter(activeFilter === cat ? null : cat)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      activeFilter === cat
                        ? 'bg-[#dc5f00] border-[#dc5f00] text-white'
                        : 'border-[#515151] text-[#a3a1a1] hover:border-[#dc5f00]/50'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                )
              })}
            </div>

            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {filteredResults.map(rule => (
                <div
                  key={rule.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                    rule.status === 'passed' ? 'bg-green-500/5 border-green-500/20' :
                    rule.status === 'warning' ? 'bg-yellow-500/5 border-yellow-500/20' :
                    rule.status === 'failed' ? 'bg-red-500/5 border-red-500/20' :
                    rule.status === 'checking' ? 'bg-[#dc5f00]/5 border-[#dc5f00]/20' :
                    'bg-[#1a1b1f] border-[#515151]/50'
                  }`}
                >
                  <div className="flex-shrink-0">{statusIcon(rule.status)}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${
                      rule.status === 'pending' ? 'text-[#666]' : 'text-white'
                    }`}>
                      {rule.name}
                    </p>
                    <p className="text-[10px] text-[#515151]">{rule.category}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    rule.severity === 'error'
                      ? 'bg-red-500/10 text-red-400'
                      : 'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {rule.severity}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-[#a3a1a1]">Validation Score</span>
                <span className={`font-medium ${
                  score >= 90 ? 'text-green-500' : score >= 70 ? 'text-yellow-500' : 'text-red-500'
                }`}>
                  {allChecked ? `${score}%` : `${checkedCount}/${results.length} checked`}
                </span>
              </div>
              <div className="h-2.5 bg-[#515151]/30 rounded-full overflow-hidden flex">
                {passedCount > 0 && (
                  <div
                    className="h-full bg-green-500 transition-all duration-500"
                    style={{ width: `${(passedCount / results.length) * 100}%` }}
                  />
                )}
                {warningCount > 0 && (
                  <div
                    className="h-full bg-yellow-500 transition-all duration-500"
                    style={{ width: `${(warningCount / results.length) * 100}%` }}
                  />
                )}
                {failedCount > 0 && (
                  <div
                    className="h-full bg-red-500 transition-all duration-500"
                    style={{ width: `${(failedCount / results.length) * 100}%` }}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="scroll-animate">
            <h3 className="text-lg font-medium mb-4">Export Options</h3>

            <div className="space-y-3">
              {exportFormats.map(fmt => {
                const Icon = fmt.icon
                const isSelected = selectedFormats.has(fmt.id)
                return (
                  <button
                    key={fmt.id}
                    onClick={() => toggleFormat(fmt.id)}
                    className={`w-full text-left p-5 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-[#dc5f00]/5 border-[#dc5f00]/40'
                        : 'bg-[#1a1b1f] border-[#515151] hover:border-[#515151]'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-[#dc5f00]/15' : 'bg-[#515151]/20'
                      }`}>
                        <Icon className={isSelected ? 'text-[#dc5f00]' : 'text-[#a3a1a1]'} size={22} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{fmt.label}</h4>
                          {fmt.primary && (
                            <span className="text-[10px] bg-[#dc5f00] text-white px-1.5 py-0.5 rounded">Required</span>
                          )}
                        </div>
                        <p className="text-xs text-[#a3a1a1] mt-1">{fmt.desc}</p>
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-[#666]">
                          {fmt.meta.map(m => (
                            <span key={m}>{m}</span>
                          ))}
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isSelected ? 'bg-[#dc5f00] border-[#dc5f00]' : 'border-[#515151]'
                      }`}>
                        {isSelected && <Check size={12} className="text-white" />}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <button
              onClick={handleExport}
              disabled={!allChecked || failedCount > 0 || isExporting}
              className={`w-full mt-6 py-4 rounded-lg font-medium uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 ${
                allChecked && failedCount === 0 && !isExporting && !exportComplete
                  ? 'bg-[#dc5f00] text-white hover:bg-white hover:text-black'
                  : exportComplete
                  ? 'bg-green-500 text-white'
                  : 'bg-[#515151]/50 text-[#666] cursor-not-allowed'
              }`}
            >
              {isExporting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Generating {selectedFormats.size} file{selectedFormats.size > 1 ? 's' : ''}...
                </>
              ) : exportComplete ? (
                <>
                  <Check size={20} />
                  Export Complete
                </>
              ) : (
                <>
                  <Download size={20} />
                  Download {category.name} Family
                </>
              )}
            </button>

            {!allChecked && (
              <p className="text-xs text-center text-[#515151] mt-3">
                Waiting for validation to complete...
              </p>
            )}

            {allChecked && failedCount > 0 && !exportComplete && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <X size={16} className="text-red-500" />
                  <span className="text-sm font-medium text-red-400">
                    {failedCount} critical check{failedCount > 1 ? 's' : ''} failed
                  </span>
                </div>
                <p className="text-xs text-[#a3a1a1]">
                  Resolve failed checks before exporting. Failed validations
                  indicate issues that would cause problems when loaded in Revit.
                </p>
              </div>
            )}

            {exportComplete && (
              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
                <p className="text-green-500 font-medium mb-1">Download Started</p>
                <p className="text-xs text-[#a3a1a1]">
                  Your {category.name} Revit family and {selectedFormats.size - 1} additional file{selectedFormats.size > 2 ? 's have' : ' has'} been exported.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ValidationExport
