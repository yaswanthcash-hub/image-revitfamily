import { pipeline, env } from '@huggingface/transformers'
import { revitCategories, getCategoryByDetectionPrompt, type RevitFamilyCategory } from '../data/revit-categories'

env.allowLocalModels = false
env.useBrowserCache = true

export interface DetectionBox {
  label: string
  score: number
  box: {
    xmin: number
    ymin: number
    xmax: number
    ymax: number
  }
}

export interface DetectionResult {
  category: RevitFamilyCategory | null
  detections: DetectionBox[]
  allDetections: DetectionBox[]
  confidence: number
  inferenceTime: number
}

export interface ModelStatus {
  loaded: boolean
  loading: boolean
  progress: number
  error: string | null
}

type DetectorPipeline = Awaited<ReturnType<typeof pipeline<'zero-shot-object-detection'>>>

let detector: DetectorPipeline | null = null
let modelStatus: ModelStatus = {
  loaded: false,
  loading: false,
  progress: 0,
  error: null,
}

const MODEL_ID = 'Xenova/owlvit-base-patch32'

const DETECTION_LABELS = [
  'door', 'window', 'chair', 'sofa', 'desk', 'table', 'cabinet', 'toilet',
  'sink', 'light fixture', 'pendant light', 'electrical panel', 'air vent',
  'sprinkler', 'column', 'beam', 'outlet', 'hvac unit', 'radiator',
  'bookshelf', 'wardrobe', 'faucet', 'bathtub', 'shower', 'mirror',
  'ceiling fan', 'thermostat', 'fire alarm', 'smoke detector',
]

export function getModelStatus(): ModelStatus {
  return { ...modelStatus }
}

export async function initializeDetector(
  onProgress?: (progress: number) => void
): Promise<boolean> {
  if (detector) {
    return true
  }

  if (modelStatus.loading) {
    return false
  }

  modelStatus = { loaded: false, loading: true, progress: 0, error: null }

  try {
    // @ts-expect-error - Pipeline type inference is too complex
    detector = await pipeline('zero-shot-object-detection', MODEL_ID, {
      progress_callback: (progressInfo: { progress?: number; status?: string }) => {
        if (progressInfo.progress !== undefined) {
          modelStatus.progress = progressInfo.progress
          onProgress?.(progressInfo.progress)
        }
      },
    })

    modelStatus = { loaded: true, loading: false, progress: 100, error: null }
    return true
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load model'
    modelStatus = { loaded: false, loading: false, progress: 0, error: errorMessage }
    console.error('Failed to initialize detector:', error)
    return false
  }
}

export async function detectObjects(
  imageUrl: string,
  customLabels?: string[]
): Promise<DetectionResult> {
  const startTime = performance.now()

  if (!detector) {
    const initialized = await initializeDetector()
    if (!initialized) {
      return {
        category: null,
        detections: [],
        allDetections: [],
        confidence: 0,
        inferenceTime: 0,
      }
    }
  }

  const labels = customLabels || DETECTION_LABELS

  try {
    const output = await detector!(imageUrl, labels, {
      threshold: 0.1,
      top_k: 10,
    })

    const detections: DetectionBox[] = (output as Array<{
      label: string
      score: number
      box: { xmin: number; ymin: number; xmax: number; ymax: number }
    }>).map((det) => ({
      label: det.label,
      score: det.score,
      box: det.box,
    }))

    detections.sort((a, b) => b.score - a.score)

    const inferenceTime = performance.now() - startTime

    const bestMatch = findBestCategoryMatch(detections)

    return {
      category: bestMatch.category,
      detections: bestMatch.relevantDetections,
      allDetections: detections,
      confidence: bestMatch.confidence,
      inferenceTime,
    }
  } catch (error) {
    console.error('Detection error:', error)
    return {
      category: null,
      detections: [],
      allDetections: [],
      confidence: 0,
      inferenceTime: performance.now() - startTime,
    }
  }
}

interface CategoryMatch {
  category: RevitFamilyCategory | null
  relevantDetections: DetectionBox[]
  confidence: number
}

