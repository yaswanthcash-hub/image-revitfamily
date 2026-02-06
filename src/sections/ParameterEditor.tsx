import { useState } from 'react'
import { Building2, Tag, DollarSign, Ruler, Check, Flame, Zap, Thermometer, Droplets, Shield, Weight, Gauge } from 'lucide-react'
import type { RevitFamilyCategory, Discipline } from '../data/revit-categories'

interface ParameterEditorProps {
  category: RevitFamilyCategory
  dimensions: Record<string, number>
  setDimensions: React.Dispatch<React.SetStateAction<Record<string, number>>>
}

interface IdentityData {
  manufacturer: string
  model: string
  cost: string
  fireRating?: string
  material?: string
  voltage?: string
  wattage?: string
  flowRate?: string
  pressure?: string
  loadCapacity?: string
  thermalResistance?: string
}

const disciplineFields: Record<Discipline, { key: keyof IdentityData; label: string; icon: React.ReactNode; placeholder: string; unit?: string }[]> = {
  architectural: [
    { key: 'fireRating', label: 'Fire Rating', icon: <Flame size={16} />, placeholder: 'e.g., 90 min', unit: 'min' },
    { key: 'thermalResistance', label: 'U-Value', icon: <Thermometer size={16} />, placeholder: 'e.g., 0.28', unit: 'W/m²K' },
  ],
  structural: [
    { key: 'material', label: 'Structural Material', icon: <Shield size={16} />, placeholder: 'e.g., A992 Steel' },
    { key: 'loadCapacity', label: 'Load Capacity', icon: <Weight size={16} />, placeholder: 'e.g., 500', unit: 'kN' },
  ],
  mechanical: [
    { key: 'flowRate', label: 'Airflow Rate', icon: <Gauge size={16} />, placeholder: 'e.g., 200', unit: 'CFM' },
    { key: 'pressure', label: 'Static Pressure', icon: <Gauge size={16} />, placeholder: 'e.g., 0.5', unit: 'in. w.g.' },
  ],
  electrical: [
    { key: 'voltage', label: 'Voltage', icon: <Zap size={16} />, placeholder: 'e.g., 120', unit: 'V' },
    { key: 'wattage', label: 'Wattage', icon: <Zap size={16} />, placeholder: 'e.g., 60', unit: 'W' },
  ],
  plumbing: [
    { key: 'flowRate', label: 'Flow Rate', icon: <Droplets size={16} />, placeholder: 'e.g., 1.6', unit: 'GPM' },
    { key: 'pressure', label: 'Operating Pressure', icon: <Gauge size={16} />, placeholder: 'e.g., 60', unit: 'PSI' },
  ],
}

