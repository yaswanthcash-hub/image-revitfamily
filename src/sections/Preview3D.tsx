import { useState, useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import * as THREE from 'three'
import { RotateCcw, Grid3X3 } from 'lucide-react'
import type { RevitFamilyCategory } from '../data/revit-categories'

interface Preview3DProps {
  category: RevitFamilyCategory
  dimensions: Record<string, number>
}

const S = 0.02

function d(dims: Record<string, number>, key: string, fallback: number) {
  return (dims[key] ?? fallback) * S
}

function SingleDoorModel({ dimensions }: { dimensions: Record<string, number> }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15
  })

  const w = d(dimensions, 'width', 36)
  const h = d(dimensions, 'height', 84)
  const t = d(dimensions, 'thickness', 1.75)
  const fw = d(dimensions, 'frameWidth', 4.5)
  const fd = d(dimensions, 'frameDepth', 4.875)

  return (
    <group ref={ref}>
      <mesh position={[-w/2 - fw/2, h/2, 0]}>
        <boxGeometry args={[fw, h, fd]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
      <mesh position={[w/2 + fw/2, h/2, 0]}>
        <boxGeometry args={[fw, h, fd]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
      <mesh position={[0, h + fw/2, 0]}>
        <boxGeometry args={[w + fw*2, fw, fd]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
      <mesh position={[0, h/2, 0]}>
        <boxGeometry args={[w, h, t]} />
        <meshStandardMaterial color="#A0522D" />
      </mesh>
      <mesh position={[w/2 - 0.04, h*0.45, t/2 + 0.01]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.03, 16]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[w/2 - 0.04, h*0.45, t/2 + 0.035]}>
        <boxGeometry args={[0.03, 0.08, 0.02]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}

function DoubleDoorModel({ dimensions }: { dimensions: Record<string, number> }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15
  })

  const w = d(dimensions, 'width', 72)
  const h = d(dimensions, 'height', 84)
  const t = d(dimensions, 'thickness', 1.75)
  const fw = d(dimensions, 'frameWidth', 4.5)
  const lw = d(dimensions, 'leafWidth', 36)

  return (
    <group ref={ref}>
      <mesh position={[-w/2 - fw/2, h/2, 0]}>
        <boxGeometry args={[fw, h, fw]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
      <mesh position={[w/2 + fw/2, h/2, 0]}>
        <boxGeometry args={[fw, h, fw]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
      <mesh position={[0, h + fw/2, 0]}>
        <boxGeometry args={[w + fw*2, fw, fw]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
      <mesh position={[-lw/2, h/2, 0]}>
        <boxGeometry args={[lw - 0.005, h, t]} />
        <meshStandardMaterial color="#A0522D" />
      </mesh>
      <mesh position={[lw/2, h/2, 0]}>
        <boxGeometry args={[lw - 0.005, h, t]} />
        <meshStandardMaterial color="#A0522D" />
      </mesh>
      {[-1, 1].map(side => (
        <mesh key={side} position={[side * (lw/2 - 0.04), h*0.45, t/2 + 0.02]}>
          <sphereGeometry args={[0.02, 16, 16]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}

function WindowModel({ dimensions }: { dimensions: Record<string, number> }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15
  })

  const w = d(dimensions, 'width', 36)
  const h = d(dimensions, 'height', 48)
  const fw = d(dimensions, 'frameWidth', 2.5)
  const sillH = d(dimensions, 'sillHeight', 36)

  return (
    <group ref={ref} position={[0, sillH, 0]}>
      <mesh position={[-w/2 - fw/2, h/2, 0]}>
        <boxGeometry args={[fw, h, fw]} />
        <meshStandardMaterial color="#E8E8E8" />
      </mesh>
      <mesh position={[w/2 + fw/2, h/2, 0]}>
        <boxGeometry args={[fw, h, fw]} />
        <meshStandardMaterial color="#E8E8E8" />
      </mesh>
      <mesh position={[0, h + fw/2, 0]}>
        <boxGeometry args={[w + fw*2, fw, fw]} />
        <meshStandardMaterial color="#E8E8E8" />
      </mesh>
      <mesh position={[0, -fw/2, 0]}>
        <boxGeometry args={[w + fw*2, fw, fw * 1.5]} />
        <meshStandardMaterial color="#E8E8E8" />
      </mesh>
      <mesh position={[0, h/2, 0]}>
        <boxGeometry args={[w, h, 0.02]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.4} />
      </mesh>
      <mesh position={[0, h/2, 0]}>
        <boxGeometry args={[0.02, h, 0.03]} />
        <meshStandardMaterial color="#E8E8E8" />
      </mesh>
      <mesh position={[0, h/2, 0]}>
        <boxGeometry args={[w, 0.02, 0.03]} />
        <meshStandardMaterial color="#E8E8E8" />
      </mesh>
    </group>
  )
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
      <mesh position={[0, sh, sd * 0.05]}>
        <boxGeometry args={[sw, 0.06, sd * 0.9]} />
        <meshStandardMaterial color="#5BA3C9" />
      </mesh>
      <mesh position={[0, sh + bh * 0.5, -sd / 2 + 0.04]}>
        <boxGeometry args={[sw, bh, 0.07]} />
        <meshStandardMaterial color="#5BA3C9" />
      </mesh>
      <mesh position={[-ow / 2 + 0.03, sh + bh * 0.3, -sd * 0.15]}>
        <boxGeometry args={[0.06, bh * 0.6, sd * 0.5]} />
        <meshStandardMaterial color="#4A92B8" />
      </mesh>
      <mesh position={[ow / 2 - 0.03, sh + bh * 0.3, -sd * 0.15]}>
        <boxGeometry args={[0.06, bh * 0.6, sd * 0.5]} />
        <meshStandardMaterial color="#4A92B8" />
      </mesh>
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([x, z], i) => (
        <mesh key={i} position={[(sw/2 - 0.03) * x, sh/2, (sd/2 - 0.03) * z]} rotation={[z * 0.08, 0, -x * 0.08]}>
          <cylinderGeometry args={[0.015, 0.01, sh, 8]} />
          <meshStandardMaterial color="#C8A064" />
        </mesh>
      ))}
    </group>
  )
}

function OfficeChairModel({ dimensions }: { dimensions: Record<string, number> }) {
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
        <mesh key={side} position={[side * (aw / 2), sh + 0.04, 0]}>
          <boxGeometry args={[0.04, 0.03, sd * 0.4]} />
          <meshStandardMaterial color="#555" />
        </mesh>
      ))}
      <mesh position={[0, sh / 2, 0]}>
        <cylinderGeometry args={[0.025, 0.025, sh, 12]} />
        <meshStandardMaterial color="#888" metalness={0.7} roughness={0.3} />
      </mesh>
      {[0, 72, 144, 216, 288].map((a) => {
        const rad = (a * Math.PI) / 180
        return (
          <group key={a}>
            <mesh position={[Math.cos(rad) * 0.15, 0.02, Math.sin(rad) * 0.15]} rotation={[0, rad, 0]}>
              <boxGeometry args={[0.3, 0.015, 0.02]} />
              <meshStandardMaterial color="#888" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[Math.cos(rad) * 0.28, 0.015, Math.sin(rad) * 0.28]}>
              <sphereGeometry args={[0.018, 8, 8]} />
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
  const ow = d(dimensions, 'overallWidth', 84)
  const od = d(dimensions, 'overallDepth', 36)
  const armH = d(dimensions, 'armHeight', 26)

  return (
    <group ref={ref}>
      <mesh position={[0, sh * 0.45, 0]}>
        <boxGeometry args={[ow, sh * 0.9, od]} />
        <meshStandardMaterial color="#C4A77D" />
      </mesh>
      <mesh position={[0, sh + 0.03, od * 0.08]}>
        <boxGeometry args={[ow * 0.8, 0.06, od * 0.6]} />
        <meshStandardMaterial color="#D4B78D" />
      </mesh>
      <mesh position={[0, sh + (oh - sh) * 0.45, -od / 2 + 0.04]}>
        <boxGeometry args={[ow * 0.8, (oh - sh) * 0.85, 0.08]} />
        <meshStandardMaterial color="#C4A77D" />
      </mesh>
      <mesh position={[-ow / 2 + ow * 0.04, armH * 0.5, 0]}>
        <boxGeometry args={[ow * 0.08, armH, od * 0.9]} />
        <meshStandardMaterial color="#B89A6A" />
      </mesh>
      <mesh position={[ow / 2 - ow * 0.04, armH * 0.5, 0]}>
        <boxGeometry args={[ow * 0.08, armH, od * 0.9]} />
        <meshStandardMaterial color="#B89A6A" />
      </mesh>
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
        <mesh key={i} position={[(l / 2 - 0.05) * x, h / 2, (w / 2 - 0.05) * z]}>
          <boxGeometry args={[0.04, h, 0.04]} />
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
    </group>
  )
}

function CabinetModel({ dimensions }: { dimensions: Record<string, number> }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15
  })

  const ch = d(dimensions, 'cabinetHeight', 72)
  const cw = d(dimensions, 'cabinetWidth', 36)
  const cd = d(dimensions, 'cabinetDepth', 24)
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
        <mesh key={side} position={[side * 0.04, tk + (ch - tk) * 0.65, cd / 2 + 0.01]}>
          <boxGeometry args={[0.008, 0.05, 0.01]} />
          <meshStandardMaterial color="#999" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, tk / 2, 0]}>
        <boxGeometry args={[cw - 0.04, tk, cd - 0.04]} />
        <meshStandardMaterial color="#666" />
      </mesh>
    </group>
  )
}

