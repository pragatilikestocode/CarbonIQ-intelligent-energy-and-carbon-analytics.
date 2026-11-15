import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { ServerRack } from '../../types';
import { Flame, Eye, RotateCw, RefreshCcw, Layers } from 'lucide-react';

interface Rack3DProps {
  rack: ServerRack;
  position: [number, number, number];
  isSelected: boolean;
  thermalMode: boolean;
  onSelect: (rack: ServerRack) => void;
}

const Rack3D: React.FC<Rack3DProps> = ({ rack, position, isSelected, thermalMode, onSelect }) => {
  const [hovered, setHovered] = useState(false);
  const ledsRef = useRef<THREE.Group>(null);

  // Animated LED blinking
  useFrame((state) => {
    if (ledsRef.current) {
      ledsRef.current.children.forEach((child, idx) => {
        const mesh = child as THREE.Mesh;
        if (mesh.material && 'opacity' in mesh.material) {
          const t = state.clock.getElapsedTime() * 4 + idx + (rack.id.charCodeAt(5) || 0);
          mesh.material.opacity = 0.35 + Math.sin(t) * 0.45;
        }
      });
    }
  });

  // Calculate rack color based on temperature in thermal mode
  const getRackColor = () => {
    if (!thermalMode) {
      if (isSelected) return '#00f5ff';
      if (hovered) return '#38bdf8';
      return '#0f172a';
    }
    // Thermal Heatmap coloring
    const t = rack.avgTempCelsius;
    if (t > 78) return '#ef4444'; // Hot red
    if (t > 65) return '#f59e0b'; // Warm orange
    if (t > 50) return '#06b6d4'; // Optimal cyan
    return '#10b981'; // Cool green
  };

  const getLedColor = () => {
    if (rack.avgTempCelsius > 78) return '#ef4444';
    if (rack.avgTempCelsius > 65) return '#f59e0b';
    return '#00ff88';
  };

  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(rack);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* Main Server Cabinet Chassis */}
      <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 3.6, 1.4]} />
        <meshStandardMaterial
          color={getRackColor()}
          metalness={0.85}
          roughness={0.25}
          emissive={isSelected ? '#00f5ff' : hovered ? '#0284c7' : '#000000'}
          emissiveIntensity={isSelected ? 0.35 : hovered ? 0.2 : 0}
        />
      </mesh>

      {/* Rack Framing Accents */}
      <mesh position={[0, 1.8, 0.71]}>
        <planeGeometry args={[1.1, 3.4]} />
        <meshBasicMaterial color="#050814" />
      </mesh>

      {/* Front Server Blades (8 Nodes per rack) */}
      <group position={[0, 0.2, 0.72]}>
        {Array.from({ length: 8 }).map((_, i) => (
          <group key={i} position={[0, i * 0.4 + 0.2, 0]}>
            {/* Server Blade Faceplate */}
            <mesh>
              <boxGeometry args={[0.96, 0.32, 0.05]} />
              <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.3} />
            </mesh>
            {/* Ventilation Grille texture simulation */}
            <mesh position={[0, 0, 0.03]}>
              <planeGeometry args={[0.88, 0.12]} />
              <meshBasicMaterial color="#0f172a" />
            </mesh>
          </group>
        ))}
      </group>

      {/* Blinking Activity LEDs Strip */}
      <group ref={ledsRef} position={[0.42, 0.2, 0.74]}>
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={i} position={[0, i * 0.4 + 0.2, 0]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshBasicMaterial
              color={getLedColor()}
              transparent
              opacity={0.8}
            />
          </mesh>
        ))}
      </group>

      {/* Holographic Label Floating Above Rack */}
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
        <group position={[0, 4.1, 0]}>
          <Text
            fontSize={0.24}
            color={isSelected ? '#00f5ff' : '#ffffff'}
            anchorX="center"
            anchorY="middle"
          >
            {rack.id}
          </Text>
          <Text
            position={[0, -0.22, 0]}
            fontSize={0.15}
            color={rack.avgTempCelsius > 75 ? '#f87171' : '#38bdf8'}
            anchorX="center"
            anchorY="middle"
          >
            {`${rack.totalPowerKw} kW | ${rack.avgTempCelsius}°C`}
          </Text>
        </group>
      </Float>

      {/* Selection Glow Cylinder Base */}
      {isSelected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.9, 1.3, 32]} />
          <meshBasicMaterial color="#00f5ff" side={THREE.DoubleSide} transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
};

