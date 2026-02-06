import { useState, useRef, Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import * as THREE from 'three'
import { RotateCcw, Grid3X3, Box as BoxIcon, Layers, Eye } from 'lucide-react'

type LODLevel = 'coarse' | 'medium' | 'fine'

interface Preview3DProps {
  dimensions: Record<string, number>
  categoryId: string
  materials: Record<string, string>
}

const getMaterialColor = (matName: string): string => {
  if (matName.includes('Black')) return '#1a1a1a'
  if (matName.includes('Charcoal') || matName.includes('Gray') || matName.includes('Putty')) return '#4a4a4a'
  if (matName.includes('Navy')) return '#1a2a4a'
  if (matName.includes('White')) return '#d4d4d4'
  if (matName.includes('Walnut') || matName.includes('Cognac')) return '#5c3a1e'
  if (matName.includes('Oak') || matName.includes('Maple') || matName.includes('Natural')) return '#c49a6c'
  if (matName.includes('Cherry')) return '#7a3b2e'
  if (matName.includes('Chrome') || matName.includes('Polished') || matName.includes('Aluminum')) return '#b0b0b0'
  if (matName.includes('Brass')) return '#b5a642'
  if (matName.includes('Nickel')) return '#a0a0a0'
  if (matName.includes('Emerald')) return '#2d6a4f'
  if (matName.includes('Marble')) return '#e8e8e0'
  if (matName.includes('Copper')) return '#b87333'
  return '#3a3a3a'
}

const ChairModel = ({ dimensions, materials, lod }: { dimensions: Record<string, number>; materials: Record<string, string>; lod: LODLevel }) => {
  const groupRef = useRef<THREE.Group>(null)
  const s = 0.018
  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.08
  })
  const seatH = (dimensions.seatHeight || 17.5) * s
  const seatW = (dimensions.seatWidth || 19) * s
  const seatD = (dimensions.seatDepth || 17) * s
  const backH = (dimensions.backHeight || 22) * s
  const armH = (dimensions.armHeight || 28) * s
  const seatColor = getMaterialColor(materials.seatMaterial || '')
  const backColor = getMaterialColor(materials.backMaterial || '')
  const frameColor = getMaterialColor(materials.frameMaterial || '')
  const seg = lod === 'fine' ? 24 : lod === 'medium' ? 12 : 6

  return (
    <group ref={groupRef}>
      <mesh position={[0, seatH, 0]}>
        <boxGeometry args={[seatW, 0.06, seatD]} />
        <meshStandardMaterial color={seatColor} roughness={0.7} />
      </mesh>
      {lod !== 'coarse' && (
        <mesh position={[0, seatH + 0.03, 0]}>
          <boxGeometry args={[seatW - 0.02, 0.04, seatD - 0.02]} />
          <meshStandardMaterial color={seatColor} roughness={0.9} />
        </mesh>
      )}
      <mesh position={[0, seatH + backH * s * 2.5, -seatD / 2 + 0.03]}>
        <boxGeometry args={[seatW * 0.85, backH * s * 5, 0.06]} />
        <meshStandardMaterial color={backColor} roughness={0.6} />
      </mesh>
      {lod === 'fine' && (
        <mesh position={[0, seatH + 0.12, -seatD / 2 + 0.06]}>
          <boxGeometry args={[seatW * 0.6, 0.08, 0.06]} />
          <meshStandardMaterial color={backColor} roughness={0.8} />
        </mesh>
      )}
      {armH > 0 && [-1, 1].map(side => (
        <group key={`arm-${side}`}>
          <mesh position={[side * (seatW / 2 + 0.02), seatH + 0.08, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.16, seg]} />
            <meshStandardMaterial color={frameColor} metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[side * (seatW / 2 + 0.02), armH * s + 0.02, -0.02]}>
            <boxGeometry args={[0.04, 0.025, seatD * 0.55]} />
            <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, seatH / 2, 0]}>
        <cylinderGeometry args={[0.03, 0.035, seatH - 0.08, seg]} />
        <meshStandardMaterial color={frameColor} metalness={0.8} roughness={0.2} />
      </mesh>
      {lod !== 'coarse' && (
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.06, 0.04, 0.06, seg]} />
          <meshStandardMaterial color={frameColor} metalness={0.7} roughness={0.25} />
        </mesh>
      )}
      {[0, 72, 144, 216, 288].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const len = 0.22
        return (
          <group key={`leg-${i}`}>
            <mesh position={[Math.cos(rad) * len * 0.5, 0.06, Math.sin(rad) * len * 0.5]} rotation={[0, rad, Math.PI / 2]}>
              <cylinderGeometry args={[0.012, 0.018, len, lod === 'coarse' ? 4 : 8]} />
              <meshStandardMaterial color={frameColor} metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[Math.cos(rad) * len, 0.025, Math.sin(rad) * len]}>
              <sphereGeometry args={[0.022, seg, seg]} />
              <meshStandardMaterial color="#111" roughness={0.9} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

const TableModel = ({ dimensions, materials, lod }: { dimensions: Record<string, number>; materials: Record<string, string>; lod: LODLevel }) => {
  const groupRef = useRef<THREE.Group>(null)
  const s = 0.012
  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.08
  })
  const h = (dimensions.tableHeight || 30) * s
  const l = (dimensions.tableLength || 72) * s
  const w = (dimensions.tableWidth || 36) * s
  const thick = (dimensions.topThickness || 1.25) * s
  const legW = (dimensions.legWidth || 3) * s
  const ovh = (dimensions.overhang || 2) * s
  const topC = getMaterialColor(materials.topMaterial || '')
  const legC = getMaterialColor(materials.legMaterial || '')
  const seg = lod === 'fine' ? 16 : 8

  return (
    <group ref={groupRef}>
      <mesh position={[0, h, 0]}>
        <boxGeometry args={[l, thick, w]} />
        <meshStandardMaterial color={topC} roughness={0.4} />
      </mesh>
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([sx, sz], i) => (
        <mesh key={`leg-${i}`} position={[sx * (l / 2 - ovh - legW / 2), h / 2 - thick / 2, sz * (w / 2 - ovh - legW / 2)]}>
          <boxGeometry args={[legW, h - thick, legW]} />
          <meshStandardMaterial color={legC} roughness={0.3} metalness={0.4} />
        </mesh>
      ))}
      {lod === 'fine' && [-1, 1].map(sz => (
        <mesh key={`apron-${sz}`} position={[0, h - thick - 0.04, sz * (w / 2 - ovh - legW / 2)]}>
          <boxGeometry args={[l - ovh * 2 - legW, 0.03, legW * 0.5]} />
          <meshStandardMaterial color={legC} roughness={0.35} metalness={0.3} />
        </mesh>
      ))}
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([sx, sz], i) => (
        <mesh key={`glide-${i}`} position={[sx * (l / 2 - ovh - legW / 2), 0.005, sz * (w / 2 - ovh - legW / 2)]}>
          <cylinderGeometry args={[legW * 0.4, legW * 0.4, 0.01, seg]} />
          <meshStandardMaterial color="#333" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

const DeskModel = ({ dimensions, materials, lod }: { dimensions: Record<string, number>; materials: Record<string, string>; lod: LODLevel }) => {
  const groupRef = useRef<THREE.Group>(null)
  const s = 0.012
  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.08
  })
  const h = (dimensions.deskHeight || 29) * s
  const w = (dimensions.deskWidth || 60) * s
  const d = (dimensions.deskDepth || 30) * s
  const thick = (dimensions.topThickness || 1) * s
  const modestyH = (dimensions.modestyHeight || 12) * s
  const topC = getMaterialColor(materials.topMaterial || '')
  const frameC = getMaterialColor(materials.frameMaterial || '')

  return (
    <group ref={groupRef}>
      <mesh position={[0, h, 0]}>
        <boxGeometry args={[w, thick, d]} />
        <meshStandardMaterial color={topC} roughness={0.35} />
      </mesh>
      {[-1, 1].map(side => (
        <mesh key={`panel-${side}`} position={[side * (w / 2 - 0.01), h / 2, 0]}>
          <boxGeometry args={[0.02, h - 0.02, d - 0.04]} />
          <meshStandardMaterial color={frameC} roughness={0.4} metalness={0.5} />
        </mesh>
      ))}
      {lod !== 'coarse' && (
        <mesh position={[0, h - thick - modestyH / 2 - 0.02, -d / 2 + 0.015]}>
          <boxGeometry args={[w - 0.08, modestyH, 0.015]} />
          <meshStandardMaterial color={frameC} roughness={0.4} metalness={0.3} />
        </mesh>
      )}
      {lod === 'fine' && (
        <mesh position={[w / 3, h + 0.005, -d / 4]}>
          <cylinderGeometry args={[0.015, 0.015, 0.01, 16]} />
          <meshStandardMaterial color="#222" roughness={0.6} />
        </mesh>
      )}
      <mesh position={[0, 0.005, 0]}>
        <boxGeometry args={[w, 0.01, 0.04]} />
        <meshStandardMaterial color={frameC} roughness={0.4} metalness={0.5} />
      </mesh>
    </group>
  )
}

