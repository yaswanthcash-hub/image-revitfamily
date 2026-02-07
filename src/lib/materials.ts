import { supabase } from './supabase'

export interface MaterialAppearance {
  color: string
  roughness: number
  metalness: number
  opacity?: number
  normalMapUrl?: string
  roughnessMapUrl?: string
}

export interface PhysicalProperties {
  density?: number
  thermalConductivity?: number
  electricalConductivity?: number
  strength?: number
}

export interface IdentityData {
  manufacturer?: string
  model?: string
  cost?: number
  url?: string
  keynote?: string
}

export interface Material {
  id: string
  projectId: string | null
  name: string
  category: 'Wood' | 'Metal' | 'Glass' | 'Fabric' | 'Concrete' | 'Stone' | 'Plastic' | 'Ceramic' | 'Paint' | 'Generic'
  appearance: MaterialAppearance
  physicalProperties: PhysicalProperties
  identityData: IdentityData
  textureUrl: string | null
  isLibrary: boolean
  createdAt: string
}

export interface MaterialAssignment {
  componentPath: string
  materialId: string
}

export async function fetchLibraryMaterials(): Promise<Material[]> {
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .eq('is_library', true)
    .order('category', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching library materials:', error)
    return []
  }

  return data.map(mapDbToMaterial)
}

export async function fetchProjectMaterials(projectId: string): Promise<Material[]> {
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .eq('project_id', projectId)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching project materials:', error)
    return []
  }

  return data.map(mapDbToMaterial)
}

export async function createMaterial(
  projectId: string,
  material: Omit<Material, 'id' | 'projectId' | 'isLibrary' | 'createdAt'>
): Promise<Material | null> {
  const { data, error } = await supabase
    .from('materials')
    .insert({
      project_id: projectId,
      name: material.name,
      category: material.category,
      appearance: material.appearance,
      physical_properties: material.physicalProperties,
      identity_data: material.identityData,
      texture_url: material.textureUrl,
      is_library: false
    })
    .select()
    .maybeSingle()

  if (error) {
    console.error('Error creating material:', error)
    return null
  }

  return data ? mapDbToMaterial(data) : null
}

export async function updateMaterial(
  materialId: string,
  updates: Partial<Omit<Material, 'id' | 'projectId' | 'isLibrary' | 'createdAt'>>
): Promise<Material | null> {
  const updateData: Record<string, unknown> = {}

  if (updates.name !== undefined) updateData.name = updates.name
  if (updates.category !== undefined) updateData.category = updates.category
  if (updates.appearance !== undefined) updateData.appearance = updates.appearance
  if (updates.physicalProperties !== undefined) updateData.physical_properties = updates.physicalProperties
  if (updates.identityData !== undefined) updateData.identity_data = updates.identityData
  if (updates.textureUrl !== undefined) updateData.texture_url = updates.textureUrl

  const { data, error } = await supabase
    .from('materials')
    .update(updateData)
    .eq('id', materialId)
    .select()
    .maybeSingle()

  if (error) {
    console.error('Error updating material:', error)
    return null
  }

  return data ? mapDbToMaterial(data) : null
}

export async function deleteMaterial(materialId: string): Promise<boolean> {
  const { error } = await supabase
    .from('materials')
    .delete()
    .eq('id', materialId)

  if (error) {
    console.error('Error deleting material:', error)
    return false
  }

  return true
}

export async function duplicateMaterialToProject(
  materialId: string,
  projectId: string,
  newName?: string
): Promise<Material | null> {
  const { data: source, error: fetchError } = await supabase
    .from('materials')
    .select('*')
    .eq('id', materialId)
    .maybeSingle()

  if (fetchError || !source) {
    console.error('Error fetching source material:', fetchError)
    return null
  }

  const { data, error } = await supabase
    .from('materials')
    .insert({
      project_id: projectId,
      name: newName || `${source.name} (Copy)`,
      category: source.category,
      appearance: source.appearance,
      physical_properties: source.physical_properties,
      identity_data: source.identity_data,
      texture_url: source.texture_url,
      is_library: false
    })
    .select()
    .maybeSingle()

  if (error) {
    console.error('Error duplicating material:', error)
    return null
  }

  return data ? mapDbToMaterial(data) : null
}

function mapDbToMaterial(row: Record<string, unknown>): Material {
  return {
    id: row.id as string,
    projectId: row.project_id as string | null,
    name: row.name as string,
    category: row.category as Material['category'],
    appearance: row.appearance as MaterialAppearance,
    physicalProperties: row.physical_properties as PhysicalProperties,
    identityData: row.identity_data as IdentityData,
    textureUrl: row.texture_url as string | null,
    isLibrary: row.is_library as boolean,
    createdAt: row.created_at as string
  }
}

export function getMaterialColor(material: Material): string {
  return material.appearance.color || '#808080'
}

export function getMaterialThreeProps(material: Material): {
  color: string
  roughness: number
  metalness: number
  transparent: boolean
  opacity: number
} {
  return {
    color: material.appearance.color,
    roughness: material.appearance.roughness,
    metalness: material.appearance.metalness,
    transparent: (material.appearance.opacity ?? 1) < 1,
    opacity: material.appearance.opacity ?? 1
  }
}

export const MATERIAL_CATEGORIES = [
  { id: 'Wood', label: 'Wood', icon: 'TreePine' },
  { id: 'Metal', label: 'Metal', icon: 'Wrench' },
  { id: 'Glass', label: 'Glass', icon: 'Square' },
  { id: 'Fabric', label: 'Fabric', icon: 'Shirt' },
  { id: 'Concrete', label: 'Concrete', icon: 'Box' },
  { id: 'Stone', label: 'Stone', icon: 'Mountain' },
  { id: 'Plastic', label: 'Plastic', icon: 'Circle' },
  { id: 'Ceramic', label: 'Ceramic', icon: 'Coffee' },
  { id: 'Paint', label: 'Paint', icon: 'Paintbrush' },
  { id: 'Generic', label: 'Generic', icon: 'Layers' }
] as const

export function extractColorsFromImage(imageUrl: string): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(['#808080'])
        return
      }

      const size = 50
      canvas.width = size
      canvas.height = size
      ctx.drawImage(img, 0, 0, size, size)

      const imageData = ctx.getImageData(0, 0, size, size)
      const colors: Record<string, number> = {}

      for (let i = 0; i < imageData.data.length; i += 4) {
        const r = Math.round(imageData.data[i] / 32) * 32
        const g = Math.round(imageData.data[i + 1] / 32) * 32
        const b = Math.round(imageData.data[i + 2] / 32) * 32
        const key = `${r},${g},${b}`
        colors[key] = (colors[key] || 0) + 1
      }

      const sorted = Object.entries(colors)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([rgb]) => {
          const [r, g, b] = rgb.split(',').map(Number)
          return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
        })

      resolve(sorted)
    }
    img.onerror = () => resolve(['#808080'])
    img.src = imageUrl
  })
}
