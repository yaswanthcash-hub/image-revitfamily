import { useState, useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import * as THREE from 'three'
import { RotateCcw, Grid3X3, Box as BoxIcon } from 'lucide-react'

interface Preview3DProps {
  parameters: {
    seatHeight: number
    overallHeight: number
    overallWidth: number
    depth: number
    hasArms: boolean
    baseType: string
  }
}

// Chair Component
const Chair = ({ parameters }: Preview3DProps) => {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
    }
  })

  const scale = 0.02
  const seatH = parameters.seatHeight * scale
  const overallH = parameters.overallHeight * scale
  const width = parameters.overallWidth * scale
  const depth = parameters.depth * scale

  return (
    <group ref={groupRef}>
      {/* Seat */}
      <mesh position={[0, seatH, 0]}>
        <boxGeometry args={[width, 0.1, depth]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      
      {/* Backrest */}
      <mesh position={[0, seatH + (overallH - seatH) / 2, -depth / 2 + 0.05]}>
        <boxGeometry args={[width * 0.8, overallH - seatH - 0.2, 0.1]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      
      {/* Armrests */}
      {parameters.hasArms && (
        <>
          <mesh position={[-width / 2 - 0.05, seatH + 0.15, 0]}>
            <boxGeometry args={[0.05, 0.05, depth * 0.6]} />
            <meshStandardMaterial color="#4a4a4a" />
          </mesh>
          <mesh position={[-width / 2 - 0.05, seatH + 0.3, 0]}>
            <boxGeometry args={[0.08, 0.05, depth * 0.5]} />
            <meshStandardMaterial color="#4a4a4a" />
          </mesh>
          <mesh position={[width / 2 + 0.05, seatH + 0.15, 0]}>
            <boxGeometry args={[0.05, 0.05, depth * 0.6]} />
            <meshStandardMaterial color="#4a4a4a" />
          </mesh>
          <mesh position={[width / 2 + 0.05, seatH + 0.3, 0]}>
            <boxGeometry args={[0.08, 0.05, depth * 0.5]} />
            <meshStandardMaterial color="#4a4a4a" />
          </mesh>
        </>
      )}
      
      {/* Base/Legs */}
      {parameters.baseType === '5-Star' ? (
        <>
          {/* Center column */}
          <mesh position={[0, seatH / 2, 0]}>
            <cylinderGeometry args={[0.05, 0.05, seatH, 16]} />
            <meshStandardMaterial color="#6a6a6a" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* 5 legs */}
          {[0, 72, 144, 216, 288].map((angle, i) => (
            <mesh 
              key={i} 
              position={[
                Math.cos((angle * Math.PI) / 180) * 0.25,
                0.05,
                Math.sin((angle * Math.PI) / 180) * 0.25
              ]}
              rotation={[0, 0, (angle * Math.PI) / 180]}
            >
              <boxGeometry args={[0.5, 0.05, 0.05]} />
              <meshStandardMaterial color="#6a6a6a" metalness={0.8} roughness={0.2} />
            </mesh>
          ))}
          {/* Casters */}
          {[0, 72, 144, 216, 288].map((angle, i) => (
            <mesh 
              key={`caster-${i}`} 
              position={[
                Math.cos((angle * Math.PI) / 180) * 0.5,
                0.03,
                Math.sin((angle * Math.PI) / 180) * 0.5
              ]}
            >
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
          ))}
        </>
      ) : parameters.baseType === '4-Leg' ? (
        <>
          {/* 4 legs */}
          {[-0.25, 0.25].map((x) =>
            [-0.25, 0.25].map((z) => (
              <mesh key={`${x}-${z}`} position={[x, seatH / 2, z]}>
                <cylinderGeometry args={[0.03, 0.02, seatH, 8]} />
                <meshStandardMaterial color="#6a6a6a" metalness={0.8} roughness={0.2} />
              </mesh>
            ))
          )}
        </>
      ) : (
        /* Sled base */
        <>
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[width + 0.2, 0.05, depth]} />
            <meshStandardMaterial color="#6a6a6a" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, seatH / 2, -depth / 2 + 0.05]}>
            <cylinderGeometry args={[0.03, 0.03, seatH, 8]} />
            <meshStandardMaterial color="#6a6a6a" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, seatH / 2, depth / 2 - 0.05]}>
            <cylinderGeometry args={[0.03, 0.03, seatH, 8]} />
            <meshStandardMaterial color="#6a6a6a" metalness={0.8} roughness={0.2} />
          </mesh>
        </>
      )}
    </group>
  )
}

