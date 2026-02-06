import { useState } from 'react'
import { Ruler, Building2, Palette, Globe, ChevronDown, SlidersHorizontal, type LucideIcon } from 'lucide-react'
import type { FurnitureCategory } from '../data/furniture-categories'
import { revitParameterGroups } from '../data/furniture-categories'

type TabId = 'dimensions' | 'identity' | 'materials' | 'standards'

interface ParameterEditorProps {
  category: FurnitureCategory
  dimensions: Record<string, number>
  setDimensions: (dims: Record<string, number>) => void
  materials: Record<string, string>
  setMaterials: (mats: Record<string, string>) => void
  identityData: Record<string, string>
  setIdentityData: (data: Record<string, string>) => void
}

const getMaterialSwatch = (matName: string): string => {
  if (matName.includes('Black')) return '#1a1a1a'
  if (matName.includes('Charcoal') || matName.includes('Gray') || matName.includes('Putty')) return '#5a5a5a'
  if (matName.includes('Navy')) return '#1a2a4a'
  if (matName.includes('White')) return '#e0e0e0'
  if (matName.includes('Walnut') || matName.includes('Cognac')) return '#5c3a1e'
  if (matName.includes('Oak') || matName.includes('Maple') || matName.includes('Natural')) return '#c49a6c'
  if (matName.includes('Cherry') || matName.includes('Ebony')) return '#3a1a10'
  if (matName.includes('Chrome') || matName.includes('Polished') || matName.includes('Aluminum') || matName.includes('Silver')) return '#b8b8b8'
  if (matName.includes('Brass') || matName.includes('Satin')) return '#b5a642'
  if (matName.includes('Nickel')) return '#a8a8a8'
  if (matName.includes('Emerald')) return '#2d6a4f'
  if (matName.includes('Marble')) return '#eae8e0'
  if (matName.includes('Copper')) return '#b87333'
  if (matName.includes('Bamboo')) return '#d4b896'
  if (matName.includes('Glass') && matName.includes('Clear')) return '#c8e0f0'
  if (matName.includes('Glass') && matName.includes('Frosted')) return '#dde8ee'
  if (matName.includes('Glass') && matName.includes('Amber')) return '#d4a040'
  if (matName.includes('Opal')) return '#f0f0e8'
  if (matName.includes('Acrylic')) return '#e0e8ee'
  if (matName.includes('Linen')) return '#d4c8b0'
  if (matName.includes('Velvet')) return '#3a2040'
  if (matName.includes('Mesh')) return '#3a3a3a'
  if (matName.includes('Fabric')) return '#4a4a50'
  if (matName.includes('Laminate')) return '#c0c0c0'
  if (matName.includes('Rubber') || matName.includes('Vinyl') || matName.includes('Polyurethane') || matName.includes('Nylon')) return '#2a2a2a'
  return '#555'
}

const tabs: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: 'dimensions', label: 'Dimensions', icon: Ruler },
  { id: 'identity', label: 'Identity', icon: Building2 },
  { id: 'materials', label: 'Materials', icon: Palette },
  { id: 'standards', label: 'IFC / Standards', icon: Globe },
]

