import { useState, useCallback, useMemo } from 'react'
import {
  Layers,
  Settings2,
  Palette,
  History,
  Download,
  AlertTriangle,
  CheckCircle,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react'
import type { RevitFamilyCategory } from '../data/revit-categories'
import DesignViews from './DesignViews'
import MaterialEditor from './MaterialEditor'
import VersionHistory from './VersionHistory'
import type { Parameter, Constraint } from '../lib/parametric-engine'
import { evaluateParameters, validateConstraints } from '../lib/parametric-engine'
import type { Material } from '../lib/materials'
import type { VersionSnapshot } from '../lib/version-history'
import type { IFCProjectInfo } from '../lib/ifc-generator'
import { generateIFC, createFurnitureElement, downloadIFC } from '../lib/ifc-generator'

type SidebarTab = 'parameters' | 'materials' | 'history'

interface ConceptualDesignWorkspaceProps {
  projectId: string | null
  category: RevitFamilyCategory
  initialDimensions?: Record<string, number>
  onDimensionsChange?: (dimensions: Record<string, number>) => void
}

export default function ConceptualDesignWorkspace({
  projectId,
  category,
  initialDimensions,
  onDimensionsChange
}: ConceptualDesignWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('parameters')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [dimensions, setDimensions] = useState<Record<string, number>>(() => {
    const defaults: Record<string, number> = {}
    for (const dim of category.dimensions) {
      defaults[dim.key] = initialDimensions?.[dim.key] ?? dim.default
    }
    return defaults
  })
  const [customParameters] = useState<Parameter[]>([])
  const [constraints, setConstraints] = useState<Constraint[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>()
  const [isExporting, setIsExporting] = useState(false)

  const parameters: Parameter[] = useMemo(() => {
    return [
      ...category.dimensions.map(dim => ({
        id: dim.key,
        name: dim.key,
        label: dim.label,
        value: dimensions[dim.key] ?? dim.default,
        dataType: 'number' as const,
        group: 'Dimensions' as const,
        min: dim.min,
        max: dim.max,
        unit: dim.unit
      })),
      ...customParameters
    ]
  }, [category.dimensions, dimensions, customParameters])

  const evaluatedValues = useMemo(() => {
    return evaluateParameters(parameters, dimensions) as Record<string, number>
  }, [parameters, dimensions])

  const validationResult = useMemo(() => {
    return validateConstraints(constraints, evaluatedValues)
  }, [constraints, evaluatedValues])

  const handleDimensionChange = useCallback((key: string, value: number) => {
    const dim = category.dimensions.find(d => d.key === key)
    if (dim) {
      const clampedValue = Math.max(dim.min, Math.min(dim.max, value))
      setDimensions(prev => {
        const updated = { ...prev, [key]: clampedValue }
        onDimensionsChange?.(updated)
        return updated
      })
    }
  }, [category.dimensions, onDimensionsChange])

  const handleAddConstraint = useCallback((name: string, expression: string, severity: 'error' | 'warning' | 'info') => {
    const id = crypto.randomUUID()
    setConstraints(prev => [...prev, { id, name, expression, severity }])
  }, [])

  const currentSnapshot: VersionSnapshot = useMemo(() => ({
    dimensions,
    category: category.id,
    parameters: Object.fromEntries(customParameters.map(p => [p.name, p.formula || p.value])),
    materials: materials.reduce((acc, m) => ({ ...acc, [m.id]: m.name }), {})
  }), [dimensions, category.id, customParameters, materials])

  const handleRestoreVersion = useCallback((snapshot: VersionSnapshot) => {
    if (snapshot.dimensions) {
      setDimensions(snapshot.dimensions)
      onDimensionsChange?.(snapshot.dimensions)
    }
  }, [onDimensionsChange])

  const handleExportIFC = useCallback(async () => {
    setIsExporting(true)

    try {
      const projectInfo: IFCProjectInfo = {
        name: `${category.name} Family`,
        description: `Generated ${category.name} for Revit`,
        author: 'Revit Family Generator',
        organization: 'Custom',
        phase: 'Design'
      }

      const element = createFurnitureElement(
        category.name,
        category.id,
        dimensions,
        {
          omniClass: category.omniClass,
          uniclass: category.uniclass
        }
      )

      const ifcContent = generateIFC(projectInfo, [element], materials)
      downloadIFC(ifcContent, `${category.name.replace(/\s+/g, '_')}_family`)
    } catch (err) {
      console.error('Export failed:', err)
      alert('Failed to export IFC file')
    } finally {
      setIsExporting(false)
    }
  }, [category, dimensions, materials])

  return (
    <div className="h-[800px] flex bg-[#111] border border-[#515151] rounded-xl overflow-hidden">
      <div className={`flex-1 flex flex-col transition-all ${sidebarCollapsed ? '' : 'mr-[360px]'}`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#515151]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#dc5f00]/20 flex items-center justify-center">
              <Layers size={18} className="text-[#dc5f00]" />
            </div>
            <div>
              <h2 className="font-semibold">{category.name}</h2>
              <p className="text-xs text-[#a3a1a1]">{category.discipline}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!validationResult.valid && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-sm">
                <AlertTriangle size={14} />
                {validationResult.errors.length} issues
              </div>
            )}

            {validationResult.warnings.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 text-yellow-400 rounded-lg text-sm">
                <AlertTriangle size={14} />
                {validationResult.warnings.length} warnings
              </div>
            )}

            {validationResult.valid && validationResult.warnings.length === 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-sm">
                <CheckCircle size={14} />
                Valid
              </div>
            )}

            <button
              onClick={handleExportIFC}
              disabled={isExporting || !validationResult.valid}
              className="flex items-center gap-2 px-4 py-2 bg-[#dc5f00] hover:bg-[#dc5f00]/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Export IFC
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex-1">
          <DesignViews
            dimensions={dimensions}
            categoryId={category.id}
          />
        </div>
      </div>

      <div className={`fixed right-0 top-0 bottom-0 w-[360px] bg-[#111] border-l border-[#515151] flex flex-col transition-transform ${sidebarCollapsed ? 'translate-x-full' : ''}`}>
        <div className="flex items-center border-b border-[#515151]">
          {(['parameters', 'materials', 'history'] as SidebarTab[]).map(tab => {
            const icons = {
              parameters: Settings2,
              materials: Palette,
              history: History
            }
            const Icon = icons[tab]

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-[#dc5f00] border-b-2 border-[#dc5f00] bg-[#dc5f00]/5'
                    : 'text-[#a3a1a1] hover:text-white'
                }`}
              >
                <Icon size={16} />
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            )
          })}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'parameters' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-[#a3a1a1]">Dimensions</h3>

              {category.dimensions.map(dim => {
                const value = dimensions[dim.key] ?? dim.default
                const pct = ((value - dim.min) / (dim.max - dim.min)) * 100

                return (
                  <div key={dim.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm">{dim.label}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={value}
                          onChange={(e) => handleDimensionChange(dim.key, parseFloat(e.target.value) || dim.default)}
                          min={dim.min}
                          max={dim.max}
                          step={dim.step || 0.25}
                          className="w-20 px-2 py-1 bg-[#1a1b1f] border border-[#515151] rounded text-sm text-right focus:outline-none focus:border-[#dc5f00]"
                        />
                        <span className="text-xs text-[#a3a1a1] w-6">{dim.unit}</span>
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="range"
                        value={value}
                        onChange={(e) => handleDimensionChange(dim.key, parseFloat(e.target.value))}
                        min={dim.min}
                        max={dim.max}
                        step={dim.step || 0.25}
                        className="w-full h-2 bg-[#515151]/30 rounded-full appearance-none cursor-pointer accent-[#dc5f00]"
                      />
                      <div
                        className="absolute top-0 left-0 h-2 bg-[#dc5f00] rounded-full pointer-events-none"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-[#a3a1a1]">
                      <span>{dim.min}{dim.unit}</span>
                      <span>{dim.max}{dim.unit}</span>
                    </div>
                  </div>
                )
              })}

              {constraints.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-[#a3a1a1] mb-3">Constraints</h3>
                  <div className="space-y-2">
                    {constraints.map(c => {
                      const violation = validationResult.errors.find(e => e.constraintId === c.id)
                        || validationResult.warnings.find(w => w.constraintId === c.id)

                      return (
                        <div
                          key={c.id}
                          className={`p-3 rounded-lg border ${
                            violation
                              ? c.severity === 'error'
                                ? 'bg-red-500/10 border-red-500/30'
                                : 'bg-yellow-500/10 border-yellow-500/30'
                              : 'bg-green-500/10 border-green-500/30'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {violation ? (
                              <AlertTriangle size={14} className={c.severity === 'error' ? 'text-red-400' : 'text-yellow-400'} />
                            ) : (
                              <CheckCircle size={14} className="text-green-400" />
                            )}
                            <span className="text-sm font-medium">{c.name}</span>
                          </div>
                          <code className="text-xs text-[#a3a1a1] mt-1 block">{c.expression}</code>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="mt-6 p-4 bg-[#1a1b1f] border border-[#515151] rounded-lg">
                <h4 className="text-sm font-medium mb-2">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleAddConstraint(
                      'Min Width Check',
                      `${category.dimensions[0]?.key || 'width'} >= 12`,
                      'error'
                    )}
                    className="px-3 py-2 text-xs bg-[#515151]/30 hover:bg-[#515151]/50 rounded-lg transition-colors"
                  >
                    + Width Constraint
                  </button>
                  <button
                    onClick={() => {
                      const dims = category.dimensions
                      for (const dim of dims) {
                        handleDimensionChange(dim.key, dim.default)
                      }
                    }}
                    className="px-3 py-2 text-xs bg-[#515151]/30 hover:bg-[#515151]/50 rounded-lg transition-colors"
                  >
                    Reset Defaults
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'materials' && (
            <MaterialEditor
              projectId={projectId}
              selectedMaterialId={selectedMaterialId}
              onSelectMaterial={(m) => setSelectedMaterialId(m.id)}
              onMaterialChange={setMaterials}
            />
          )}

          {activeTab === 'history' && (
            <VersionHistory
              projectId={projectId}
              currentSnapshot={currentSnapshot}
              onRestore={handleRestoreVersion}
            />
          )}
        </div>
      </div>

      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className={`fixed z-10 p-2 bg-[#1a1b1f] border border-[#515151] rounded-lg hover:border-[#dc5f00] transition-all ${
          sidebarCollapsed ? 'right-4 top-1/2 -translate-y-1/2' : 'right-[372px] top-1/2 -translate-y-1/2'
        }`}
      >
        {sidebarCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
      </button>
    </div>
  )
}
