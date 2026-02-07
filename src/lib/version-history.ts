import { supabase } from './supabase'

export interface DesignVersion {
  id: string
  projectId: string
  versionNumber: number
  name: string | null
  description: string | null
  snapshotData: VersionSnapshot
  parentVersionId: string | null
  isCurrent: boolean
  createdBy: string | null
  createdAt: string
}

export interface VersionSnapshot {
  dimensions: Record<string, number>
  category: string
  parameters?: Record<string, unknown>
  materials?: Record<string, string>
  assemblies?: unknown[]
  connectors?: unknown[]
}

export interface VersionDiff {
  field: string
  label: string
  oldValue: unknown
  newValue: unknown
  changeType: 'added' | 'removed' | 'modified'
}

export async function fetchVersionHistory(projectId: string): Promise<DesignVersion[]> {
  const { data, error } = await supabase
    .from('design_versions')
    .select('*')
    .eq('project_id', projectId)
    .order('version_number', { ascending: false })

  if (error) {
    console.error('Error fetching version history:', error)
    return []
  }

  return data.map(mapDbToVersion)
}

export async function fetchVersion(versionId: string): Promise<DesignVersion | null> {
  const { data, error } = await supabase
    .from('design_versions')
    .select('*')
    .eq('id', versionId)
    .maybeSingle()

  if (error || !data) {
    console.error('Error fetching version:', error)
    return null
  }

  return mapDbToVersion(data)
}

export async function getCurrentVersion(projectId: string): Promise<DesignVersion | null> {
  const { data, error } = await supabase
    .from('design_versions')
    .select('*')
    .eq('project_id', projectId)
    .eq('is_current', true)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return mapDbToVersion(data)
}

export async function createVersion(
  projectId: string,
  snapshot: VersionSnapshot,
  options?: {
    name?: string
    description?: string
    parentVersionId?: string
  }
): Promise<DesignVersion | null> {
  const { data: latestVersion } = await supabase
    .from('design_versions')
    .select('version_number')
    .eq('project_id', projectId)
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextVersionNumber = (latestVersion?.version_number || 0) + 1

  await supabase
    .from('design_versions')
    .update({ is_current: false })
    .eq('project_id', projectId)

  const { data, error } = await supabase
    .from('design_versions')
    .insert({
      project_id: projectId,
      version_number: nextVersionNumber,
      name: options?.name || `Version ${nextVersionNumber}`,
      description: options?.description,
      snapshot_data: snapshot,
      parent_version_id: options?.parentVersionId,
      is_current: true
    })
    .select()
    .maybeSingle()

  if (error) {
    console.error('Error creating version:', error)
    return null
  }

  return data ? mapDbToVersion(data) : null
}

export async function restoreVersion(versionId: string): Promise<DesignVersion | null> {
  const version = await fetchVersion(versionId)
  if (!version) return null

  await supabase
    .from('design_versions')
    .update({ is_current: false })
    .eq('project_id', version.projectId)

  const restoredVersion = await createVersion(
    version.projectId,
    version.snapshotData,
    {
      name: `Restored from v${version.versionNumber}`,
      description: `Restored from "${version.name || `Version ${version.versionNumber}`}"`,
      parentVersionId: version.id
    }
  )

  return restoredVersion
}

export async function createBranch(
  versionId: string,
  branchName: string
): Promise<DesignVersion | null> {
  const version = await fetchVersion(versionId)
  if (!version) return null

  const branchedVersion = await createVersion(
    version.projectId,
    version.snapshotData,
    {
      name: branchName,
      description: `Branched from v${version.versionNumber}`,
      parentVersionId: version.id
    }
  )

  return branchedVersion
}

export async function updateVersionMetadata(
  versionId: string,
  updates: { name?: string; description?: string }
): Promise<DesignVersion | null> {
  const { data, error } = await supabase
    .from('design_versions')
    .update(updates)
    .eq('id', versionId)
    .select()
    .maybeSingle()

  if (error) {
    console.error('Error updating version:', error)
    return null
  }

  return data ? mapDbToVersion(data) : null
}

export function compareVersions(v1: DesignVersion, v2: DesignVersion): VersionDiff[] {
  const diffs: VersionDiff[] = []
  const s1 = v1.snapshotData
  const s2 = v2.snapshotData

  if (s1.category !== s2.category) {
    diffs.push({
      field: 'category',
      label: 'Category',
      oldValue: s1.category,
      newValue: s2.category,
      changeType: 'modified'
    })
  }

  const allDimKeys = new Set([
    ...Object.keys(s1.dimensions || {}),
    ...Object.keys(s2.dimensions || {})
  ])

  for (const key of allDimKeys) {
    const oldVal = s1.dimensions?.[key]
    const newVal = s2.dimensions?.[key]

    if (oldVal === undefined && newVal !== undefined) {
      diffs.push({
        field: `dimensions.${key}`,
        label: formatDimensionLabel(key),
        oldValue: undefined,
        newValue: newVal,
        changeType: 'added'
      })
    } else if (oldVal !== undefined && newVal === undefined) {
      diffs.push({
        field: `dimensions.${key}`,
        label: formatDimensionLabel(key),
        oldValue: oldVal,
        newValue: undefined,
        changeType: 'removed'
      })
    } else if (oldVal !== newVal) {
      diffs.push({
        field: `dimensions.${key}`,
        label: formatDimensionLabel(key),
        oldValue: oldVal,
        newValue: newVal,
        changeType: 'modified'
      })
    }
  }

  return diffs
}

export function getVersionTree(versions: DesignVersion[]): VersionTreeNode[] {
  const nodeMap = new Map<string, VersionTreeNode>()
  const roots: VersionTreeNode[] = []

  for (const version of versions) {
    nodeMap.set(version.id, {
      version,
      children: []
    })
  }

  for (const version of versions) {
    const node = nodeMap.get(version.id)!
    if (version.parentVersionId) {
      const parent = nodeMap.get(version.parentVersionId)
      if (parent) {
        parent.children.push(node)
      } else {
        roots.push(node)
      }
    } else {
      roots.push(node)
    }
  }

  return roots.sort((a, b) => b.version.versionNumber - a.version.versionNumber)
}

export interface VersionTreeNode {
  version: DesignVersion
  children: VersionTreeNode[]
}

function mapDbToVersion(row: Record<string, unknown>): DesignVersion {
  return {
    id: row.id as string,
    projectId: row.project_id as string,
    versionNumber: row.version_number as number,
    name: row.name as string | null,
    description: row.description as string | null,
    snapshotData: row.snapshot_data as VersionSnapshot,
    parentVersionId: row.parent_version_id as string | null,
    isCurrent: row.is_current as boolean,
    createdBy: row.created_by as string | null,
    createdAt: row.created_at as string
  }
}

function formatDimensionLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

export function formatVersionDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}