const ParameterEditor = ({
  category, dimensions, setDimensions, materials, setMaterials, identityData, setIdentityData,
}: ParameterEditorProps) => {
  const [activeTab, setActiveTab] = useState<TabId>('dimensions')

  const updateDimension = (key: string, value: number) => {
    setDimensions({ ...dimensions, [key]: value })
  }

  const updateMaterial = (key: string, value: string) => {
    setMaterials({ ...materials, [key]: value })
  }

  const updateIdentity = (key: string, value: string) => {
    setIdentityData({ ...identityData, [key]: value })
  }

  const filledIdentityCount = Object.values(identityData).filter(v => v.trim()).length
  const totalIdentity = revitParameterGroups.identity.params.length + revitParameterGroups.cost.params.length

  return (
    <section className="py-24 bg-[#0a0a0a]">
      <div className="max-w-[1280px] mx-auto px-5">
        <div className="text-center mb-12 scroll-animate">
          <div className="inline-flex items-center gap-2 text-[#dc5f00] text-sm uppercase tracking-widest font-medium mb-4">
            <SlidersHorizontal size={16} />
            <span>Step 5 of 6</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            Configure <span className="text-[#dc5f00]">Family Parameters</span>
          </h2>
          <p className="text-[#a3a1a1] max-w-2xl mx-auto">
            Set Revit parameters for {category.name}. All values follow industry standards
            and become editable inside Revit.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 scroll-animate">
            <div className="bg-[#1a1b1f] border border-[#515151] rounded-lg overflow-hidden">
              <div className="flex border-b border-[#515151]">
                {tabs.map(tab => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-[#dc5f00] text-white'
                          : 'text-[#a3a1a1] hover:text-white hover:bg-[#515151]/30'
                      }`}
                    >
                      <Icon size={15} />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  )
                })}
              </div>

              <div className="p-6">
                {activeTab === 'dimensions' && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-[#a3a1a1]">
                        {category.name} Dimensions
                      </h4>
                      <span className="text-xs text-[#515151]">
                        {category.dimensions.length} parameters
                      </span>
                    </div>
                    {category.dimensions.map(dim => (
                      <div key={dim.key}>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-sm text-[#a3a1a1]">{dim.label}</label>
                          <span className="text-[10px] text-[#515151]">
                            {dim.min}{dim.unit} - {dim.max}{dim.unit}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min={dim.min}
                            max={dim.max}
                            step={dim.step}
                            value={dimensions[dim.key] ?? dim.default}
                            onChange={(e) => updateDimension(dim.key, parseFloat(e.target.value))}
                            className="flex-1 accent-[#dc5f00]"
                          />
                          <input
                            type="number"
                            min={dim.min}
                            max={dim.max}
                            step={dim.step}
                            value={dimensions[dim.key] ?? dim.default}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value)
                              if (!isNaN(val)) updateDimension(dim.key, val)
                            }}
                            className="input-dark w-20 rounded-lg text-center"
                          />
                          <span className="text-[#666] w-4 text-sm">{dim.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'identity' && (
                  <div className="space-y-6">
                    {[revitParameterGroups.identity, revitParameterGroups.cost].map(group => (
                      <div key={group.label}>
                        <h4 className="text-sm font-medium text-[#dc5f00] mb-4">{group.label}</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          {group.params.map(param => (
                            <div key={param.key} className={param.type === 'textarea' ? 'md:col-span-2' : ''}>
                              <label className="text-sm text-[#a3a1a1] mb-1.5 block">{param.label}</label>
                              {param.type === 'textarea' ? (
                                <textarea
                                  rows={3}
                                  value={identityData[param.key] || ''}
                                  onChange={(e) => updateIdentity(param.key, e.target.value)}
                                  placeholder={param.placeholder}
                                  className="input-dark w-full rounded-lg resize-none"
                                />
                              ) : param.type === 'currency' ? (
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]">$</span>
                                  <input
                                    type="number"
                                    value={identityData[param.key] || ''}
                                    onChange={(e) => updateIdentity(param.key, e.target.value)}
                                    placeholder={param.placeholder}
                                    className="input-dark w-full rounded-lg pl-7"
                                  />
                                </div>
                              ) : (
                                <input
                                  type={param.type === 'number' ? 'number' : 'text'}
                                  value={identityData[param.key] || ''}
                                  onChange={(e) => updateIdentity(param.key, e.target.value)}
                                  placeholder={param.placeholder}
                                  className="input-dark w-full rounded-lg"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'materials' && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-[#a3a1a1]">
                        Material Assignments
                      </h4>
                      <span className="text-xs text-[#515151]">
                        {category.materials.length} material slots
                      </span>
                    </div>
                    {category.materials.map(mat => {
                      const currentValue = materials[mat.key] || mat.default
                      return (
                        <div key={mat.key}>
                          <label className="text-sm text-[#a3a1a1] mb-2 block">{mat.label}</label>
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-lg border border-[#515151] flex-shrink-0"
                              style={{ backgroundColor: getMaterialSwatch(currentValue) }}
                            />
                            <div className="relative flex-1">
                              <select
                                value={currentValue}
                                onChange={(e) => updateMaterial(mat.key, e.target.value)}
                                className="input-dark w-full rounded-lg appearance-none cursor-pointer pr-10"
                              >
                                {mat.options.map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] pointer-events-none" size={16} />
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {mat.options.map(opt => (
                              <button
                                key={opt}
                                onClick={() => updateMaterial(mat.key, opt)}
                                className={`w-6 h-6 rounded border transition-all ${
                                  currentValue === opt
                                    ? 'border-[#dc5f00] ring-1 ring-[#dc5f00]/50 scale-110'
                                    : 'border-[#515151]/50 hover:border-[#515151]'
                                }`}
                                style={{ backgroundColor: getMaterialSwatch(opt) }}
                                title={opt}
                              />
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {activeTab === 'standards' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-[#dc5f00] mb-4">
                        {revitParameterGroups.classification.label}
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        {revitParameterGroups.classification.params.map(param => {
                          const defaultVal = param.key === 'omniClassNumber' ? category.omniClass
                            : param.key === 'uniclassCode' ? category.uniclass
                            : param.key === 'ifcExportAs' ? category.ifcEntity
                            : ''
                          return (
                            <div key={param.key}>
                              <label className="text-sm text-[#a3a1a1] mb-1.5 block">{param.label}</label>
                              <input
                                type="text"
                                value={identityData[param.key] || defaultVal}
                                onChange={(e) => updateIdentity(param.key, e.target.value)}
                                placeholder={param.placeholder}
                                className="input-dark w-full rounded-lg"
                              />
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-[#dc5f00] mb-4">
                        {revitParameterGroups.sustainability.label}
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        {revitParameterGroups.sustainability.params.map(param => (
                          <div key={param.key}>
                            <label className="text-sm text-[#a3a1a1] mb-1.5 block">{param.label}</label>
                            <input
                              type={param.type === 'number' ? 'number' : 'text'}
                              value={identityData[param.key] || ''}
                              onChange={(e) => updateIdentity(param.key, e.target.value)}
                              placeholder={param.placeholder}
                              className="input-dark w-full rounded-lg"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-[#111] border border-[#515151]/50 rounded-lg">
                      <h4 className="text-sm font-medium mb-3">Auto-Populated from Category</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[#666]">Revit Category</span>
                          <span>{category.revitCategory}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#666]">OmniClass</span>
                          <span>{category.omniClass}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#666]">Uniclass 2015</span>
                          <span>{category.uniclass}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#666]">IFC Entity</span>
                          <span>{category.ifcEntity}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="scroll-animate space-y-5">
            <div className="p-5 bg-[#1a1b1f] border border-[#515151] rounded-lg">
              <h4 className="font-medium text-sm mb-4">Parameter Summary</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#666]">Dimensions</span>
                  <span className="text-[#dc5f00]">{category.dimensions.length} params</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#666]">Identity Data</span>
                  <span className={filledIdentityCount > 0 ? 'text-green-500' : 'text-[#515151]'}>
                    {filledIdentityCount}/{totalIdentity} filled
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#666]">Materials</span>
                  <span className="text-[#dc5f00]">{category.materials.length} slots</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#666]">Subcategories</span>
                  <span>{category.subcategories.length}</span>
                </div>
              </div>
            </div>

            <div className="p-5 bg-[#1a1b1f] border border-[#515151] rounded-lg">
              <h4 className="font-medium text-sm mb-4">Type vs. Instance</h4>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-[#dc5f00] font-medium mb-1">Type Parameters</p>
                  <p className="text-[#a3a1a1] text-xs">
                    Shared across all instances. Dimensions, materials, identity data,
                    and cost parameters live here.
                  </p>
                </div>
                <div>
                  <p className="text-[#dc5f00] font-medium mb-1">Instance Parameters</p>
                  <p className="text-[#a3a1a1] text-xs">
                    Unique per placement. Mark, comments, and location-specific
                    data are set in Revit on each instance.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 bg-[#1a1b1f] border border-[#515151] rounded-lg">
              <h4 className="font-medium text-sm mb-3">BIM Standards</h4>
              <ul className="space-y-2 text-xs text-[#a3a1a1]">
                {[
                  'Autodesk Revit Content Style Guide',
                  'NBS BIM Toolkit parameters',
                  'COBie data requirements',
                  'ISO 19650 information standards',
                  'IFC 4.3 property sets',
                ].map(standard => (
                  <li key={standard} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                    {standard}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-[#dc5f00]/10 border border-[#dc5f00]/30 rounded-lg">
              <p className="text-xs text-[#a3a1a1]">
                <span className="text-[#dc5f00] font-medium">Tip:</span> Fill Identity Data
                parameters before export. Manufacturer, model, and cost are required
                for COBie compliance and FM handover.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ParameterEditor
