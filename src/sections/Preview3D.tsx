import { useState, useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import * as THREE from 'three'
import { RotateCcw, Grid3X3 } from 'lucide-react'
import type { FurnitureCategory } from '../data/furniture-categories'

interface Preview3DProps {
  category: FurnitureCategory
  dimensions: Record<string, number>
}

const S = 0.02

function d(dims: Record<string, number>, key: string, fallback: number) {
  return (dims[key] ?? fallback) * S
}

function AccentChairModel({ dimensions }: { dimensions: Record<string, number> }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15
  })

  const sh = d(dimensions, 'seatHeight', 17)
  const sw = d(dimensions, 'seatWidth', 22)
  const sd = d(dimensions, 'seatDepth', 21)
  const bh = d(dimensions, 'backHeight', 20)
  const ow = d(dimensions, 'overallWidth', 28)

  return (
    <group ref={ref}>
      <mesh position={[0, sh, 0]}>
        <boxGeometry args={[sw, 0.08, sd]} />
        <meshStandardMaterial color="#5BA3C9" />
      </mesh>
      <mesh position={[0, sh + bh / 2, -sd / 2 + 0.04]}>
        <boxGeometry args={[sw * 0.92, bh, 0.08]} />
        <meshStandardMaterial color="#5BA3C9" />
      </mesh>
      <mesh position={[-ow / 2 + 0.03, sh + bh * 0.25, -sd * 0.15]}>
        <boxGeometry args={[0.06, bh * 0.55, sd * 0.55]} />
        <meshStandardMaterial color="#4A92B8" />
      </mesh>
      <mesh position={[ow / 2 - 0.03, sh + bh * 0.25, -sd * 0.15]}>
        <boxGeometry args={[0.06, bh * 0.55, sd * 0.55]} />
        <meshStandardMaterial color="#4A92B8" />
      </mesh>
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([x, z], i) => {
        const lx = (sw / 2 - 0.04) * x
        const lz = (sd / 2 - 0.04) * z
        const splay = 0.12
        return (
          <mesh key={i} position={[lx + x * splay, sh / 2 - 0.02, lz + z * splay]} rotation={[z * 0.08, 0, -x * 0.08]}>
            <cylinderGeometry args={[0.014, 0.01, sh, 8]} />
            <meshStandardMaterial color="#C8A064" />
          </mesh>
        )
      })}
    </group>
  )
}