const Preview3D = ({ parameters }: Preview3DProps) => {
  const [wireframe, setWireframe] = useState(false)
  const [showGrid, setShowGrid] = useState(true)
  const controlsRef = useRef<any>(null)

  const resetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset()
    }
  }

  return (
    <section className="py-24 bg-[#111]">
      <div className="max-w-[1280px] mx-auto px-5">
        {/* Section Header */}
        <div className="text-center mb-12 scroll-animate">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            Preview Your <span className="text-[#dc5f00]">Family</span>
          </h2>
          <p className="text-[#a3a1a1] max-w-2xl mx-auto">
            Interact with your generated family in real-time. Rotate, zoom, and verify 
            the geometry before export.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 3D Viewer */}
          <div className="lg:col-span-2 scroll-animate">
            <div className="relative h-[500px] bg-[#0a0a0a] border border-[#515151] rounded-lg overflow-hidden">
              <Canvas camera={{ position: [1, 1, 1], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} intensity={1} />
                <pointLight position={[-5, -5, -5]} intensity={0.5} />
                
                <Suspense fallback={null}>
                  <Chair parameters={parameters} />
                  {showGrid && (
                    <Grid
                      args={[10, 10]}
                      cellSize={0.5}
                      cellThickness={0.5}
                      cellColor="#515151"
                      sectionSize={2}
                      sectionThickness={1}
                      sectionColor="#dc5f00"
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
                  minDistance={0.5}
                  maxDistance={5}
                />
              </Canvas>

              {/* Viewer Controls */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={resetView}
                    className="p-2 bg-[#1a1b1f] border border-[#515151] rounded-lg hover:border-[#dc5f00] transition-colors"
                    title="Reset View"
                  >
                    <RotateCcw size={18} />
                  </button>
                  <button
                    onClick={() => setShowGrid(!showGrid)}
                    className={`p-2 border rounded-lg transition-colors ${
                      showGrid 
                        ? 'bg-[#dc5f00] border-[#dc5f00]' 
                        : 'bg-[#1a1b1f] border-[#515151] hover:border-[#dc5f00]'
                    }`}
                    title="Toggle Grid"
                  >
                    <Grid3X3 size={18} />
                  </button>
                  <button
                    onClick={() => setWireframe(!wireframe)}
                    className={`p-2 border rounded-lg transition-colors ${
                      wireframe 
                        ? 'bg-[#dc5f00] border-[#dc5f00]' 
                        : 'bg-[#1a1b1f] border-[#515151] hover:border-[#dc5f00]'
                    }`}
                    title="Wireframe Mode"
                  >
                    <BoxIcon size={18} />
                  </button>
                </div>
                
                <div className="text-xs text-[#666] bg-[#0a0a0a]/80 px-3 py-1 rounded-full">
                  Drag to rotate • Scroll to zoom
                </div>
              </div>
            </div>
          </div>

          {/* Parameters Panel */}
          <div className="scroll-animate space-y-6">
            <h3 className="text-xl font-medium">Current Parameters</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-[#1a1b1f] border border-[#515151] rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#a3a1a1]">Seat Height</span>
                  <span className="font-medium">{parameters.seatHeight}"</span>
                </div>
                <div className="h-2 bg-[#515151]/30 rounded-full">
                  <div 
                    className="h-full bg-[#dc5f00] rounded-full"
                    style={{ width: `${(parameters.seatHeight / 24) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-4 bg-[#1a1b1f] border border-[#515151] rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#a3a1a1]">Overall Height</span>
                  <span className="font-medium">{parameters.overallHeight}"</span>
                </div>
                <div className="h-2 bg-[#515151]/30 rounded-full">
                  <div 
                    className="h-full bg-[#dc5f00] rounded-full"
                    style={{ width: `${(parameters.overallHeight / 48) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-4 bg-[#1a1b1f] border border-[#515151] rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#a3a1a1]">Overall Width</span>
                  <span className="font-medium">{parameters.overallWidth}"</span>
                </div>
                <div className="h-2 bg-[#515151]/30 rounded-full">
                  <div 
                    className="h-full bg-[#dc5f00] rounded-full"
                    style={{ width: `${(parameters.overallWidth / 36) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-4 bg-[#1a1b1f] border border-[#515151] rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#a3a1a1]">Depth</span>
                  <span className="font-medium">{parameters.depth}"</span>
                </div>
                <div className="h-2 bg-[#515151]/30 rounded-full">
                  <div 
                    className="h-full bg-[#dc5f00] rounded-full"
                    style={{ width: `${(parameters.depth / 36) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-4 bg-[#1a1b1f] border border-[#515151] rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#a3a1a1]">Has Arms</span>
                  <span className={`font-medium ${parameters.hasArms ? 'text-green-500' : 'text-[#666]'}`}>
                    {parameters.hasArms ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-[#1a1b1f] border border-[#515151] rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#a3a1a1]">Base Type</span>
                  <span className="font-medium">{parameters.baseType}</span>
                </div>
              </div>
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