const ParameterEditor = ({ category, dimensions, setDimensions }: ParameterEditorProps) => {
  const [activeTab, setActiveTab] = useState<'dimensions' | 'identity' | 'connectors'>('dimensions')
  const [identity, setIdentity] = useState<IdentityData>({ manufacturer: '', model: '', cost: '' })
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const extraFields = disciplineFields[category.discipline] || []
  const hasConnectors = category.connectorTypes && category.connectorTypes.length > 0

  return (
    <section className="py-24 bg-[#0a0a0a]">
      <div className="max-w-[1280px] mx-auto px-5">
        <div className="text-center mb-12 scroll-animate">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            Configure <span className="text-[#dc5f00]">{category.name} Parameters</span>
          </h2>
          <p className="text-[#a3a1a1] max-w-2xl mx-auto">
            Adjust dimensions and set BIM data. Parameters will be editable in Revit.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 scroll-animate">
            <div className="bg-[#1a1b1f] border border-[#515151] rounded-lg overflow-hidden">
              <div className="flex border-b border-[#515151]">
                <button
                  onClick={() => setActiveTab('dimensions')}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'dimensions'
                      ? 'bg-[#dc5f00] text-white'
                      : 'text-[#a3a1a1] hover:text-white hover:bg-[#515151]/30'
                  }`}
                >
                  Dimensions
                </button>
                <button
                  onClick={() => setActiveTab('identity')}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'identity'
                      ? 'bg-[#dc5f00] text-white'
                      : 'text-[#a3a1a1] hover:text-white hover:bg-[#515151]/30'
                  }`}
                >
                  Identity Data
                </button>
                {hasConnectors && (
                  <button
                    onClick={() => setActiveTab('connectors')}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                      activeTab === 'connectors'
                        ? 'bg-[#dc5f00] text-white'
                        : 'text-[#a3a1a1] hover:text-white hover:bg-[#515151]/30'
                    }`}
                  >
                    Connectors
                  </button>
                )}
              </div>

              <div className="p-6">
                {activeTab === 'dimensions' ? (
                  <div className="space-y-6">
                    <h4 className="flex items-center gap-2 text-sm font-medium">
                      <Ruler size={16} className="text-[#dc5f00]" />
                      {category.name} Dimensions
                    </h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      {category.dimensions.map(dim => (
                        <div key={dim.key}>
                          <label className="text-sm text-[#a3a1a1] mb-2 block">{dim.label}</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={dim.min}
                              max={dim.max}
                              step={dim.step}
                              value={dimensions[dim.key] ?? dim.default}
                              onChange={(e) => setDimensions(prev => ({ ...prev, [dim.key]: parseFloat(e.target.value) }))}
                              className="flex-1 accent-[#dc5f00]"
                            />
                            <input
                              type="number"
                              value={dimensions[dim.key] ?? dim.default}
                              onChange={(e) => setDimensions(prev => ({ ...prev, [dim.key]: parseFloat(e.target.value) || dim.default }))}
                              className="input-dark w-20 rounded-lg text-center"
                            />
                            <span className="text-[#666] text-sm">{dim.unit}</span>
                          </div>
                          <div className="flex justify-between text-[10px] text-[#515151] mt-1 px-1">
                            <span>{dim.min}{dim.unit}</span>
                            <span>{dim.max}{dim.unit}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : activeTab === 'identity' ? (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="flex items-center gap-2 text-sm text-[#a3a1a1] mb-2">
                          <Building2 size={16} /> Manufacturer
                        </label>
                        <input
                          type="text"
                          value={identity.manufacturer}
                          onChange={(e) => setIdentity(prev => ({ ...prev, manufacturer: e.target.value }))}
                          placeholder="e.g., Herman Miller"
                          className="input-dark w-full rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm text-[#a3a1a1] mb-2">
                          <Tag size={16} /> Model
                        </label>
                        <input
                          type="text"
                          value={identity.model}
                          onChange={(e) => setIdentity(prev => ({ ...prev, model: e.target.value }))}
                          placeholder={`e.g., ${category.suggestedTemplate}`}
                          className="input-dark w-full rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm text-[#a3a1a1] mb-2">
                        <DollarSign size={16} /> Cost
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666]">$</span>
                        <input
                          type="number"
                          value={identity.cost}
                          onChange={(e) => setIdentity(prev => ({ ...prev, cost: e.target.value }))}
                          placeholder="0.00"
                          className="input-dark w-full rounded-lg pl-8"
                        />
                      </div>
                    </div>

                    {extraFields.length > 0 && (
                      <div className="border-t border-[#515151] pt-4">
                        <h4 className="text-sm font-medium mb-4 capitalize">{category.discipline} Parameters</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          {extraFields.map(field => (
                            <div key={field.key}>
                              <label className="flex items-center gap-2 text-sm text-[#a3a1a1] mb-2">
                                {field.icon} {field.label}
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={identity[field.key] || ''}
                                  onChange={(e) => setIdentity(prev => ({ ...prev, [field.key]: e.target.value }))}
                                  placeholder={field.placeholder}
                                  className="input-dark w-full rounded-lg"
                                />
                                {field.unit && (
                                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666] text-sm">
                                    {field.unit}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="border-t border-[#515151] pt-4">
                      <h4 className="text-sm font-medium mb-3">BIM Classification</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-[#111] rounded-lg">
                          <p className="text-[10px] text-[#666] uppercase">Revit Category</p>
                          <p className="text-sm font-medium">{category.revitCategory}</p>
                        </div>
                        <div className="p-3 bg-[#111] rounded-lg">
                          <p className="text-[10px] text-[#666] uppercase">OmniClass</p>
                          <p className="text-sm font-medium">{category.omniClass}</p>
                        </div>
                        <div className="p-3 bg-[#111] rounded-lg">
                          <p className="text-[10px] text-[#666] uppercase">Uniclass 2015</p>
                          <p className="text-sm font-medium">{category.uniclass}</p>
                        </div>
                        <div className="p-3 bg-[#111] rounded-lg">
                          <p className="text-[10px] text-[#666] uppercase">IFC Entity</p>
                          <p className="text-sm font-medium">{category.ifcEntity}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <h4 className="text-sm font-medium">MEP Connector Configuration</h4>
                    <p className="text-sm text-[#a3a1a1]">
                      Define connection points for MEP systems integration.
                    </p>
                    <div className="space-y-3">
                      {category.connectorTypes?.map((connector, index) => (
                        <div key={connector} className="p-4 bg-[#111] rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#dc5f00]/20 flex items-center justify-center text-[#dc5f00] text-sm font-medium">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{connector}</p>
                              <p className="text-xs text-[#666]">System connector</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-1 bg-green-500/20 text-green-500 rounded">Active</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 bg-[#dc5f00]/10 border border-[#dc5f00]/30 rounded-lg">
                      <p className="text-sm text-[#dc5f00]">
                        Connectors enable automatic routing and system connectivity in Revit MEP workflows.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-[#515151] flex items-center justify-between">
                <p className="text-sm text-[#666]">Changes apply to 3D preview automatically</p>
                <button
                  onClick={handleSave}
                  className={`btn-primary flex items-center gap-2 ${saved ? 'bg-green-500 border-green-500' : ''}`}
                >
                  {saved ? <><Check size={18} /> Saved</> : 'Save Parameters'}
                </button>
              </div>
            </div>
          </div>

          <div className="scroll-animate space-y-6">
            <div className="p-6 bg-[#1a1b1f] border border-[#515151] rounded-lg">
              <h4 className="font-medium mb-4">Subcategories</h4>
              <div className="flex flex-wrap gap-2">
                {category.subcategories.map(sub => (
                  <span key={sub} className="text-xs px-3 py-1.5 bg-[#dc5f00]/10 text-[#dc5f00] rounded-full">
                    {sub}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-6 bg-[#1a1b1f] border border-[#515151] rounded-lg">
              <h4 className="font-medium mb-4">Available Templates</h4>
              <div className="space-y-2">
                {category.templates.map(tmpl => (
                  <div key={tmpl} className="flex items-center gap-2 text-sm text-[#a3a1a1]">
                    <div className={`w-2 h-2 rounded-full ${tmpl === category.suggestedTemplate ? 'bg-[#dc5f00]' : 'bg-[#515151]'}`} />
                    <span className={tmpl === category.suggestedTemplate ? 'text-[#dc5f00] font-medium' : ''}>
                      {tmpl}
                    </span>
                    {tmpl === category.suggestedTemplate && (
                      <span className="text-[10px] bg-[#dc5f00]/20 text-[#dc5f00] px-2 py-0.5 rounded">Best Match</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {category.hostBased && (
              <div className="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <h4 className="font-medium mb-2 text-yellow-500">Host-Based Family</h4>
                <p className="text-sm text-yellow-500/80">
                  This family requires a host element (wall, floor, or ceiling) for placement in Revit.
                </p>
              </div>
            )}

            <div className="p-6 bg-[#1a1b1f] border border-[#515151] rounded-lg">
              <h4 className="font-medium mb-4">BIM Standards</h4>
              <ul className="space-y-2 text-sm text-[#a3a1a1]">
                {['Autodesk Revit Content Style Guide', 'NBS BIM Toolkit parameters', 'COBie data requirements', 'ISO 19650 information standards'].map(std => (
                  <li key={std} className="flex items-center gap-2">
                    <Check size={14} className="text-green-500" />
                    {std}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ParameterEditor