function ChairModel({ dimensions }: { dimensions: Record<string, number> }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15
  })

  const sh = d(dimensions, 'seatHeight', 17.5)
  const sw = d(dimensions, 'seatWidth', 19)
  const sd = d(dimensions, 'seatDepth', 17)
  const bh = d(dimensions, 'backHeight', 22)
  const aw = d(dimensions, 'overallWidth', 26)

  return (
    <group ref={ref}>
      <mesh position={[0, sh, 0]}>
        <boxGeometry args={[sw, 0.06, sd]} />
        <meshStandardMaterial color="#3a3a3a" />
      </mesh>
      <mesh position={[0, sh + bh / 2, -sd / 2 + 0.03]}>
        <boxGeometry args={[sw * 0.85, bh, 0.06]} />
        <meshStandardMaterial color="#3a3a3a" />
      </mesh>
      {[-1, 1].map(side => (
        <group key={side}>
          <mesh position={[side * (aw / 2), sh + 0.06, 0]}>
            <boxGeometry args={[0.04, 0.03, sd * 0.5]} />
            <meshStandardMaterial color="#555" />
          </mesh>
          <mesh position={[side * (aw / 2), sh - 0.06, 0]}>
            <boxGeometry args={[0.03, sh * 0.35, 0.03]} />
            <meshStandardMaterial color="#555" />
          </mesh>
        </group>
      ))}
      <mesh position={[0, sh / 2, 0]}>
        <cylinderGeometry args={[0.03, 0.03, sh, 12]} />
        <meshStandardMaterial color="#888" metalness={0.7} roughness={0.3} />
      </mesh>
      {[0, 72, 144, 216, 288].map((a) => {
        const rad = (a * Math.PI) / 180
        return (
          <group key={a}>
            <mesh position={[Math.cos(rad) * 0.18, 0.025, Math.sin(rad) * 0.18]} rotation={[0, rad, 0]}>
              <boxGeometry args={[0.36, 0.02, 0.025]} />
              <meshStandardMaterial color="#888" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[Math.cos(rad) * 0.35, 0.02, Math.sin(rad) * 0.35]}>
              <sphereGeometry args={[0.022, 8, 8]} />
              <meshStandardMaterial color="#222" />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

function SofaModel({ dimensions }: { dimensions: Record<string, number> }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15
  })

  const sh = d(dimensions, 'seatHeight', 17)
  const oh = d(dimensions, 'overallHeight', 34)
  const ow = d(dimensions, 'overallWidth', 72)
  const od = d(dimensions, 'overallDepth', 36)
  const armH = d(dimensions, 'armHeight', 26)
  const seatD = d(dimensions, 'seatDepth', 22)

  return (
    <group ref={ref}>
      <mesh position={[0, sh * 0.85, 0.02]}>
        <boxGeometry args={[ow * 0.82, sh * 0.35, seatD]} />
        <meshStandardMaterial color="#C4A77D" />
      </mesh>
      <mesh position={[0, sh + (oh - sh) * 0.35, -od * 0.35]}>
        <boxGeometry args={[ow * 0.82, (oh - sh) * 0.65, od * 0.18]} />
        <meshStandardMaterial color="#C4A77D" />
      </mesh>
      <mesh position={[-ow / 2 + ow * 0.04, armH * 0.5, 0]}>
        <boxGeometry args={[ow * 0.07, armH, od * 0.82]} />
        <meshStandardMaterial color="#B89A6A" />
      </mesh>
      <mesh position={[ow / 2 - ow * 0.04, armH * 0.5, 0]}>
        <boxGeometry args={[ow * 0.07, armH, od * 0.82]} />
        <meshStandardMaterial color="#B89A6A" />
      </mesh>
      <mesh position={[0, oh * 0.35, -od / 2 + 0.01]}>
        <boxGeometry args={[ow, oh * 0.7, od * 0.04]} />
        <meshStandardMaterial color="#A88B5C" />
      </mesh>
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([x, z], i) => (
        <mesh key={i} position={[(ow / 2 - 0.06) * x, 0.04, (od / 2 - 0.06) * z]}>
          <cylinderGeometry args={[0.018, 0.014, 0.08, 8]} />
          <meshStandardMaterial color="#5C4830" />
        </mesh>
      ))}
    </group>
  )
}

function TableModel({ dimensions }: { dimensions: Record<string, number> }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15
  })

  const h = d(dimensions, 'tableHeight', 30)
  const l = d(dimensions, 'tableLength', 72)
  const w = d(dimensions, 'tableWidth', 36)
  const t = d(dimensions, 'topThickness', 1.25)

  return (
    <group ref={ref}>
      <mesh position={[0, h, 0]}>
        <boxGeometry args={[l, t, w]} />
        <meshStandardMaterial color="#A0522D" />
      </mesh>
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([x, z], i) => (
        <mesh key={i} position={[(l / 2 - 0.06) * x, h / 2, (w / 2 - 0.06) * z]}>
          <boxGeometry args={[0.05, h, 0.05]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      ))}
    </group>
  )
}

