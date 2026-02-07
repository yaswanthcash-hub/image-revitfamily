import { useState, useRef, Suspense, useMemo } from 'react'
import { Canvas, useThree, extend } from '@react-three/fiber'
import { OrbitControls, Grid, OrthographicCamera, Line } from '@react-three/drei'
import * as THREE from 'three'

extend({ Line_: THREE.Line })
import {
  LayoutGrid,
  Square,
  ArrowUp,
  ArrowRight,
  Box,
  Ruler,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2
} from 'lucide-react'

type ViewType = 'perspective' | 'plan' | 'front' | 'right' | 'isometric'

interface DesignViewsProps {
  dimensions: Record<string, number>
  categoryId: string
  children?: React.ReactNode
}

interface ViewConfig {
  id: ViewType
  label: string
  icon: typeof Box
  cameraPosition: [number, number, number]
  cameraUp: [number, number, number]
  orthographic: boolean
}

const VIEW_CONFIGS: ViewConfig[] = [
  {
    id: 'perspective',
    label: '3D View',
    icon: Box,
    cameraPosition: [2, 1.5, 2],
    cameraUp: [0, 1, 0],
    orthographic: false
  },
  {
    id: 'plan',
    label: 'Plan',
    icon: LayoutGrid,
    cameraPosition: [0, 5, 0],
    cameraUp: [0, 0, -1],
    orthographic: true
  },
  {
    id: 'front',
    label: 'Front',
    icon: Square,
    cameraPosition: [0, 0, 5],
    cameraUp: [0, 1, 0],
    orthographic: true
  },
  {
    id: 'right',
    label: 'Right',
    icon: ArrowRight,
    cameraPosition: [5, 0, 0],
    cameraUp: [0, 1, 0],
    orthographic: true
  },
  {
    id: 'isometric',
    label: 'Isometric',
    icon: ArrowUp,
    cameraPosition: [3, 3, 3],
    cameraUp: [0, 1, 0],
    orthographic: true
  }
]

function CameraController({
  viewConfig,
  zoom
}: {
  viewConfig: ViewConfig
  zoom: number
}) {
  const { camera } = useThree()

  useMemo(() => {
    camera.position.set(...viewConfig.cameraPosition)
    camera.up.set(...viewConfig.cameraUp)
    camera.lookAt(0, 0.5, 0)

    if ('zoom' in camera) {
      (camera as THREE.OrthographicCamera).zoom = zoom
      camera.updateProjectionMatrix()
    }
  }, [viewConfig, zoom, camera])

  return null
}

function DimensionLine({
  start,
  end,
  offset = 0.3,
  direction = 'horizontal'
}: {
  start: [number, number, number]
  end: [number, number, number]
  value: number
  unit?: string
  offset?: number
  direction?: 'horizontal' | 'vertical' | 'depth'
}) {
  const midPoint: [number, number, number] = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2,
    (start[2] + end[2]) / 2
  ]

  const offsetVector: [number, number, number] =
    direction === 'horizontal' ? [0, 0, offset] :
    direction === 'vertical' ? [offset, 0, 0] :
    [0, offset, 0]

  const lineStart: [number, number, number] = [
    start[0] + offsetVector[0],
    start[1] + offsetVector[1],
    start[2] + offsetVector[2]
  ]
  const lineEnd: [number, number, number] = [
    end[0] + offsetVector[0],
    end[1] + offsetVector[1],
    end[2] + offsetVector[2]
  ]
  const labelPos: [number, number, number] = [
    midPoint[0] + offsetVector[0] * 1.5,
    midPoint[1] + offsetVector[1] * 1.5,
    midPoint[2] + offsetVector[2] * 1.5
  ]

  return (
    <group>
      <Line
        points={[lineStart, lineEnd]}
        color="#dc5f00"
        lineWidth={2}
      />
      <mesh position={lineStart}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshBasicMaterial color="#dc5f00" />
      </mesh>
      <mesh position={lineEnd}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshBasicMaterial color="#dc5f00" />
      </mesh>
      <sprite position={labelPos} scale={[0.4, 0.15, 1]}>
        <spriteMaterial color="#dc5f00" />
      </sprite>
    </group>
  )
}

