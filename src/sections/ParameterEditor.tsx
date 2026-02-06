import { useState } from 'react'
import { Building2, Tag, DollarSign, Ruler, ToggleLeft, ChevronDown, Check } from 'lucide-react'

interface ParameterEditorProps {
  parameters: {
    manufacturer: string
    model: string
    cost: string
    seatHeight: number
    overallHeight: number
    overallWidth: number
    depth: number
    hasArms: boolean
    baseType: string
  }
  setParameters: React.Dispatch<React.SetStateAction<{
    manufacturer: string
    model: string
    cost: string
    seatHeight: number
    overallHeight: number
    overallWidth: number
    depth: number
    hasArms: boolean
    baseType: string
  }>>
}

const ParameterEditor = ({ parameters, setParameters }: ParameterEditorProps) => {
  const [activeTab, setActiveTab] = useState<'type' | 'instance'>('type')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const baseTypes = ['5-Star', '4-Leg', 'Sled', 'Pedestal']

  return (
    <section className="py-24 bg-[#0a0a0a]">
      <div className="max-w-[1280px] mx-auto px-5">
        {/* Section Header */}
        <div className="text-center mb-12 scroll-animate">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            Configure <span className="text-[#dc5f00]">Family Parameters</span>
          </h2>
          <p className="text-[#a3a1a1] max-w-2xl mx-auto">
            Set dimensions and BIM data for your Revit family. These parameters 
            will be editable in Revit.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Parameter Form */}
          <div className="lg:col-span-2 scroll-animate">
            <div className="bg-[#1a1b1f] border border-[#515151] rounded-lg overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-[#515151]">
                <button
                  onClick={() => setActiveTab('type')}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'type'
                      ? 'bg-[#dc5f00] text-white'
                      : 'text-[#a3a1a1] hover:text-white hover:bg-[#515151]/30'
                  }`}
                >
                  Type Parameters
                </button>
                <button
                  onClick={() => setActiveTab('instance')}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'instance'
                      ? 'bg-[#dc5f00] text-white'
                      : 'text-[#a3a1a1] hover:text-white hover:bg-[#515151]/30'
                  }`}
                >
                  Instance Parameters
                </button>
              </div>

              {/* Form Content */}
              <div className="p-6">
                {activeTab === 'type' ? (
                  <div className="space-y-6">
                    {/* Manufacturer Info */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="flex items-center gap-2 text-sm text-[#a3a1a1] mb-2">
                          <Building2 size={16} />
                          Manufacturer
                        </label>
                        <input
                          type="text"
                          value={parameters.manufacturer}
                          onChange={(e) => setParameters(prev => ({ ...prev, manufacturer: e.target.value }))}
                          placeholder="e.g., Herman Miller"
                          className="input-dark w-full rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm text-[#a3a1a1] mb-2">
                          <Tag size={16} />
                          Model
                        </label>
                        <input
                          type="text"
                          value={parameters.model}
                          onChange={(e) => setParameters(prev => ({ ...prev, model: e.target.value }))}
                          placeholder="e.g., Aeron Chair"
                          className="input-dark w-full rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Cost */}
                    <div>
                      <label className="flex items-center gap-2 text-sm text-[#a3a1a1] mb-2">
                        <DollarSign size={16} />
                        Cost
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666]">$</span>
                        <input
                          type="number"
                          value={parameters.cost}
                          onChange={(e) => setParameters(prev => ({ ...prev, cost: e.target.value }))}
                          placeholder="0.00"
                          className="input-dark w-full rounded-lg pl-8"
                        />
                      </div>
                    </div>

                    {/* Dimensions */}
                    <div className="border-t border-[#515151] pt-6">
                      <h4 className="flex items-center gap-2 text-sm font-medium mb-4">
                        <Ruler size={16} className="text-[#dc5f00]" />
                        Dimensions (inches)
                      </h4>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-sm text-[#a3a1a1] mb-2 block">
                            Seat Height
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min="12"
                              max="24"
                              step="0.5"
                              value={parameters.seatHeight}
                              onChange={(e) => setParameters(prev => ({ ...prev, seatHeight: parseFloat(e.target.value) }))}
                              className="flex-1 accent-[#dc5f00]"
                            />
                            <input
                              type="number"
                              value={parameters.seatHeight}
                              onChange={(e) => setParameters(prev => ({ ...prev, seatHeight: parseFloat(e.target.value) || 0 }))}
                              className="input-dark w-20 rounded-lg text-center"
                            />
                            <span className="text-[#666]">"</span>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm text-[#a3a1a1] mb-2 block">
                            Overall Height
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min="24"
                              max="48"
                              step="0.5"
                              value={parameters.overallHeight}
                              onChange={(e) => setParameters(prev => ({ ...prev, overallHeight: parseFloat(e.target.value) }))}
                              className="flex-1 accent-[#dc5f00]"
                            />
                            <input
                              type="number"
                              value={parameters.overallHeight}
                              onChange={(e) => setParameters(prev => ({ ...prev, overallHeight: parseFloat(e.target.value) || 0 }))}
                              className="input-dark w-20 rounded-lg text-center"
                            />
                            <span className="text-[#666]">"</span>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm text-[#a3a1a1] mb-2 block">
                            Overall Width
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min="18"
                              max="36"
                              step="0.5"
                              value={parameters.overallWidth}
                              onChange={(e) => setParameters(prev => ({ ...prev, overallWidth: parseFloat(e.target.value) }))}
                              className="flex-1 accent-[#dc5f00]"
                            />
                            <input
                              type="number"
                              value={parameters.overallWidth}
                              onChange={(e) => setParameters(prev => ({ ...prev, overallWidth: parseFloat(e.target.value) || 0 }))}
                              className="input-dark w-20 rounded-lg text-center"
                            />
                            <span className="text-[#666]">"</span>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm text-[#a3a1a1] mb-2 block">
                            Depth
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min="18"
                              max="36"
                              step="0.5"
                              value={parameters.depth}
                              onChange={(e) => setParameters(prev => ({ ...prev, depth: parseFloat(e.target.value) }))}
                              className="flex-1 accent-[#dc5f00]"
                            />
                            <input
                              type="number"
                              value={parameters.depth}
                              onChange={(e) => setParameters(prev => ({ ...prev, depth: parseFloat(e.target.value) || 0 }))}
                              className="input-dark w-20 rounded-lg text-center"
                            />
                            <span className="text-[#666]">"</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Options */}
                    <div className="border-t border-[#515151] pt-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="flex items-center gap-2 text-sm text-[#a3a1a1] mb-3">
                            <ToggleLeft size={16} />
                            Has Arms
                          </label>
                          <button
                            onClick={() => setParameters(prev => ({ ...prev, hasArms: !prev.hasArms }))}
                            className={`relative w-14 h-7 rounded-full transition-colors ${
                              parameters.hasArms ? 'bg-[#dc5f00]' : 'bg-[#515151]'
                            }`}
                          >
                            <span
                              className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                                parameters.hasArms ? 'translate-x-8' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                        <div>
                          <label className="text-sm text-[#a3a1a1] mb-3 block">
                            Base Type
                          </label>
                          <div className="relative">
                            <select
                              value={parameters.baseType}
                              onChange={(e) => setParameters(prev => ({ ...prev, baseType: e.target.value }))}
                              className="input-dark w-full rounded-lg appearance-none cursor-pointer"
                            >
                              {baseTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666] pointer-events-none" size={16} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm text-[#a3a1a1] mb-2 block">
                        Mark
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., CH-01"
                        className="input-dark w-full rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-[#a3a1a1] mb-2 block">
                        Comments
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Add any notes or comments..."
                        className="input-dark w-full rounded-lg resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-[#a3a1a1] mb-2 block">
                        Finish
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Black Mesh"
                        className="input-dark w-full rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-[#515151] flex items-center justify-between">
                <p className="text-sm text-[#666]">
                  Changes apply to 3D preview automatically
                </p>
                <button
                  onClick={handleSave}
                  className={`btn-primary flex items-center gap-2 ${saved ? 'bg-green-500 border-green-500' : ''}`}
                >
                  {saved ? (
                    <>
                      <Check size={18} />
                      Saved
                    </>
                  ) : (
                    'Save Parameters'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Help Panel */}
          <div className="scroll-animate space-y-6">
            <div className="p-6 bg-[#1a1b1f] border border-[#515151] rounded-lg">
              <h4 className="font-medium mb-4">Parameter Types</h4>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-[#dc5f00] font-medium mb-1">Type Parameters</p>
                  <p className="text-[#a3a1a1]">
                    Apply to all instances of this family type. Changes affect all 
                    placed instances.
                  </p>
                </div>
                <div>
                  <p className="text-[#dc5f00] font-medium mb-1">Instance Parameters</p>
                  <p className="text-[#a3a1a1]">
                    Unique to each placed instance. Use for marks, comments, and 
                    instance-specific data.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-[#1a1b1f] border border-[#515151] rounded-lg">
              <h4 className="font-medium mb-4">BIM Standards</h4>
              <ul className="space-y-2 text-sm text-[#a3a1a1]">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-green-500" />
                  Autodesk Revit Content Style Guide
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-green-500" />
                  NBS BIM Toolkit parameters
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-green-500" />
                  COBie data requirements
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-green-500" />
                  ISO 19650 information standards
                </li>
              </ul>
            </div>

            <div className="p-6 bg-[#dc5f00]/10 border border-[#dc5f00]/30 rounded-lg">
              <p className="text-sm text-[#a3a1a1]">
                <span className="text-[#dc5f00] font-medium">Pro Tip:</span> Use 
                consistent naming conventions for manufacturer and model parameters 
                to enable accurate cost estimation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ParameterEditor
