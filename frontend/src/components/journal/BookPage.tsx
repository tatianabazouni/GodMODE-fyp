/**
 * BookPage — A single flippable page of the 3D memoir book.
 * Features realistic paper thickness, subtle bend during flip,
 * and Html overlays for content on both faces.
 */
import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

interface BookPageProps {
  index: number;
  total: number;
  currentPage: number;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  onFlip?: (direction: "next" | "prev") => void;
}

const PAGE_W = 2.6;
const PAGE_H = 3.4;
const PAGE_DEPTH = 0.008;

const BookPage = ({
  index,
  total,
  currentPage,
  leftContent,
  rightContent,
  onFlip,
}: BookPageProps) => {
  const groupRef = useRef<THREE.Group>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  const isFlipped = index < currentPage;
  const isActive = index === currentPage || index === currentPage - 1;
  const targetRotation = isFlipped ? -Math.PI : 0;

  // Slightly different paper tone per page for realism
  const paperColor = useMemo(
    () => new THREE.Color().setHSL(0.1, 0.06, 0.97 - index * 0.002),
    [index]
  );

  // Slightly darker edge color for page edge visibility
  const edgeColor = useMemo(
    () => new THREE.Color().setHSL(0.1, 0.08, 0.92 - index * 0.002),
    [index]
  );

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const current = groupRef.current.rotation.y;
    const diff = targetRotation - current;

    // Faster interpolation for smoother flip (~0.6s feel)
    const speed = Math.abs(diff) > 0.1 ? 0.12 : 0.08;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(current, targetRotation, speed);
  });

  // Z-stack offset so pages don't z-fight
  const zOffset = (total - index) * PAGE_DEPTH * 1.2;

  return (
    <group
      ref={groupRef}
      position={[-PAGE_W / 2, 0, zOffset]}
    >
      {/* Page mesh — slightly thicker for visible edges */}
      <mesh
        ref={meshRef}
        position={[PAGE_W / 2, 0, 0]}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          if (!onFlip) return;
          const localX = e.point.x - (groupRef.current?.position.x ?? 0);
          onFlip(localX > 0 ? "next" : "prev");
        }}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[PAGE_W, PAGE_H, PAGE_DEPTH]} />
        <meshPhysicalMaterial
          color={hovered && isActive ? "#fff8e7" : paperColor}
          roughness={0.9}
          metalness={0}
          clearcoat={0.02}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Page edge strip (right side — visible when book is closed) */}
      <mesh position={[PAGE_W, 0, 0]}>
        <boxGeometry args={[0.003, PAGE_H - 0.05, PAGE_DEPTH + 0.001]} />
        <meshStandardMaterial color={edgeColor} roughness={0.95} />
      </mesh>

      {/* Front face — right page content */}
      <Html
        transform
        position={[PAGE_W / 2, 0, PAGE_DEPTH / 2 + 0.002]}
        scale={0.12}
        className="pointer-events-none select-none"
        style={{ width: "400px", height: "530px" }}
      >
        <div className="w-[400px] h-[530px] p-7 overflow-hidden" style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
          {rightContent}
        </div>
      </Html>

      {/* Back face — left page content */}
      <Html
        transform
        position={[PAGE_W / 2, 0, -(PAGE_DEPTH / 2 + 0.002)]}
        rotation={[0, Math.PI, 0]}
        scale={0.12}
        className="pointer-events-none select-none"
        style={{ width: "400px", height: "530px" }}
      >
        <div className="w-[400px] h-[530px] p-7 overflow-hidden" style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
          {leftContent}
        </div>
      </Html>
    </group>
  );
};

export default BookPage;