const CabinetModel = ({ dimensions, materials, lod }: { dimensions: Record<string, number>; materials: Record<string, string>; lod: LODLevel }) => {
  const groupRef = useRef<THREE.Group>(null)
  const s = 0.012
  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.08
  })
  const ch = (dimensions.cabinetHeight || 42) * s
  const cw = (dimensions.cabinetWidth || 36) * s
  const cd = (dimensions.cabinetDepth || 18) * s
  const toeH = (dimensions.toeKickHeight || 4) * s
  const panel = (dimensions.panelThickness || 0.75) * s
  const carcC = getMaterialColor(materials.carcassMaterial || '')
  const doorC = getMaterialColor(materials.doorMaterial || '')
  const hwC = getMaterialColor(materials.hardwareMaterial || '')

  return (
    <group ref={groupRef}>
      {[-1, 1].map(side => (
        <mesh key={`side-${side}`} position={[side * (cw / 2 - panel / 2), ch / 2 + toeH, 0]}>
          <boxGeometry args={[panel, ch - toeH, cd]} />
          <meshStandardMaterial color={carcC} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, ch + panel / 2, 0]}>
        <boxGeometry args={[cw, panel, cd]} />
        <meshStandardMaterial color={carcC} roughness={0.5} />
      </mesh>
      <mesh position={[0, toeH + panel / 2, 0]}>
        <boxGeometry args={[cw - panel * 2, panel, cd]} />
        <meshStandardMaterial color={carcC} roughness={0.5} />
      </mesh>
      <mesh position={[0, ch / 2 + toeH, cd / 2 - 0.003]}>
        <boxGeometry args={[cw - panel, ch - toeH - panel, 0.006]} />
        <meshStandardMaterial color={doorC} roughness={0.4} />
      </mesh>
      {lod !== 'coarse' && [-1, 1].map(side => (
        <mesh key={`hw-${side}`} position={[side * cw * 0.15, ch / 2 + toeH, cd / 2 + 0.005]}>
          <boxGeometry args={[0.005, 0.04, 0.015]} />
          <meshStandardMaterial color={hwC} metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      {lod === 'fine' && [0.5, 0.75].map(pct => (
        <mesh key={`shelf-${pct}`} position={[0, ch * pct + toeH, 0]}>
          <boxGeometry args={[cw - panel * 2 - 0.01, panel * 0.8, cd - 0.02]} />
          <meshStandardMaterial color={carcC} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, toeH / 2, 0]}>
        <boxGeometry args={[cw - 0.04, toeH, cd - 0.02]} />
        <meshStandardMaterial color="#111" roughness={0.9} />
      </mesh>
    </group>
  )
}

const SofaModel = ({ dimensions, materials, lod }: { dimensions: Record<string, number>; materials: Record<string, string>; lod: LODLevel }) => {
  const groupRef = useRef<THREE.Group>(null)
  const s = 0.01
  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.08
  })
  const seatH = (dimensions.seatHeight || 17) * s
  const overallH = (dimensions.overallHeight || 34) * s
  const overallW = (dimensions.overallWidth || 72) * s
  const overallD = (dimensions.overallDepth || 36) * s
  const armH = (dimensions.armHeight || 26) * s
  const upC = getMaterialColor(materials.upholsteryMaterial || '')
  const legC = getMaterialColor(materials.legMaterial || '')
  const seg = lod === 'fine' ? 16 : 8

  return (
    <group ref={groupRef}>
      <mesh position={[0, seatH, overallD * 0.05]}>
        <boxGeometry args={[overallW - 0.12, 0.08, overallD * 0.65]} />
        <meshStandardMaterial color={upC} roughness={0.85} />
      </mesh>
      {lod !== 'coarse' && [-1, 0, 1].map(i => (
        <mesh key={`cushion-${i}`} position={[i * (overallW - 0.12) / 3, seatH + 0.06, overallD * 0.05]}>
          <boxGeometry args={[(overallW - 0.14) / 3 - 0.01, 0.05, overallD * 0.62]} />
          <meshStandardMaterial color={upC} roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, (seatH + overallH) / 2, -overallD / 2 + 0.05]}>
        <boxGeometry args={[overallW - 0.1, overallH - seatH, 0.1]} />
        <meshStandardMaterial color={upC} roughness={0.85} />
      </mesh>
      {lod !== 'coarse' && [-1, 0, 1].map(i => (
        <mesh key={`bc-${i}`} position={[i * (overallW - 0.12) / 3, (seatH + overallH) / 2 + 0.02, -overallD / 2 + 0.12]}>
          <boxGeometry args={[(overallW - 0.14) / 3 - 0.01, (overallH - seatH) * 0.75, 0.06]} />
          <meshStandardMaterial color={upC} roughness={0.9} />
        </mesh>
      ))}
      {[-1, 1].map(side => (
        <mesh key={`arm-${side}`} position={[side * (overallW / 2 - 0.03), (seatH + armH) / 2, 0]}>
          <boxGeometry args={[0.06, armH, overallD - 0.04]} />
          <meshStandardMaterial color={upC} roughness={0.85} />
        </mesh>
      ))}
      <mesh position={[0, seatH / 2, 0]}>
        <boxGeometry args={[overallW - 0.08, seatH - 0.04, overallD - 0.02]} />
        <meshStandardMaterial color="#111" roughness={0.9} />
      </mesh>
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([sx, sz], i) => (
        <mesh key={`leg-${i}`} position={[sx * (overallW / 2 - 0.08), 0.02, sz * (overallD / 2 - 0.08)]}>
          <cylinderGeometry args={[0.012, 0.008, 0.04, seg]} />
          <meshStandardMaterial color={legC} roughness={0.3} metalness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

const PendantModel = ({ dimensions, materials, lod }: { dimensions: Record<string, number>; materials: Record<string, string>; lod: LODLevel }) => {
  const groupRef = useRef<THREE.Group>(null)
  const s = 0.015
  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.y = state.clock.elapsedTime * 0.3
  })
  const diam = (dimensions.fixtureDiameter || 18) * s
  const fH = (dimensions.fixtureHeight || 14) * s
  const suspLen = (dimensions.suspensionLength || 36) * s
  const canopyD = (dimensions.canopyDiameter || 5) * s
  const shadeC = getMaterialColor(materials.shadeMaterial || '')
  const frameC = getMaterialColor(materials.frameMaterial || '')
  const seg = lod === 'fine' ? 32 : lod === 'medium' ? 16 : 8

  return (
    <group ref={groupRef}>
      <mesh position={[0, suspLen + fH / 2, 0]}>
        <cylinderGeometry args={[canopyD / 2, canopyD / 2, 0.015, seg]} />
        <meshStandardMaterial color={frameC} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, (suspLen + fH / 2) / 2 + fH / 4, 0]}>
        <cylinderGeometry args={[0.003, 0.003, suspLen - fH / 2, 6]} />
        <meshStandardMaterial color={frameC} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, fH / 2, 0]}>
        <cylinderGeometry args={[diam / 2 * 0.7, diam / 2, fH, seg, 1, true]} />
        <meshStandardMaterial color={shadeC} roughness={0.6} side={THREE.DoubleSide} transparent opacity={0.9} />
      </mesh>
      {lod !== 'coarse' && (
        <>
          <mesh position={[0, fH, 0]}>
            <torusGeometry args={[diam / 2 * 0.7, 0.005, Math.max(3, seg / 2), seg]} />
            <meshStandardMaterial color={frameC} metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <torusGeometry args={[diam / 2, 0.005, Math.max(3, seg / 2), seg]} />
            <meshStandardMaterial color={frameC} metalness={0.6} roughness={0.3} />
          </mesh>
        </>
      )}
      <pointLight position={[0, fH * 0.3, 0]} intensity={0.6} color="#fff5e0" distance={2} />
      {lod === 'fine' && (
        <mesh position={[0, fH * 0.4, 0]}>
          <sphereGeometry args={[0.02, 12, 12]} />
          <meshStandardMaterial color="#fff8e0" emissive="#fff5c0" emissiveIntensity={0.5} />
        </mesh>
      )}
    </group>
  )
}

