import { useState, useEffect } from 'react'
import {
  History,
  GitBranch,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Check,
  ArrowRight,
  Plus,
  Edit2,
  X
} from 'lucide-react'
import type { DesignVersion, VersionDiff, VersionTreeNode, VersionSnapshot } from '../lib/version-history'
import {
  fetchVersionHistory,
  createVersion,
  restoreVersion,
  createBranch,
  updateVersionMetadata,
  compareVersions,
  getVersionTree,
  formatVersionDate
} from '../lib/version-history'

interface VersionHistoryProps {
  projectId: string | null
  currentSnapshot: VersionSnapshot
  onRestore?: (snapshot: VersionSnapshot) => void
}

export default function VersionHistory({
  projectId,
  currentSnapshot,
  onRestore
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<DesignVersion[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<DesignVersion | null>(null)
  const [compareVersion, setCompareVersion] = useState<DesignVersion | null>(null)
  const [showDiff, setShowDiff] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newVersionName, setNewVersionName] = useState('')
  const [newVersionDesc, setNewVersionDesc] = useState('')
  const [editingVersion, setEditingVersion] = useState<DesignVersion | null>(null)

  useEffect(() => {
    if (projectId) {
      loadVersions()
    }
  }, [projectId])

  async function loadVersions() {
    if (!projectId) return
    setLoading(true)
    const history = await fetchVersionHistory(projectId)
    setVersions(history)
    setLoading(false)
  }

  async function handleCreateVersion() {
    if (!projectId) return

    const version = await createVersion(projectId, currentSnapshot, {
      name: newVersionName || undefined,
      description: newVersionDesc || undefined
    })

    if (version) {
      setVersions(prev => [version, ...prev.map(v => ({ ...v, isCurrent: false }))])
      setIsCreating(false)
      setNewVersionName('')
      setNewVersionDesc('')
    }
  }

  async function handleRestore(version: DesignVersion) {
    const restored = await restoreVersion(version.id)
    if (restored) {
      setVersions(prev => [restored, ...prev.map(v => ({ ...v, isCurrent: false }))])
      onRestore?.(version.snapshotData)
    }
  }

  async function handleBranch(version: DesignVersion) {
    const branchName = prompt('Enter branch name:', `Branch from v${version.versionNumber}`)
    if (!branchName) return

    const branched = await createBranch(version.id, branchName)
    if (branched) {
      setVersions(prev => [branched, ...prev.map(v => ({ ...v, isCurrent: false }))])
    }
  }

  async function handleUpdateMetadata() {
    if (!editingVersion) return

    const updated = await updateVersionMetadata(editingVersion.id, {
      name: editingVersion.name || undefined,
      description: editingVersion.description || undefined
    })

    if (updated) {
      setVersions(prev => prev.map(v => v.id === updated.id ? updated : v))
      setEditingVersion(null)
    }
  }

  const versionTree = getVersionTree(versions)
  const diff = showDiff && selectedVersion && compareVersion
    ? compareVersions(compareVersion, selectedVersion)
    : []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History size={18} className="text-[#dc5f00]" />
          <h3 className="font-medium">Version History</h3>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-[#dc5f00] hover:bg-[#dc5f00]/90 rounded-lg transition-colors"
        >
          <Plus size={14} />
          Save Version
        </button>
      </div>

      {isCreating && (
        <div className="p-4 bg-[#1a1b1f] border border-[#515151] rounded-lg space-y-3">
          <input
            type="text"
            placeholder="Version name (optional)"
            value={newVersionName}
            onChange={(e) => setNewVersionName(e.target.value)}
            className="w-full px-3 py-2 bg-[#111] border border-[#515151] rounded-lg text-sm focus:outline-none focus:border-[#dc5f00]"
          />
          <textarea
            placeholder="Description (optional)"
            value={newVersionDesc}
            onChange={(e) => setNewVersionDesc(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-[#111] border border-[#515151] rounded-lg text-sm focus:outline-none focus:border-[#dc5f00] resize-none"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 text-sm border border-[#515151] rounded-lg hover:border-[#dc5f00] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateVersion}
              className="px-3 py-1.5 text-sm bg-[#dc5f00] hover:bg-[#dc5f00]/90 rounded-lg transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-[#a3a1a1]">Loading history...</div>
      ) : versions.length === 0 ? (
        <div className="p-8 text-center text-[#a3a1a1] border border-dashed border-[#515151] rounded-lg">
          No versions saved yet. Save your first version to start tracking changes.
        </div>
      ) : (
        <div className="space-y-2">
          {versionTree.map(node => (
            <VersionNode
              key={node.version.id}
              node={node}
              selectedId={selectedVersion?.id}
              compareId={compareVersion?.id}
              onSelect={setSelectedVersion}
              onCompare={setCompareVersion}
              onRestore={handleRestore}
              onBranch={handleBranch}
              onEdit={setEditingVersion}
            />
          ))}
        </div>
      )}

      {showDiff && diff.length > 0 && (
        <div className="p-4 bg-[#1a1b1f] border border-[#515151] rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">
              Changes: v{compareVersion?.versionNumber} → v{selectedVersion?.versionNumber}
            </h4>
            <button
              onClick={() => setShowDiff(false)}
              className="p-1 hover:bg-[#515151]/30 rounded"
            >
              <X size={14} />
            </button>
          </div>
          <div className="space-y-2">
            {diff.map((d, i) => (
              <DiffLine key={i} diff={d} />
            ))}
          </div>
        </div>
      )}

      {selectedVersion && compareVersion && !showDiff && (
        <button
          onClick={() => setShowDiff(true)}
          className="w-full py-2 text-sm text-center border border-[#515151] rounded-lg hover:border-[#dc5f00] transition-colors"
        >
          Compare v{compareVersion.versionNumber} with v{selectedVersion.versionNumber}
        </button>
      )}

      {editingVersion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-md p-6 bg-[#111] border border-[#515151] rounded-xl">
            <h3 className="text-lg font-semibold mb-4">Edit Version</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#a3a1a1] mb-1">Name</label>
                <input
                  type="text"
                  value={editingVersion.name || ''}
                  onChange={(e) => setEditingVersion(prev =>
                    prev ? { ...prev, name: e.target.value } : null
                  )}
                  className="w-full px-3 py-2 bg-[#1a1b1f] border border-[#515151] rounded-lg focus:outline-none focus:border-[#dc5f00]"
                />
              </div>

              <div>
                <label className="block text-sm text-[#a3a1a1] mb-1">Description</label>
                <textarea
                  value={editingVersion.description || ''}
                  onChange={(e) => setEditingVersion(prev =>
                    prev ? { ...prev, description: e.target.value } : null
                  )}
                  rows={3}
                  className="w-full px-3 py-2 bg-[#1a1b1f] border border-[#515151] rounded-lg focus:outline-none focus:border-[#dc5f00] resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#515151]">
                <button
                  onClick={() => setEditingVersion(null)}
                  className="px-4 py-2 text-sm border border-[#515151] rounded-lg hover:border-[#dc5f00] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateMetadata}
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

function VersionNode({
  node,
  selectedId,
  compareId,
  depth = 0,
  onSelect,
  onCompare,
  onRestore,
  onBranch,
  onEdit
}: {
  node: VersionTreeNode
  selectedId?: string
  compareId?: string
  depth?: number
  onSelect: (v: DesignVersion) => void
  onCompare: (v: DesignVersion) => void
  onRestore: (v: DesignVersion) => void
  onBranch: (v: DesignVersion) => void
  onEdit: (v: DesignVersion) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const { version } = node
  const isSelected = version.id === selectedId
  const isCompare = version.id === compareId
  const hasChildren = node.children.length > 0

  return (
    <div style={{ marginLeft: depth * 16 }}>
      <div
        className={`group flex items-start gap-3 p-3 rounded-lg border transition-all ${
          isSelected
            ? 'border-[#dc5f00] bg-[#dc5f00]/10'
            : isCompare
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-[#515151] hover:border-[#dc5f00]/50 bg-[#1a1b1f]'
        }`}
      >
        {hasChildren && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-0.5 p-0.5 hover:bg-[#515151]/30 rounded"
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">
              v{version.versionNumber}
            </span>
            {version.isCurrent && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 text-xs bg-green-500/20 text-green-400 rounded">
                <Check size={10} />
                Current
              </span>
            )}
            {version.parentVersionId && (
              <GitBranch size={12} className="text-[#a3a1a1]" />
            )}
          </div>

          {version.name && (
            <div className="text-sm text-white mt-0.5">{version.name}</div>
          )}

          {version.description && (
            <div className="text-xs text-[#a3a1a1] mt-1 line-clamp-2">
              {version.description}
            </div>
          )}

          <div className="text-xs text-[#a3a1a1] mt-1">
            {formatVersionDate(version.createdAt)}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onSelect(version)}
            className={`p-1.5 rounded transition-colors ${
              isSelected ? 'bg-[#dc5f00] text-white' : 'hover:bg-[#515151]/50'
            }`}
            title="Select for comparison"
          >
            <Check size={14} />
          </button>
          <button
            onClick={() => onCompare(version)}
            className={`p-1.5 rounded transition-colors ${
              isCompare ? 'bg-blue-500 text-white' : 'hover:bg-[#515151]/50'
            }`}
            title="Compare with"
          >
            <ArrowRight size={14} />
          </button>
          <button
            onClick={() => onRestore(version)}
            className="p-1.5 hover:bg-[#515151]/50 rounded transition-colors"
            title="Restore this version"
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={() => onBranch(version)}
            className="p-1.5 hover:bg-[#515151]/50 rounded transition-colors"
            title="Create branch"
          >
            <GitBranch size={14} />
          </button>
          <button
            onClick={() => onEdit(version)}
            className="p-1.5 hover:bg-[#515151]/50 rounded transition-colors"
            title="Edit metadata"
          >
            <Edit2 size={14} />
          </button>
        </div>
      </div>

      {expanded && hasChildren && (
        <div className="mt-2 space-y-2 border-l border-[#515151]/50 ml-2">
          {node.children.map(child => (
            <VersionNode
              key={child.version.id}
              node={child}
              selectedId={selectedId}
              compareId={compareId}
              depth={depth + 1}
              onSelect={onSelect}
              onCompare={onCompare}
              onRestore={onRestore}
              onBranch={onBranch}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function DiffLine({ diff }: { diff: VersionDiff }) {
  return (
    <div className={`flex items-center gap-3 p-2 rounded text-sm ${
      diff.changeType === 'added' ? 'bg-green-500/10' :
      diff.changeType === 'removed' ? 'bg-red-500/10' :
      'bg-yellow-500/10'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        diff.changeType === 'added' ? 'bg-green-500' :
        diff.changeType === 'removed' ? 'bg-red-500' :
        'bg-yellow-500'
      }`} />
      <span className="text-[#a3a1a1]">{diff.label}:</span>
      {diff.changeType === 'modified' ? (
        <>
          <span className="line-through text-red-400">{String(diff.oldValue)}</span>
          <ArrowRight size={12} className="text-[#a3a1a1]" />
          <span className="text-green-400">{String(diff.newValue)}</span>
        </>
      ) : diff.changeType === 'added' ? (
        <span className="text-green-400">{String(diff.newValue)}</span>
      ) : (
        <span className="line-through text-red-400">{String(diff.oldValue)}</span>
      )}
    </div>
  )
}