function SteelColumnModel({ dimensions }: { dimensions: Record<string, number> }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15
  })

  const depth = d(dimensions, 'depth', 12)
  const bf = d(dimensions, 'flangeWidth', 8)
  const tf = d(dimensions, 'flangeThickness', 0.75)
  const tw = d(dimensions, 'webThickness', 0.5)
  const len = d(dimensions, 'length', 120)

  return (
    <group ref={ref}>
      <mesh position={[0, len/2, -depth/2 + tf/2]}>
        <boxGeometry args={[bf, len, tf]} />
        <meshStandardMaterial color="#708090" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, len/2, depth/2 - tf/2]}>
        <boxGeometry args={[bf, len, tf]} />
        <meshStandardMaterial color="#708090" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, len/2, 0]}>
        <boxGeometry args={[tw, len, depth - tf*2]} />
        <meshStandardMaterial color="#708090" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  )
}

function ConcreteColumnModel({ dimensions }: { dimensions: Record<string, number> }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15
  })

  const w = d(dimensions, 'width', 24)
  const depth = d(dimensions, 'depth', 24)
  const len = d(dimensions, 'length', 120)

  return (
    <group ref={ref}>
      <mesh position={[0, len/2, 0]}>
        <boxGeometry args={[w, len, depth]} />
        <meshStandardMaterial color="#A0A0A0" roughness={0.8} />
      </mesh>
    </group>
  )
}