const ModelSwitch = ({ categoryId, dimensions, materials, lod }: {
  categoryId: string; dimensions: Record<string, number>; materials: Record<string, string>; lod: LODLevel
}) => {
  switch (categoryId) {
    case 'office-chair': return <ChairModel dimensions={dimensions} materials={materials} lod={lod} />
    case 'dining-table': return <TableModel dimensions={dimensions} materials={materials} lod={lod} />
    case 'office-desk': return <DeskModel dimensions={dimensions} materials={materials} lod={lod} />
    case 'storage-cabinet': return <CabinetModel dimensions={dimensions} materials={materials} lod={lod} />
    case 'sofa-lounge': return <SofaModel dimensions={dimensions} materials={materials} lod={lod} />
    case 'pendant-light': return <PendantModel dimensions={dimensions} materials={materials} lod={lod} />
    default: return <ChairModel dimensions={dimensions} materials={materials} lod={lod} />
  }
}

const Preview3D = ({ dimensions, categoryId, materials }: Preview3DProps) => {
  const [showGrid, setShowGrid] = useState(true)
  const [lod, setLod] = useState<LODLevel>('fine')
  const [wireframe, setWireframe] = useState(false)
  const controlsRef = useRef<any>(null)

  const lodLabels: Record<LODLevel, string> = { coarse: 'Coarse', medium: 'Medium', fine: 'Fine' }
  const lodDesc: Record<LODLevel, string> = {
    coarse: 'Plan views, schedules',
    medium: 'Standard 3D views',
    fine: 'Renderings, close-ups',
  }

  const cam = useMemo(() => {
    if (categoryId === 'pendant-light') return { position: [0.6, 0.5, 0.8] as [number, number, number], fov: 50 }
    if (categoryId === 'sofa-lounge') return { position: [1.2, 0.6, 1.2] as [number, number, number], fov: 50 }
    if (categoryId === 'dining-table') return { position: [1.2, 0.8, 1.2] as [number, number, number], fov: 45 }
    return { position: [0.8, 0.6, 0.8] as [number, number, number], fov: 50 }
  }, [categoryId])

  return (
    <section className="py-24 bg-[#111]">
      <div className="max-w-[1280px] mx-auto px-5">
        <div className="text-center mb-12 scroll-animate">
          <div className="inline-flex items-center gap-2 text-[#dc5f00] text-sm uppercase tracking-widest font-medium mb-4">
            <Eye size={16} />
            <span>Step 4 of 6</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            3D Family <span className="text-[#dc5f00]">Preview</span>
          </h2>
          <p className="text-[#a3a1a1] max-w-2xl mx-auto">
            Interact with the generated Revit family in real-time. Switch between
            Level of Detail views to verify geometry at each representation.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 scroll-animate">
            <div className="relative h-[520px] bg-[#0a0a0a] border border-[#515151] rounded-lg overflow-hidden">
              <Canvas camera={{ position: cam.position, fov: cam.fov }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
                <pointLight position={[-3, 2, -3]} intensity={0.4} />
                <hemisphereLight args={['#b1b1b1', '#1a1a2e', 0.3]} />
                <Suspense fallback={null}>
                  <ModelSwitch categoryId={categoryId} dimensions={dimensions} materials={materials} lod={lod} />
                  {showGrid && (
                    <Grid args={[10, 10]} cellSize={0.5} cellThickness={0.5} cellColor="#515151"
                      sectionSize={2} sectionThickness={1} sectionColor="#dc5f00"
                      fadeDistance={10} fadeStrength={1} followCamera={false} infiniteGrid={true} />
                  )}
                </Suspense>
                <OrbitControls ref={controlsRef} enablePan enableZoom enableRotate minDistance={0.3} maxDistance={5} />
              </Canvas>

              <div className="absolute top-4 left-4 flex items-center gap-1.5">
                {(['coarse', 'medium', 'fine'] as LODLevel[]).map(level => (
                  <button key={level} onClick={() => setLod(level)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                      lod === level ? 'bg-[#dc5f00] text-white' : 'bg-[#1a1b1f]/80 backdrop-blur-sm text-[#a3a1a1] border border-[#515151] hover:border-[#dc5f00]/50'
                    }`}>
                    {lodLabels[level]}
                  </button>
                ))}
              </div>

              <div className="absolute top-4 right-4 bg-[#0a0a0a]/70 backdrop-blur-sm border border-[#515151] rounded-lg px-3 py-2">
                <p className="text-xs text-[#a3a1a1]">LOD: <span className="text-[#dc5f00] font-medium">{lodLabels[lod]}</span></p>
                <p className="text-[10px] text-[#666]">{lodDesc[lod]}</p>
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={() => controlsRef.current?.reset()} className="p-2 bg-[#1a1b1f]/80 backdrop-blur-sm border border-[#515151] rounded-lg hover:border-[#dc5f00] transition-colors" title="Reset View">
                    <RotateCcw size={16} />
                  </button>
                  <button onClick={() => setShowGrid(!showGrid)}
                    className={`p-2 border rounded-lg transition-colors ${showGrid ? 'bg-[#dc5f00] border-[#dc5f00]' : 'bg-[#1a1b1f]/80 backdrop-blur-sm border-[#515151] hover:border-[#dc5f00]'}`}
                    title="Toggle Grid">
                    <Grid3X3 size={16} />
                  </button>
                  <button onClick={() => setWireframe(!wireframe)}
                    className={`p-2 border rounded-lg transition-colors ${wireframe ? 'bg-[#dc5f00] border-[#dc5f00]' : 'bg-[#1a1b1f]/80 backdrop-blur-sm border-[#515151] hover:border-[#dc5f00]'}`}
                    title="Wireframe">
                    <BoxIcon size={16} />
                  </button>
                </div>
                <div className="text-xs text-[#666] bg-[#0a0a0a]/60 backdrop-blur-sm px-3 py-1 rounded-full">Drag to rotate / Scroll to zoom</div>
              </div>
            </div>
          </div>

          <div className="scroll-animate space-y-5">
            <div className="p-5 bg-[#1a1b1f] border border-[#515151] rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="text-[#dc5f00]" size={18} />
                <h4 className="font-medium text-sm">Level of Detail</h4>
              </div>
              <div className="space-y-3">
                {(['coarse', 'medium', 'fine'] as LODLevel[]).map(level => (
                  <button key={level} onClick={() => setLod(level)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      lod === level ? 'bg-[#dc5f00]/10 border-[#dc5f00]/40' : 'bg-[#111] border-[#515151]/50 hover:border-[#515151]'
                    }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{lodLabels[level]}</span>
                      {lod === level && <div className="w-2 h-2 bg-[#dc5f00] rounded-full" />}
                    </div>
                    <p className="text-xs text-[#666] mt-1">{lodDesc[level]}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 bg-[#1a1b1f] border border-[#515151] rounded-lg">
              <h4 className="font-medium text-sm mb-3">Key Dimensions</h4>
              <div className="space-y-2">
                {Object.entries(dimensions).slice(0, 6).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-[#666] capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="font-medium">{val}"</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-[#dc5f00]/10 border border-[#dc5f00]/30 rounded-lg">
              <p className="text-xs text-[#a3a1a1]">
                <span className="text-[#dc5f00] font-medium">LOD Note:</span> Revit uses three detail levels.
                Coarse for plan views, Medium for standard 3D, and Fine for renderings.
                All three representations are included in the exported .rfa file.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Preview3D