function DeskModel({ dimensions }: { dimensions: Record<string, number> }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15
  })

  const h = d(dimensions, 'deskHeight', 29)
  const dw = d(dimensions, 'deskWidth', 60)
  const dd = d(dimensions, 'deskDepth', 30)
  const mh = d(dimensions, 'modestyHeight', 12)

  return (
    <group ref={ref}>
      <mesh position={[0, h, 0]}>
        <boxGeometry args={[dw, 0.04, dd]} />
        <meshStandardMaterial color="#D4C4A8" />
      </mesh>
      <mesh position={[-dw / 2 + 0.02, h / 2, 0]}>
        <boxGeometry args={[0.04, h, dd * 0.88]} />
        <meshStandardMaterial color="#C0B090" />
      </mesh>
      <mesh position={[dw / 2 - 0.02, h / 2, 0]}>
        <boxGeometry args={[0.04, h, dd * 0.88]} />
        <meshStandardMaterial color="#C0B090" />
      </mesh>
      <mesh position={[0, h - mh / 2 - 0.04, -dd / 2 + 0.015]}>
        <boxGeometry args={[dw * 0.85, mh, 0.02]} />
        <meshStandardMaterial color="#B8A888" />
      </mesh>
    </group>
  )
}

function CabinetModel({ dimensions }: { dimensions: Record<string, number> }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15
  })

  const ch = d(dimensions, 'cabinetHeight', 42)
  const cw = d(dimensions, 'cabinetWidth', 36)
  const cd = d(dimensions, 'cabinetDepth', 18)
  const tk = d(dimensions, 'toeKickHeight', 4)

  return (
    <group ref={ref}>
      <mesh position={[0, tk + (ch - tk) / 2, 0]}>
        <boxGeometry args={[cw, ch - tk, cd]} />
        <meshStandardMaterial color="#E8E0D0" />
      </mesh>
      <mesh position={[0, tk + (ch - tk) / 2, cd / 2 + 0.001]}>
        <boxGeometry args={[0.004, ch - tk - 0.04, 0.001]} />
        <meshStandardMaterial color="#999" />
      </mesh>
      {[-1, 1].map(side => (
        <mesh key={side} position={[side * 0.04, tk + (ch - tk) * 0.65, cd / 2 + 0.012]}>
          <boxGeometry args={[0.008, 0.06, 0.012]} />
          <meshStandardMaterial color="#999" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, tk / 2, 0]}>
        <boxGeometry args={[cw - 0.04, tk, cd - 0.04]} />
        <meshStandardMaterial color="#666" />
      </mesh>
      {[0.33, 0.66].map(f => (
        <mesh key={f} position={[0, tk + (ch - tk) * f, cd / 2 + 0.0015]}>
          <boxGeometry args={[cw - 0.04, 0.003, 0.001]} />
          <meshStandardMaterial color="#999" />
        </mesh>
      ))}
    </group>
  )
}

function PendantModel({ dimensions }: { dimensions: Record<string, number> }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.5
  })

  const fd = d(dimensions, 'fixtureDiameter', 18)
  const fh = d(dimensions, 'fixtureHeight', 14)
  const sl = d(dimensions, 'suspensionLength', 36)
  const cd = d(dimensions, 'canopyDiameter', 5)

  return (
    <group ref={ref}>
      <mesh position={[0, sl + fh, 0]}>
        <cylinderGeometry args={[cd / 2, cd / 2, 0.015, 16]} />
        <meshStandardMaterial color="#333" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, sl / 2 + fh, 0]}>
        <cylinderGeometry args={[0.004, 0.004, sl, 4]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      <mesh position={[0, fh / 2, 0]}>
        <cylinderGeometry args={[fd / 2, fd / 2 * 0.85, fh, 24]} />
        <meshStandardMaterial color="#F5F0E8" side={THREE.DoubleSide} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, fh * 0.35, 0]}>
        <sphereGeometry args={[fd / 6, 16, 16]} />
        <meshStandardMaterial color="#FFF8E0" emissive="#FFF0C0" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

function ModelSwitch({ categoryId, dimensions }: { categoryId: string; dimensions: Record<string, number> }) {
  switch (categoryId) {
    case 'accent-chair': return <AccentChairModel dimensions={dimensions} />
    case 'office-chair': return <ChairModel dimensions={dimensions} />
    case 'sofa-lounge': return <SofaModel dimensions={dimensions} />
    case 'dining-table': return <TableModel dimensions={dimensions} />
    case 'office-desk': return <DeskModel dimensions={dimensions} />
    case 'storage-cabinet': return <CabinetModel dimensions={dimensions} />
    case 'pendant-light': return <PendantModel dimensions={dimensions} />
    default: return <ChairModel dimensions={dimensions} />
  }
}