function SteelBeamModel({ dimensions }: { dimensions: Record<string, number> }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15
  })

  const depth = d(dimensions, 'depth', 18)
  const bf = d(dimensions, 'flangeWidth', 7.5)
  const tf = d(dimensions, 'flangeThickness', 0.75)
  const tw = d(dimensions, 'webThickness', 0.45)
  const len = d(dimensions, 'length', 240)

  return (
    <group ref={ref} position={[0, depth/2 + 0.1, 0]}>
      <mesh position={[0, depth/2 - tf/2, 0]}>
        <boxGeometry args={[len, tf, bf]} />
        <meshStandardMaterial color="#708090" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, -depth/2 + tf/2, 0]}>
        <boxGeometry args={[len, tf, bf]} />
        <meshStandardMaterial color="#708090" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[len, depth - tf*2, tw]} />
        <meshStandardMaterial color="#708090" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  )
}

function PendantLightModel({ dimensions }: { dimensions: Record<string, number> }) {
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

function RecessedLightModel({ dimensions }: { dimensions: Record<string, number> }) {
  const ref = useRef<THREE.Group>(null)
  const ad = d(dimensions, 'apertureDiameter', 6)
  const hh = d(dimensions, 'housingHeight', 8)

  return (
    <group ref={ref} position={[0, hh, 0]}>
      <mesh position={[0, -hh/2, 0]}>
        <cylinderGeometry args={[ad/2, ad/2 * 0.9, hh, 24]} />
        <meshStandardMaterial color="#E8E8E8" />
      </mesh>
      <mesh position={[0, -hh + 0.02, 0]}>
        <cylinderGeometry args={[ad/2 + 0.01, ad/2 + 0.01, 0.02, 24]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0, -hh + 0.04, 0]}>
        <sphereGeometry args={[ad/4, 16, 16]} />
        <meshStandardMaterial color="#FFFACD" emissive="#FFF8DC" emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}

function ElectricalPanelModel({ dimensions }: { dimensions: Record<string, number> }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15
  })

  const ph = d(dimensions, 'panelHeight', 36)
  const pw = d(dimensions, 'panelWidth', 20)
  const pd = d(dimensions, 'panelDepth', 6)

  return (
    <group ref={ref}>
      <mesh position={[0, ph/2, 0]}>
        <boxGeometry args={[pw, ph, pd]} />
        <meshStandardMaterial color="#404040" metalness={0.4} roughness={0.6} />
      </mesh>
      <mesh position={[0, ph/2, pd/2 + 0.002]}>
        <boxGeometry args={[pw * 0.9, ph * 0.9, 0.01]} />
        <meshStandardMaterial color="#505050" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[pw/2 - 0.03, ph/2, pd/2 + 0.015]}>
        <boxGeometry args={[0.015, 0.04, 0.02]} />
        <meshStandardMaterial color="#808080" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}