// Particle Flow for Cold/Hot Aisle Air Circulation
const AirflowParticles: React.FC = () => {
  const count = 180;
  const particlesRef = useRef<THREE.Points>(null);

  const [positions] = useState(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = Math.random() * 4.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return pos;
  });

  useFrame((_, delta) => {
    if (particlesRef.current) {
      const positionsArray = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        // Upward convection flow
        positionsArray[i * 3 + 1] += delta * 0.8;
        if (positionsArray[i * 3 + 1] > 4.5) {
          positionsArray[i * 3 + 1] = 0.1;
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#00f5ff"
        transparent
        opacity={0.45}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// Floor Grid & Data Center Environment
const FloorGrid: React.FC = () => {
  return (
    <group>
      {/* Reflective Dark Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[30, 24]} />
        <meshStandardMaterial
          color="#04060d"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {/* Cyber Grid Lines */}
      <gridHelper args={[26, 26, '#00f5ff', '#0e244d']} position={[0, 0.01, 0]} />

      {/* Hot/Cold Aisle Marking Strip */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[14, 1.8]} />
        <meshBasicMaterial color="#0284c7" transparent opacity={0.12} />
      </mesh>
    </group>
  );
};

interface DataCenterSceneProps {
  racks: ServerRack[];
  selectedRack: ServerRack | null;
  onSelectRack: (rack: ServerRack) => void;
}

export const DataCenterScene: React.FC<DataCenterSceneProps> = ({
  racks,
  selectedRack,
  onSelectRack,
}) => {
  const [thermalMode, setThermalMode] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const controlsRef = useRef<any>(null);

  // Layout 8 racks into two parallel rows of 4 racks facing each other
  const getRackPosition = (index: number): [number, number, number] => {
    const row = index < 4 ? 0 : 1;
    const col = index % 4;
    const x = (col - 1.5) * 3.2;
    const z = row === 0 ? -2.2 : 2.2;
    return [x, 0, z];
  };

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden glass-panel border border-cyber-cyan/30 shadow-2xl">
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [9, 8, 11], fov: 42 }}
        className="w-full h-full cursor-grab active:cursor-grabbing bg-radial-gradient"
      >
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 15, 10]}
          intensity={0.9}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        {/* Overhead Neon Strips */}
        <pointLight position={[0, 6, -2.2]} intensity={1.2} color="#00f5ff" distance={12} />
        <pointLight position={[0, 6, 2.2]} intensity={1.2} color="#00ff88" distance={12} />
        <fog attach="fog" args={['#05070f', 8, 28]} />

        {/* Floor and Airflow */}
        <FloorGrid />
        <AirflowParticles />

        {/* Server Racks */}
        {racks.map((rack, idx) => (
          <Rack3D
            key={rack.id}
            rack={rack}
            position={getRackPosition(idx)}
            isSelected={selectedRack?.id === rack.id}
            thermalMode={thermalMode}
            onSelect={onSelectRack}
          />
        ))}

        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={autoRotate}
          autoRotateSpeed={0.8}
          maxPolarAngle={Math.PI / 2.05}
          minDistance={4}
          maxDistance={22}
        />
      </Canvas>

      {/* Floating 3D HUD Overlay Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
        <div className="px-3 py-1.5 rounded-xl glass-panel-glow border border-cyber-cyan/40 text-xs font-mono text-white flex items-center gap-2 shadow-lg">
          <Layers className="w-3.5 h-3.5 text-cyber-cyan" />
          <span>3D CLUSTER DIGITAL TWIN</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyber-neon animate-pulse" />
        </div>

        <button
          onClick={() => setThermalMode(!thermalMode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium border transition-all duration-300 shadow-md ${
            thermalMode
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-glow-rose'
              : 'glass-panel text-slate-300 hover:text-white border-slate-700 hover:border-cyber-cyan/50'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>{thermalMode ? 'Thermal Heatmap: ON' : 'Thermal Heatmap'}</span>
        </button>

        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium border transition-all duration-300 shadow-md ${
            autoRotate
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
              : 'glass-panel text-slate-400 hover:text-slate-200 border-slate-700'
          }`}
        >
          <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
          <span>Rotate</span>
        </button>

        <button
          onClick={handleResetCamera}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium glass-panel text-slate-400 hover:text-white border-slate-700 hover:border-cyber-cyan/50 transition-all duration-300 shadow-md"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          <span>Reset Camera</span>
        </button>
      </div>

      {/* Legend & Quick Hint */}
      <div className="absolute bottom-4 left-4 z-10 glass-panel px-3.5 py-2 rounded-xl text-[11px] font-mono text-slate-300 border border-slate-700/60 flex items-center gap-4">
        <span className="text-slate-400 flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-cyber-cyan" />
          Click any rack to inspect GPU blades
        </span>
        <div className="h-3 w-px bg-slate-700 hidden sm:block" />
        <div className="hidden sm:flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> &lt;50°C Cool
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" /> 50-65°C Optimal
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> 65-75°C Warm
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> &gt;78°C Throttling
          </span>
        </div>
      </div>
    </div>
  );
};