const cameraPositions: Record<string, [number, number, number]> = {
  'accent-chair': [0.9, 0.6, 0.9],
  'office-chair': [0.8, 0.6, 0.8],
  'sofa-lounge': [2.0, 0.8, 2.0],
  'dining-table': [1.8, 1.0, 1.8],
  'office-desk': [1.8, 0.8, 1.8],
  'storage-cabinet': [1.2, 0.8, 1.2],
  'pendant-light': [0.8, 0.8, 0.8],
}

const Preview3D = ({ category, dimensions }: Preview3DProps) => {
  const [showGrid, setShowGrid] = useState(true)
  const controlsRef = useRef<any>(null)
  const camPos = cameraPositions[category.id] || [1, 0.8, 1]

  return (
    <section className="py-24 bg-[#111]">
      <div className="max-w-[1280px] mx-auto px-5">
        <div className="text-center mb-12 scroll-animate">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            Preview Your <span className="text-[#dc5f00]">{category.name}</span>
          </h2>
          <p className="text-[#a3a1a1] max-w-2xl mx-auto">
            Interact with your generated {category.name.toLowerCase()} in real-time.
            Rotate, zoom, and verify the geometry.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 scroll-animate">
            <div className="relative h-[500px] bg-[#f5f5f5] border border-[#ddd] rounded-lg overflow-hidden">
              <Canvas camera={{ position: camPos, fov: 50 }}>
                <color attach="background" args={['#f5f5f5']} />
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 8, 5]} intensity={1.2} />
                <directionalLight position={[-3, 4, -3]} intensity={0.4} />

                <Suspense fallback={null}>
                  <ModelSwitch categoryId={category.id} dimensions={dimensions} />
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
                  enableZoom={true}
                  enableRotate={true}
                  minDistance={0.3}
                  maxDistance={5}
                />
              </Canvas>

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => controlsRef.current?.reset()}
                    className="p-2 bg-white/80 border border-[#ddd] rounded-lg hover:border-[#dc5f00] transition-colors"
                    title="Reset View"
                  >
                    <RotateCcw size={18} className="text-[#333]" />
                  </button>
                  <button
                    onClick={() => setShowGrid(!showGrid)}
                    className={`p-2 border rounded-lg transition-colors ${
                      showGrid
                        ? 'bg-[#dc5f00] border-[#dc5f00] text-white'
                        : 'bg-white/80 border-[#ddd] hover:border-[#dc5f00] text-[#333]'
                    }`}
                    title="Toggle Grid"
                  >
                    <Grid3X3 size={18} />
                  </button>
                </div>
                <div className="text-xs text-[#888] bg-white/80 px-3 py-1 rounded-full">
                  Drag to rotate / Scroll to zoom
                </div>
              </div>
            </div>
          </div>

          <div className="scroll-animate space-y-6">
            <h3 className="text-xl font-medium">Current Parameters</h3>
            <div className="space-y-3">
              {category.dimensions.map(dim => {
                const val = dimensions[dim.key] ?? dim.default
                const pct = ((val - dim.min) / (dim.max - dim.min)) * 100
                return (
                  <div key={dim.key} className="p-4 bg-[#1a1b1f] border border-[#515151] rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[#a3a1a1]">{dim.label}</span>
                      <span className="font-medium">{val}{dim.unit}</span>
                    </div>
                    <div className="h-2 bg-[#515151]/30 rounded-full">
                      <div
                        className="h-full bg-[#dc5f00] rounded-full"
                        style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="p-4 bg-[#dc5f00]/10 border border-[#dc5f00]/30 rounded-lg">
              <p className="text-sm text-[#a3a1a1]">
                <span className="text-[#dc5f00] font-medium">Tip:</span> Adjust parameters
                in the editor below to see real-time updates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Preview3D