function AirTerminalModel({ dimensions }: { dimensions: Record<string, number> }) {
  const ref = useRef<THREE.Group>(null)
  const fw = d(dimensions, 'faceWidth', 24)
  const fl = d(dimensions, 'faceLength', 24)

  return (
    <group ref={ref}>
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[fw, 0.02, fl]} />
        <meshStandardMaterial color="#E8E8E8" />
      </mesh>
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[fw * 0.85, 0.01, fl * 0.85]} />
        <meshStandardMaterial color="#D0D0D0" />
      </mesh>
      {[-2, -1, 0, 1, 2].map(i => (
        <mesh key={i} position={[i * fw * 0.15, 0.015, 0]}>
          <boxGeometry args={[0.005, 0.01, fl * 0.8]} />
          <meshStandardMaterial color="#C0C0C0" />
        </mesh>
      ))}
    </group>
  )
}

function ToiletModel({ dimensions }: { dimensions: Record<string, number> }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15
  })

  const bh = d(dimensions, 'bowlHeight', 15)
  const oh = d(dimensions, 'overallHeight', 28)
  const depth = d(dimensions, 'depth', 28)
  const w = d(dimensions, 'width', 19)

  return (
    <group ref={ref}>
      <mesh position={[0, bh/2, depth * 0.1]}>
        <boxGeometry args={[w, bh, depth * 0.7]} />
        <meshStandardMaterial color="#F5F5F5" />
      </mesh>
      <mesh position={[0, bh + 0.02, depth * 0.1]}>
        <boxGeometry args={[w * 0.95, 0.03, depth * 0.65]} />
        <meshStandardMaterial color="#F0F0F0" />
      </mesh>
      <mesh position={[0, (oh + bh)/2, -depth * 0.3]}>
        <boxGeometry args={[w * 0.85, oh - bh, depth * 0.25]} />
        <meshStandardMaterial color="#F5F5F5" />
      </mesh>
      <mesh position={[0, oh, -depth * 0.3]}>
        <boxGeometry args={[w * 0.8, 0.02, depth * 0.22]} />
        <meshStandardMaterial color="#E8E8E8" />
      </mesh>
    </group>
  )
}

function SinkModel({ dimensions }: { dimensions: Record<string, number> }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15
  })

  const bw = d(dimensions, 'basinWidth', 20)
  const bd = d(dimensions, 'basinDepth', 17)
  const bh = d(dimensions, 'basinHeight', 6)
  const mh = d(dimensions, 'mountHeight', 34)

  return (
    <group ref={ref}>
      <mesh position={[0, mh, 0]}>
        <boxGeometry args={[bw, bh, bd]} />
        <meshStandardMaterial color="#F5F5F5" />
      </mesh>
      <mesh position={[0, mh + 0.01, 0]}>
        <boxGeometry args={[bw * 0.85, bh * 0.8, bd * 0.85]} />
        <meshStandardMaterial color="#E8E8E8" />
      </mesh>
      <mesh position={[0, mh + bh/2 + 0.08, -bd/2 + 0.02]}>
        <cylinderGeometry args={[0.015, 0.012, 0.15, 12]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, mh + bh/2 + 0.16, -bd/2 + 0.04]}>
        <boxGeometry args={[0.04, 0.02, 0.06]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}

