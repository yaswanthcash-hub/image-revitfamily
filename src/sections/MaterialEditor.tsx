import { useState, useEffect, useMemo } from 'react'
import { Palette, Plus, Copy, Trash2, Search, ChevronDown } from 'lucide-react'
import type { Material, MaterialAppearance } from '../lib/materials'
import {
  MATERIAL_CATEGORIES,
  fetchLibraryMaterials,
  fetchProjectMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  duplicateMaterialToProject,
  getMaterialColor
} from '../lib/materials'

interface MaterialEditorProps {
  projectId: string | null
  selectedMaterialId?: string
  onSelectMaterial?: (material: Material) => void
  onMaterialChange?: (materials: Material[]) => void
}

const DEFAULT_APPEARANCE: MaterialAppearance = {
  color: '#808080',
  roughness: 0.5,
  metalness: 0.0
}

export default function MaterialEditor({
  projectId,
  selectedMaterialId,
  onSelectMaterial,
  onMaterialChange
}: MaterialEditorProps) {
  const [libraryMaterials, setLibraryMaterials] = useState<Material[]>([])
  const [projectMaterials, setProjectMaterials] = useState<Material[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    category: 'Generic' as Material['category'],
    appearance: { ...DEFAULT_APPEARANCE }
  })

  useEffect(() => {
    loadMaterials()
  }, [projectId])

  async function loadMaterials() {
    const library = await fetchLibraryMaterials()
    setLibraryMaterials(library)

    if (projectId) {
      const project = await fetchProjectMaterials(projectId)
      setProjectMaterials(project)
      onMaterialChange?.(project)
    }
  }

  const filteredLibraryMaterials = useMemo(() => {
    return libraryMaterials.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [libraryMaterials, searchQuery, selectedCategory])

  const filteredProjectMaterials = useMemo(() => {
    return projectMaterials.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [projectMaterials, searchQuery, selectedCategory])

  async function handleCreateMaterial() {
    if (!projectId || !newMaterial.name.trim()) return

    const material = await createMaterial(projectId, {
      name: newMaterial.name,
      category: newMaterial.category,
      appearance: newMaterial.appearance,
      physicalProperties: {},
      identityData: {},
      textureUrl: null
    })

    if (material) {
      setProjectMaterials(prev => [...prev, material])
      onMaterialChange?.([...projectMaterials, material])
      setIsCreating(false)
      setNewMaterial({
        name: '',
        category: 'Generic',
        appearance: { ...DEFAULT_APPEARANCE }
      })
    }
  }

  async function handleDuplicateToProject(material: Material) {
    if (!projectId) return

    const duplicated = await duplicateMaterialToProject(material.id, projectId)
    if (duplicated) {
      setProjectMaterials(prev => [...prev, duplicated])
      onMaterialChange?.([...projectMaterials, duplicated])
    }
  }

  async function handleUpdateMaterial() {
    if (!editingMaterial) return

    const updated = await updateMaterial(editingMaterial.id, {
      name: editingMaterial.name,
      category: editingMaterial.category,
      appearance: editingMaterial.appearance
    })

    if (updated) {
      setProjectMaterials(prev =>
        prev.map(m => m.id === updated.id ? updated : m)
      )
      onMaterialChange?.(projectMaterials.map(m => m.id === updated.id ? updated : m))
      setEditingMaterial(null)
    }
  }

  async function handleDeleteMaterial(materialId: string) {
    const success = await deleteMaterial(materialId)
    if (success) {
      setProjectMaterials(prev => prev.filter(m => m.id !== materialId))
      onMaterialChange?.(projectMaterials.filter(m => m.id !== materialId))
    }
  }

  function renderMaterialSwatch(material: Material, isSelected: boolean, showActions: boolean) {
    const color = getMaterialColor(material)

    return (
      <div
        key={material.id}
        className={`group relative p-3 rounded-lg border transition-all cursor-pointer ${
          isSelected
            ? 'border-[#dc5f00] bg-[#dc5f00]/10'
            : 'border-[#515151] hover:border-[#dc5f00]/50 bg-[#1a1b1f]'
        }`}
        onClick={() => onSelectMaterial?.(material)}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg border border-[#515151]"
            style={{
              background: material.appearance.metalness > 0.5
                ? `linear-gradient(135deg, ${color} 0%, ${adjustBrightness(color, 40)} 50%, ${color} 100%)`
                : color
            }}
          />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{material.name}</div>
            <div className="text-xs text-[#a3a1a1]">{material.category}</div>
          </div>
        </div>

        {showActions && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            {material.isLibrary && projectId && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDuplicateToProject(material)
                }}
                className="p-1.5 bg-[#1a1b1f] border border-[#515151] rounded hover:border-[#dc5f00] transition-colors"
                title="Add to project"
              >
                <Copy size={14} />
              </button>
            )}
            {!material.isLibrary && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingMaterial(material)
                  }}
                  className="p-1.5 bg-[#1a1b1f] border border-[#515151] rounded hover:border-[#dc5f00] transition-colors"
                  title="Edit"
                >
                  <Palette size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteMaterial(material.id)
                  }}
                  className="p-1.5 bg-[#1a1b1f] border border-[#515151] rounded hover:border-red-500 text-red-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a3a1a1]" />
          <input
            type="text"
            placeholder="Search materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#1a1b1f] border border-[#515151] rounded-lg text-sm focus:outline-none focus:border-[#dc5f00]"
          />
        </div>

        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="appearance-none px-3 py-2 pr-8 bg-[#1a1b1f] border border-[#515151] rounded-lg text-sm focus:outline-none focus:border-[#dc5f00]"
          >
            <option value="all">All Categories</option>
            {MATERIAL_CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#a3a1a1] pointer-events-none" />
        </div>
      </div>

      {projectId && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-[#a3a1a1]">Project Materials</h3>
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-[#dc5f00] hover:bg-[#dc5f00]/90 rounded-lg transition-colors"
            >
              <Plus size={14} />
              New
            </button>
          </div>

          {filteredProjectMaterials.length === 0 && !isCreating ? (
            <div className="p-4 text-center text-sm text-[#a3a1a1] border border-dashed border-[#515151] rounded-lg">
              No project materials yet. Create one or copy from library.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {filteredProjectMaterials.map(m =>
                renderMaterialSwatch(m, m.id === selectedMaterialId, true)
              )}
            </div>
          )}
        </div>
      )}

      <div>
        <h3 className="text-sm font-medium text-[#a3a1a1] mb-3">Material Library</h3>
        <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-1">
          {filteredLibraryMaterials.map(m =>
            renderMaterialSwatch(m, m.id === selectedMaterialId, true)
          )}
        </div>
      </div>

      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-md p-6 bg-[#111] border border-[#515151] rounded-xl">
            <h3 className="text-lg font-semibold mb-4">Create Material</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#a3a1a1] mb-1">Name</label>
                <input
                  type="text"
                  value={newMaterial.name}
                  onChange={(e) => setNewMaterial(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#1a1b1f] border border-[#515151] rounded-lg focus:outline-none focus:border-[#dc5f00]"
                  placeholder="Material name"
                />
              </div>

              <div>
                <label className="block text-sm text-[#a3a1a1] mb-1">Category</label>
                <select
                  value={newMaterial.category}
                  onChange={(e) => setNewMaterial(prev => ({ ...prev, category: e.target.value as Material['category'] }))}
                  className="w-full px-3 py-2 bg-[#1a1b1f] border border-[#515151] rounded-lg focus:outline-none focus:border-[#dc5f00]"
                >
                  {MATERIAL_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-[#a3a1a1] mb-1">Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={newMaterial.appearance.color}
                    onChange={(e) => setNewMaterial(prev => ({
                      ...prev,
                      appearance: { ...prev.appearance, color: e.target.value }
                    }))}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newMaterial.appearance.color}
                    onChange={(e) => setNewMaterial(prev => ({
                      ...prev,
                      appearance: { ...prev.appearance, color: e.target.value }
                    }))}
                    className="flex-1 px-3 py-2 bg-[#1a1b1f] border border-[#515151] rounded-lg focus:outline-none focus:border-[#dc5f00] font-mono text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#a3a1a1] mb-1">
                    Roughness: {newMaterial.appearance.roughness.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={newMaterial.appearance.roughness}
                    onChange={(e) => setNewMaterial(prev => ({
                      ...prev,
                      appearance: { ...prev.appearance, roughness: parseFloat(e.target.value) }
                    }))}
                    className="w-full accent-[#dc5f00]"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#a3a1a1] mb-1">
                    Metalness: {newMaterial.appearance.metalness.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={newMaterial.appearance.metalness}
                    onChange={(e) => setNewMaterial(prev => ({
                      ...prev,
                      appearance: { ...prev.appearance, metalness: parseFloat(e.target.value) }
                    }))}
                    className="w-full accent-[#dc5f00]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 justify-end pt-4 border-t border-[#515151]">
                <button
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-sm border border-[#515151] rounded-lg hover:border-[#dc5f00] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateMaterial}
                  disabled={!newMaterial.name.trim()}
                  className="px-4 py-2 text-sm bg-[#dc5f00] hover:bg-[#dc5f00]/90 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-md p-6 bg-[#111] border border-[#515151] rounded-xl">
            <h3 className="text-lg font-semibold mb-4">Edit Material</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#a3a1a1] mb-1">Name</label>
                <input
                  type="text"
                  value={editingMaterial.name}
                  onChange={(e) => setEditingMaterial(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="w-full px-3 py-2 bg-[#1a1b1f] border border-[#515151] rounded-lg focus:outline-none focus:border-[#dc5f00]"
                />
              </div>

              <div>
                <label className="block text-sm text-[#a3a1a1] mb-1">Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={editingMaterial.appearance.color}
                    onChange={(e) => setEditingMaterial(prev =>
                      prev ? { ...prev, appearance: { ...prev.appearance, color: e.target.value } } : null
                    )}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={editingMaterial.appearance.color}
                    onChange={(e) => setEditingMaterial(prev =>
                      prev ? { ...prev, appearance: { ...prev.appearance, color: e.target.value } } : null
                    )}
                    className="flex-1 px-3 py-2 bg-[#1a1b1f] border border-[#515151] rounded-lg focus:outline-none focus:border-[#dc5f00] font-mono text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#a3a1a1] mb-1">
                    Roughness: {editingMaterial.appearance.roughness.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={editingMaterial.appearance.roughness}
                    onChange={(e) => setEditingMaterial(prev =>
                      prev ? { ...prev, appearance: { ...prev.appearance, roughness: parseFloat(e.target.value) } } : null
                    )}
                    className="w-full accent-[#dc5f00]"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#a3a1a1] mb-1">
                    Metalness: {editingMaterial.appearance.metalness.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={editingMaterial.appearance.metalness}
                    onChange={(e) => setEditingMaterial(prev =>
                      prev ? { ...prev, appearance: { ...prev.appearance, metalness: parseFloat(e.target.value) } } : null
                    )}
                    className="w-full accent-[#dc5f00]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 justify-end pt-4 border-t border-[#515151]">
                <button
                  onClick={() => setEditingMaterial(null)}
                  className="px-4 py-2 text-sm border border-[#515151] rounded-lg hover:border-[#dc5f00] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateMaterial}
                  className="px-4 py-2 text-sm bg-[#dc5f00] hover:bg-[#dc5f00]/90 rounded-lg transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.min(255, Math.max(0, (num >> 16) + amt))
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt))
  const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt))
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`
}