function GenericBoundingBox({ dimensions }: { dimensions: Record<string, number> }) {
  const S = 0.02
  const width = (dimensions.width || dimensions.overallWidth || dimensions.deskWidth || 36) * S
  const height = (dimensions.height || dimensions.overallHeight || dimensions.cabinetHeight || 36) * S
  const depth = (dimensions.depth || dimensions.overallDepth || dimensions.deskDepth || 24) * S

  return (
    <group>
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#808080" wireframe />
      </mesh>
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#a0a0a0" transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

export default function DesignViews({ dimensions, children }: DesignViewsProps) {
  const [activeView, setActiveView] = useState<ViewType>('perspective')
  const [zoom, setZoom] = useState(100)
  const [showGrid, setShowGrid] = useState(true)
  const [showDimensions, setShowDimensions] = useState(true)
  const controlsRef = useRef<any>(null)

  const viewConfig = VIEW_CONFIGS.find(v => v.id === activeView) || VIEW_CONFIGS[0]

  const S = 0.02
  const width = (dimensions.width || dimensions.overallWidth || dimensions.deskWidth || 36) * S
  const height = (dimensions.height || dimensions.overallHeight || dimensions.cabinetHeight || 36) * S
  const depth = (dimensions.depth || dimensions.overallDepth || dimensions.deskDepth || 24) * S

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 bg-[#1a1b1f] border-b border-[#515151]">
        <div className="flex items-center gap-1">
          {VIEW_CONFIGS.map(config => {
            const Icon = config.icon
            return (
              <button
                key={config.id}
                onClick={() => setActiveView(config.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  activeView === config.id
                    ? 'bg-[#dc5f00] text-white'
                    : 'hover:bg-[#515151]/30 text-[#a3a1a1]'
                }`}
              >
                <Icon size={14} />
                {config.label}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDimensions(!showDimensions)}
            className={`p-2 rounded-lg transition-colors ${
              showDimensions ? 'bg-[#dc5f00]/20 text-[#dc5f00]' : 'hover:bg-[#515151]/30 text-[#a3a1a1]'
            }`}
            title="Toggle Dimensions"
          >
            <Ruler size={16} />
          </button>

          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded-lg transition-colors ${
              showGrid ? 'bg-[#dc5f00]/20 text-[#dc5f00]' : 'hover:bg-[#515151]/30 text-[#a3a1a1]'
            }`}
            title="Toggle Grid"
          >
            <LayoutGrid size={16} />
          </button>

          <div className="w-px h-6 bg-[#515151] mx-1" />

          <button
            onClick={() => setZoom(z => Math.min(200, z + 20))}
            className="p-2 hover:bg-[#515151]/30 rounded-lg text-[#a3a1a1]"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>

          <span className="text-xs text-[#a3a1a1] min-w-[40px] text-center">{zoom}%</span>

          <button
            onClick={() => setZoom(z => Math.max(20, z - 20))}
            className="p-2 hover:bg-[#515151]/30 rounded-lg text-[#a3a1a1]"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>

          <div className="w-px h-6 bg-[#515151] mx-1" />

          <button
            onClick={() => {
              setZoom(100)
              controlsRef.current?.reset()
            }}
            className="p-2 hover:bg-[#515151]/30 rounded-lg text-[#a3a1a1]"
            title="Reset View"
          >
            <RotateCcw size={16} />
          </button>

          <button
            className="p-2 hover:bg-[#515151]/30 rounded-lg text-[#a3a1a1]"
            title="Fit to View"
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 relative bg-[#f5f5f5]">
        <Canvas>
          <color attach="background" args={['#f5f5f5']} />

          {viewConfig.orthographic ? (
            <OrthographicCamera
              makeDefault
              position={viewConfig.cameraPosition}
              zoom={zoom}
              near={0.1}
              far={1000}
            />
          ) : null}

          <CameraController viewConfig={viewConfig} zoom={zoom} />

          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 8, 5]} intensity={1.2} />
          <directionalLight position={[-3, 4, -3]} intensity={0.4} />

          <Suspense fallback={null}>
            {children || <GenericBoundingBox dimensions={dimensions} />}

            {showDimensions && (
              <group>
                <DimensionLine
                  start={[-width / 2, 0, depth / 2]}
                  end={[width / 2, 0, depth / 2]}
                  value={dimensions.width || dimensions.overallWidth || 36}
                  direction="horizontal"
                />
                <DimensionLine
                  start={[width / 2, 0, -depth / 2]}
                  end={[width / 2, height, -depth / 2]}
                  value={dimensions.height || dimensions.overallHeight || 36}
                  direction="vertical"
                />
                <DimensionLine
                  start={[-width / 2, 0, -depth / 2]}
                  end={[-width / 2, 0, depth / 2]}
                  value={dimensions.depth || dimensions.overallDepth || 24}
                  direction="depth"
                />
              </group>
            )}

            {showGrid && (
              <Grid
                args={[10, 10]}
                cellSize={0.5}
                cellThickness={0.5}
                cellColor="#ddd"
                sectionSize={2}
                sectionThickness={1}
                sectionColor="#bbb"
                fadeDistance={10}
                fadeStrength={1}
                followCamera={false}
                infiniteGrid={true}
              />
            )}
          </Suspense>

          <OrbitControls
            ref={controlsRef}
            enablePan={true}
            enableZoom={!viewConfig.orthographic}
            enableRotate={!viewConfig.orthographic || activeView === 'isometric'}
            minDistance={0.5}
            maxDistance={10}
          />
        </Canvas>

        <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-white/90 border border-[#ddd] rounded-lg text-xs text-[#666]">
          {viewConfig.label} View
          {viewConfig.orthographic && ' (Orthographic)'}
        </div>

        <div className="absolute bottom-4 right-4 flex flex-col gap-1 text-xs text-[#666] bg-white/90 border border-[#ddd] rounded-lg p-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-red-500" /> X
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-green-500" /> Y (Up)
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-blue-500" /> Z
          </div>
        </div>
      </div>
    </div>
  )
}