function findBestCategoryMatch(detections: DetectionBox[]): CategoryMatch {
  if (detections.length === 0) {
    return { category: null, relevantDetections: [], confidence: 0 }
  }

  const categoryScores: Map<string, { score: number; detections: DetectionBox[] }> = new Map()

  for (const det of detections) {
    const matchedCategory = findCategoryForLabel(det.label)
    if (matchedCategory) {
      const existing = categoryScores.get(matchedCategory.id)
      if (existing) {
        existing.score = Math.max(existing.score, det.score)
        existing.detections.push(det)
      } else {
        categoryScores.set(matchedCategory.id, {
          score: det.score,
          detections: [det],
        })
      }
    }
  }

  let bestCategory: RevitFamilyCategory | null = null
  let bestScore = 0
  let bestDetections: DetectionBox[] = []

  categoryScores.forEach((value, categoryId) => {
    if (value.score > bestScore) {
      bestScore = value.score
      bestCategory = revitCategories.find(c => c.id === categoryId) || null
      bestDetections = value.detections
    }
  })

  if (!bestCategory && detections.length > 0) {
    const topDetection = detections[0]
    bestCategory = findCategoryForLabel(topDetection.label)
    bestDetections = [topDetection]
    bestScore = topDetection.score
  }

  return {
    category: bestCategory,
    relevantDetections: bestDetections,
    confidence: bestScore,
  }
}

function findCategoryForLabel(label: string): RevitFamilyCategory | null {
  const normalizedLabel = label.toLowerCase().trim()

  const directMatch = getCategoryByDetectionPrompt(normalizedLabel)
  if (directMatch) {
    return directMatch
  }

  const labelMappings: Record<string, string[]> = {
    'single-door': ['door', 'wooden door', 'entry door', 'interior door'],
    'double-door': ['double door', 'french door'],
    'sliding-door': ['sliding door', 'patio door', 'glass door'],
    'casement-window': ['window', 'casement', 'awning window'],
    'double-hung-window': ['double hung', 'sash window'],
    'fixed-window': ['fixed window', 'picture window'],
    'accent-chair': ['chair', 'armchair', 'lounge chair', 'wingback'],
    'office-chair': ['office chair', 'desk chair', 'task chair', 'swivel chair', 'computer chair'],
    'sofa': ['sofa', 'couch', 'loveseat', 'sectional'],
    'dining-table': ['table', 'dining table', 'kitchen table'],
    'office-desk': ['desk', 'work desk', 'office desk'],
    'storage-cabinet': ['cabinet', 'wardrobe', 'cupboard', 'bookshelf', 'bookcase', 'shelving'],
    'steel-column': ['column', 'steel column', 'pillar'],
    'concrete-column': ['concrete column', 'round column'],
    'steel-beam': ['beam', 'i-beam', 'girder', 'steel beam'],
    'pendant-light': ['pendant light', 'hanging light', 'chandelier'],
    'recessed-light': ['recessed light', 'downlight', 'can light', 'ceiling light'],
    'electrical-panel': ['electrical panel', 'breaker box', 'panel'],
    'outlet': ['outlet', 'socket', 'receptacle', 'plug'],
    'air-terminal': ['air vent', 'vent', 'diffuser', 'grille', 'register', 'hvac vent'],
    'mechanical-equipment': ['hvac unit', 'ac unit', 'furnace', 'air handler'],
    'toilet': ['toilet', 'water closet', 'wc'],
    'sink': ['sink', 'basin', 'faucet', 'lavatory'],
    'sprinkler': ['sprinkler', 'fire sprinkler'],
  }

  for (const [categoryId, labels] of Object.entries(labelMappings)) {
    if (labels.some(l => normalizedLabel.includes(l) || l.includes(normalizedLabel))) {
      return revitCategories.find(c => c.id === categoryId) || null
    }
  }

  return null
}

export function isModelLoaded(): boolean {
  return detector !== null
}

export function unloadModel(): void {
  detector = null
  modelStatus = { loaded: false, loading: false, progress: 0, error: null }
}