function SprinklerModel({ dimensions }: { dimensions: Record<string, number> }) {
  const ref = useRef<THREE.Group>(null)
  const dl = d(dimensions, 'dropLength', 4)

  return (
    <group ref={ref}>
      <mesh position={[0, -dl/2, 0]}>
        <cylinderGeometry args={[0.01, 0.01, dl, 8]} />
        <meshStandardMaterial color="#CD853F" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, -dl - 0.02, 0]}>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshStandardMaterial color="#CD853F" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, -dl - 0.05, 0]}>
        <cylinderGeometry args={[0.04, 0.03, 0.02, 16]} />
        <meshStandardMaterial color="#CD853F" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}

function GenericModel({ dimensions }: { dimensions: Record<string, number> }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15
  })

  const firstDim = Object.values(dimensions)[0] || 24
  const size = firstDim * S

  return (
    <group ref={ref}>
      <mesh position={[0, size/2, 0]}>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial color="#808080" wireframe />
      </mesh>
    </group>
  )
}

function ModelSwitch({ categoryId, dimensions }: { categoryId: string; dimensions: Record<string, number> }) {
  switch (categoryId) {
    case 'single-door': return <SingleDoorModel dimensions={dimensions} />
    case 'double-door': return <DoubleDoorModel dimensions={dimensions} />
    case 'sliding-door': return <SingleDoorModel dimensions={dimensions} />
    case 'casement-window':
    case 'double-hung-window':
    case 'fixed-window': return <WindowModel dimensions={dimensions} />
    case 'accent-chair': return <AccentChairModel dimensions={dimensions} />
    case 'office-chair': return <OfficeChairModel dimensions={dimensions} />
    case 'sofa': return <SofaModel dimensions={dimensions} />
    case 'dining-table': return <TableModel dimensions={dimensions} />
    case 'office-desk': return <DeskModel dimensions={dimensions} />
    case 'storage-cabinet': return <CabinetModel dimensions={dimensions} />
    case 'steel-column': return <SteelColumnModel dimensions={dimensions} />
    case 'concrete-column': return <ConcreteColumnModel dimensions={dimensions} />
    case 'steel-beam': return <SteelBeamModel dimensions={dimensions} />
    case 'pendant-light': return <PendantLightModel dimensions={dimensions} />
    case 'recessed-light': return <RecessedLightModel dimensions={dimensions} />
    case 'electrical-panel': return <ElectricalPanelModel dimensions={dimensions} />
    case 'outlet': return <ElectricalPanelModel dimensions={dimensions} />
    case 'air-terminal': return <AirTerminalModel dimensions={dimensions} />
    case 'mechanical-equipment': return <GenericModel dimensions={dimensions} />
    case 'toilet': return <ToiletModel dimensions={dimensions} />
    case 'sink': return <SinkModel dimensions={dimensions} />
    case 'sprinkler': return <SprinklerModel dimensions={dimensions} />
    default: return <GenericModel dimensions={dimensions} />
  }
}

const cameraPositions: Record<string, [number, number, number]> = {
  'single-door': [1.2, 1.0, 1.2],
  'double-door': [1.5, 1.0, 1.5],
  'sliding-door': [1.5, 1.0, 1.5],
  'casement-window': [0.8, 0.8, 0.8],
  'double-hung-window': [0.8, 0.9, 0.8],
  'fixed-window': [0.8, 0.8, 0.8],
  'accent-chair': [0.6, 0.5, 0.6],
  'office-chair': [0.6, 0.5, 0.6],
  'sofa': [1.4, 0.6, 1.4],
  'dining-table': [1.2, 0.8, 1.2],
  'office-desk': [1.2, 0.7, 1.2],
  'storage-cabinet': [0.8, 0.9, 0.8],
  'steel-column': [1.5, 1.5, 1.5],
  'concrete-column': [1.2, 1.5, 1.2],
  'steel-beam': [2.5, 0.6, 1.5],
  'pendant-light': [0.6, 0.6, 0.6],
  'recessed-light': [0.4, 0.3, 0.4],
  'electrical-panel': [0.6, 0.5, 0.6],
  'outlet': [0.3, 0.2, 0.3],
  'air-terminal': [0.5, 0.3, 0.5],
  'mechanical-equipment': [1.0, 0.8, 1.0],
  'toilet': [0.5, 0.4, 0.5],
  'sink': [0.5, 0.5, 0.5],
  'sprinkler': [0.3, 0.2, 0.3],
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
