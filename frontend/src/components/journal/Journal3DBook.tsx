/**
 * Journal3DBook — Premium 3D Life Book with realistic book structure.
 *
 * Features:
 * - Leather-textured front/back covers with embossed title
 * - Visible page stack edges (hundreds of pages illusion)
 * - Thick spine with gold lettering area
 * - Floating dust particles for atmosphere
 * - Warm desk lamp lighting
 * - Serif typography on all pages
 * - Sound on page flip
 */
import { useState, useCallback, useEffect, Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, RoundedBox } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, BookOpen, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import useSound from "use-sound";
import * as THREE from "three";
import BookPage from "./BookPage";
import type { LifeBookReflection } from "./lifeBookTypes";

/* ── Types ── */
interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  photos: string[];
  stickers: string[];
}

interface Journal3DBookProps {
  entries?: JournalEntry[];
  reflections?: LifeBookReflection[];
  bookTitle?: string;
  authorName?: string;
  onWriteEntry: () => void;
}

/* ── Mood styling ── */
const moodColors: Record<string, string> = {
  happy: "hsl(44, 100%, 66%)", grateful: "hsl(338, 100%, 39%)",
  reflective: "hsl(228, 67%, 41%)", motivated: "hsl(38, 92%, 50%)",
  calm: "hsl(228, 67%, 41%)", sad: "hsl(220, 10%, 45%)",
};
const moodEmoji: Record<string, string> = {
  happy: "😊", grateful: "❤️", reflective: "🧠",
  motivated: "☀️", calm: "🌙", sad: "☁️",
};

/* ═══════════════════════════════════════════════
   PAGE CONTENT COMPONENTS (serif typography)
   ═══════════════════════════════════════════════ */

const DailyLeftPage = ({ entry, pageNum }: { entry: JournalEntry; pageNum: number }) => (
  <div className="flex flex-col h-full justify-between" style={{ color: "hsl(220, 25%, 15%)" }}>
    <div>
      <p style={{ fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: "hsl(220, 10%, 55%)", marginBottom: "12px", fontFamily: "'Inter', sans-serif" }}>
        {new Date(entry.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
      </p>
      <div style={{ width: "40px", height: "2px", borderRadius: "1px", marginBottom: "20px", background: moodColors[entry.mood] || "hsl(155,45%,43%)" }} />
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
        <span style={{ fontSize: "28px" }}>{moodEmoji[entry.mood] || "📝"}</span>
        <span style={{ fontSize: "13px", textTransform: "capitalize", color: "hsl(220, 10%, 50%)", fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
          {entry.mood}
        </span>
      </div>
    </div>
    {entry.tags.length > 0 && (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "auto" }}>
        {entry.tags.map((tag) => (
          <span key={tag} style={{ fontSize: "9px", padding: "2px 8px", borderRadius: "9999px", background: "hsl(220, 15%, 92%)", color: "hsl(220, 10%, 50%)" }}>
            {tag}
          </span>
        ))}
      </div>
    )}
    <p style={{ fontSize: "8px", color: "hsl(220, 10%, 75%)", textAlign: "center", marginTop: "16px", fontStyle: "italic", fontFamily: "'Playfair Display', serif" }}>
      — {pageNum} —
    </p>
  </div>
);

const DailyRightPage = ({ entry }: { entry: JournalEntry }) => (
  <div className="flex flex-col h-full" style={{ color: "hsl(220, 25%, 15%)" }}>
    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 700, lineHeight: 1.3, marginBottom: "14px" }}>
      {entry.title}
    </h2>
    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "12.5px", lineHeight: 1.9, color: "hsl(220, 15%, 30%)", whiteSpace: "pre-wrap", flex: 1, overflow: "hidden" }}>
      {entry.content}
    </p>
    {entry.photos.length > 0 && (
      <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
        {entry.photos.slice(0, 2).map((photo, i) => (
          <div key={i} style={{ width: "60px", height: "60px", borderRadius: "4px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", transform: `rotate(${i % 2 === 0 ? -2 : 3}deg)` }}>
            <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        ))}
      </div>
    )}
  </div>
);

const ReflectionLeftPage = ({ r, pageNum }: { r: LifeBookReflection; pageNum: number }) => (
  <div className="flex flex-col h-full justify-between" style={{ color: "hsl(220, 25%, 15%)" }}>
    <div>
      <p style={{ fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: "hsl(220, 10%, 55%)", marginBottom: "12px", fontFamily: "'Inter', sans-serif" }}>
        {r.chapterTitle}
      </p>
      <div style={{ width: "40px", height: "2px", borderRadius: "1px", marginBottom: "24px", background: "hsl(155, 45%, 43%)" }} />
      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", lineHeight: 1.5, fontWeight: 600, fontStyle: "italic" }}>
        "{r.prompt}"
      </p>
    </div>
    <p style={{ fontSize: "8px", color: "hsl(220, 10%, 75%)", textAlign: "center", marginTop: "16px", fontStyle: "italic", fontFamily: "'Playfair Display', serif" }}>
      — {pageNum} —
    </p>
  </div>
);

const ReflectionRightPage = ({ r }: { r: LifeBookReflection }) => (
  <div className="flex flex-col h-full" style={{ color: "hsl(220, 25%, 15%)" }}>
    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "12.5px", lineHeight: 1.9, color: "hsl(220, 15%, 30%)", whiteSpace: "pre-wrap", flex: 1, overflow: "hidden" }}>
      {r.response}
    </p>
    <p style={{ fontSize: "9px", color: "hsl(220, 10%, 60%)", textAlign: "right", marginTop: "12px", fontStyle: "italic", fontFamily: "'Playfair Display', serif" }}>
      {new Date(r.writtenAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
    </p>
  </div>
);

const CoverPage = ({ title, author }: { title: string; author: string }) => (
  <div className="flex flex-col items-center justify-center h-full text-center px-6">
    <div style={{ width: "50px", height: "1px", background: "hsl(44, 80%, 55%)", marginBottom: "28px" }} />
    <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: 700, lineHeight: 1.3, color: "hsl(220, 25%, 12%)", marginBottom: "12px" }}>
      {title}
    </h1>
    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "14px", color: "hsl(220, 10%, 45%)", fontStyle: "italic" }}>
      by {author}
    </p>
    <div style={{ width: "50px", height: "1px", background: "hsl(44, 80%, 55%)", marginTop: "28px" }} />
  </div>
);

/* ═══════════════════════════════════════════════
   3D SCENE COMPONENTS
   ═══════════════════════════════════════════════ */

/** Floating dust particles for atmosphere */
function DustMotes({ count = 60 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 10;
      p[i * 3 + 1] = Math.random() * 5 - 1;
      p[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return p;
  }, [count]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.005;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += delta * 0.012;
      if (pos[i * 3 + 1] > 4) pos[i * 3 + 1] = -1;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.015} color="#FFF5E1" transparent opacity={0.35} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

/** Realistic book cover (front or back) */
function BookCover({ position, rotation, isBack, title, author }: {
  position: [number, number, number];
  rotation?: [number, number, number];
  isBack?: boolean;
  title?: string;
  author?: string;
}) {
  const coverW = 2.7;
  const coverH = 3.5;
  const coverD = 0.08;

  return (
    <group position={position} rotation={rotation}>
      {/* Cover board */}
      <RoundedBox args={[coverW, coverH, coverD]} radius={0.02} smoothness={4} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={isBack ? "#3a2415" : "#4a2c1a"}
          roughness={0.85}
          metalness={0.02}
          clearcoat={0.1}
          clearcoatRoughness={0.7}
        />
      </RoundedBox>

      {/* Gold decorative border on front cover */}
      {!isBack && (
        <>
          {/* Top border line */}
          <mesh position={[0, coverH / 2 - 0.3, coverD / 2 + 0.001]}>
            <planeGeometry args={[coverW - 0.5, 0.008]} />
            <meshStandardMaterial color="#C4A35A" metalness={0.6} roughness={0.3} />
          </mesh>
          {/* Bottom border line */}
          <mesh position={[0, -coverH / 2 + 0.3, coverD / 2 + 0.001]}>
            <planeGeometry args={[coverW - 0.5, 0.008]} />
            <meshStandardMaterial color="#C4A35A" metalness={0.6} roughness={0.3} />
          </mesh>
          {/* Left border line */}
          <mesh position={[-coverW / 2 + 0.25, 0, coverD / 2 + 0.001]}>
            <planeGeometry args={[0.008, coverH - 0.5]} />
            <meshStandardMaterial color="#C4A35A" metalness={0.6} roughness={0.3} />
          </mesh>
          {/* Right border line */}
          <mesh position={[coverW / 2 - 0.25, 0, coverD / 2 + 0.001]}>
            <planeGeometry args={[0.008, coverH - 0.5]} />
            <meshStandardMaterial color="#C4A35A" metalness={0.6} roughness={0.3} />
          </mesh>
          {/* Center diamond ornament */}
          <mesh position={[0, -0.6, coverD / 2 + 0.002]} rotation={[0, 0, Math.PI / 4]}>
            <planeGeometry args={[0.12, 0.12]} />
            <meshStandardMaterial color="#C4A35A" metalness={0.6} roughness={0.3} />
          </mesh>
        </>
      )}
    </group>
  );
}

/** Page stack block — simulates hundreds of visible page edges */
function PageStack({ pageCount }: { pageCount: number }) {
  // Stack thickness scales with number of entries (min thickness for "feel")
  const thickness = Math.max(0.15, Math.min(0.6, pageCount * 0.015 + 0.1));

  return (
    <group position={[0, 0, 0]}>
      {/* Main page block */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[2.5, 3.3, thickness]} />
        <meshPhysicalMaterial color="#F5F0E1" roughness={0.95} metalness={0} />
      </mesh>

      {/* Layered page edge lines for realism (right edge) */}
      {Array.from({ length: Math.min(20, Math.max(5, pageCount)) }).map((_, i, arr) => {
        const z = (i / arr.length - 0.5) * thickness;
        return (
          <mesh key={`r-${i}`} position={[1.26, 0, z]}>
            <planeGeometry args={[0.004, 3.25]} />
            <meshStandardMaterial
              color={new THREE.Color().setHSL(0.1, 0.06, 0.88 + (i % 3) * 0.02)}
              roughness={0.95}
            />
          </mesh>
        );
      })}

      {/* Bottom edge lines */}
      {Array.from({ length: Math.min(15, Math.max(4, pageCount)) }).map((_, i, arr) => {
        const z = (i / arr.length - 0.5) * thickness;
        return (
          <mesh key={`b-${i}`} position={[0, -1.66, z]} rotation={[0, 0, Math.PI / 2]}>
            <planeGeometry args={[0.003, 2.45]} />
            <meshStandardMaterial
              color={new THREE.Color().setHSL(0.1, 0.05, 0.87 + (i % 3) * 0.02)}
              roughness={0.95}
            />
          </mesh>
        );
      })}

      {/* Top edge lines */}
      {Array.from({ length: Math.min(15, Math.max(4, pageCount)) }).map((_, i, arr) => {
        const z = (i / arr.length - 0.5) * thickness;
        return (
          <mesh key={`t-${i}`} position={[0, 1.66, z]} rotation={[0, 0, Math.PI / 2]}>
            <planeGeometry args={[0.003, 2.45]} />
            <meshStandardMaterial
              color={new THREE.Color().setHSL(0.1, 0.05, 0.89 + (i % 3) * 0.015)}
              roughness={0.95}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/** Book spine */
function BookSpine({ pageCount }: { pageCount: number }) {
  const thickness = Math.max(0.15, Math.min(0.6, pageCount * 0.015 + 0.1));
  const spineWidth = thickness + 0.16; // cover thickness on each side

  return (
    <group position={[-2.7 / 2 - 0.04, 0, 0]}>
      <RoundedBox args={[0.14, 3.5, spineWidth]} radius={0.03} smoothness={4} castShadow>
        <meshPhysicalMaterial color="#3a2415" roughness={0.85} metalness={0.02} clearcoat={0.1} clearcoatRoughness={0.7} />
      </RoundedBox>
      {/* Gold spine line */}
      <mesh position={[0.071, 0, 0]}>
        <planeGeometry args={[0.006, 3.2]} />
        <meshStandardMaterial color="#C4A35A" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

/** Desk surface */
function Desk() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.85, 0]} receiveShadow>
      <planeGeometry args={[14, 14]} />
      <meshStandardMaterial color="#8B7355" roughness={0.8} metalness={0.02} />
    </mesh>
  );
}

/** Warm atmospheric lighting */
function WarmLighting() {
  const lampRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (!lampRef.current) return;
    // Subtle flicker for desk lamp feel
    lampRef.current.intensity = 0.9 + Math.sin(state.clock.elapsedTime * 2) * 0.03;
  });

  return (
    <>
      <ambientLight intensity={0.3} color="#FFF0D4" />
      <directionalLight position={[2, 6, 3]} intensity={0.6} color="#FFF5E6" castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.001} />
      <pointLight ref={lampRef} position={[1, 3, 2]} color="#FFCC80" intensity={0.9} distance={10} castShadow />
      <pointLight position={[-3, 2, -1]} color="#FFE4C4" intensity={0.15} distance={8} />
    </>
  );
}

/* ═══════════════════════════════════════════════
   MAIN BOOK SCENE
   ═══════════════════════════════════════════════ */

const BookScene = ({
  pages,
  currentPage,
  onFlip,
  bookTitle,
  authorName,
  totalEntries,
}: {
  pages: { left: React.ReactNode; right: React.ReactNode }[];
  currentPage: number;
  onFlip: (dir: "next" | "prev") => void;
  bookTitle?: string;
  authorName?: string;
  totalEntries: number;
}) => {
  const pageStackThickness = Math.max(0.15, Math.min(0.6, totalEntries * 0.015 + 0.1));

  return (
    <>
      <WarmLighting />
      <DustMotes count={50} />
      <Environment preset="apartment" />

      <group position={[0, 0, 0]}>
        {/* Back cover — flat underneath */}
        <BookCover
          position={[0, -0.04, -(pageStackThickness / 2 + 0.04)]}
          isBack
        />

        {/* Front cover — on top when book is closed */}
        <BookCover
          position={[0, -0.04, pageStackThickness / 2 + 0.04]}
          title={bookTitle}
          author={authorName}
        />

        {/* Page stack block (visible edges) */}
        <PageStack pageCount={Math.max(totalEntries, 10)} />

        {/* Spine */}
        <BookSpine pageCount={Math.max(totalEntries, 10)} />

        {/* Actual flippable pages */}
        {pages.map((page, i) => (
          <BookPage
            key={i}
            index={i}
            total={pages.length}
            currentPage={currentPage}
            leftContent={page.left}
            rightContent={page.right}
            onFlip={onFlip}
          />
        ))}
      </group>

      {/* Desk surface */}
      <Desk />

      <ContactShadows position={[0, -1.84, 0]} opacity={0.35} scale={10} blur={2.5} color="#5a3825" />

      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={8}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 2.5}
        minAzimuthAngle={-Math.PI / 6}
        maxAzimuthAngle={Math.PI / 6}
        target={[0, 0, 0]}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
};

/* ═══════════════════════════════════════════════
   EMPTY STATE
   ═══════════════════════════════════════════════ */

const EmptyBook = ({ onWrite }: { onWrite: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center h-full text-center space-y-6 py-20"
  >
    <motion.div
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <BookOpen className="h-20 w-20 text-primary/25" strokeWidth={1} />
    </motion.div>
    <h3 className="font-display text-2xl font-bold text-foreground">
      Your story has not been written yet
    </h3>
    <p className="text-muted-foreground max-w-md leading-relaxed">
      Every great life deserves to be told. Write your first chapter and watch your memoir come to life.
    </p>
    <Button
      onClick={onWrite}
      className="gradient-primary text-primary-foreground shadow-depth rounded-xl"
    >
      <PenLine className="mr-2 h-4 w-4" /> Write Your First Chapter
    </Button>
  </motion.div>
);

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */

const Journal3DBook = ({
  entries = [],
  reflections = [],
  bookTitle,
  authorName,
  onWriteEntry,
}: Journal3DBookProps) => {
  const [currentPage, setCurrentPage] = useState(0);

  // Build pages
  const pages: { left: React.ReactNode; right: React.ReactNode }[] = [];

  if (bookTitle) {
    pages.push({ left: <div />, right: <CoverPage title={bookTitle} author={authorName || ""} /> });
  }

  const sortedEntries = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  sortedEntries.forEach((entry, i) => {
    const pageNum = (bookTitle ? 2 : 1) + i * 2;
    pages.push({
      left: <DailyLeftPage entry={entry} pageNum={pageNum} />,
      right: <DailyRightPage entry={entry} />,
    });
  });

  reflections.forEach((r, i) => {
    const pageNum = (bookTitle ? 2 : 1) + sortedEntries.length * 2 + i * 2;
    pages.push({
      left: <ReflectionLeftPage r={r} pageNum={pageNum} />,
      right: <ReflectionRightPage r={r} />,
    });
  });

  const totalPages = pages.length;
  const totalEntries = sortedEntries.length + reflections.length;

  const [playFlip] = useSound("/sounds/page-flip.mp3", { volume: 0.4 });

  const handleFlip = useCallback(
    (dir: "next" | "prev") => {
      setCurrentPage((p) => {
        const next = dir === "next" ? (p < totalPages ? p + 1 : p) : (p > 0 ? p - 1 : p);
        if (next !== p) playFlip();
        return next;
      });
    },
    [totalPages, playFlip]
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleFlip("next");
      if (e.key === "ArrowLeft") handleFlip("prev");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleFlip]);

  if (totalPages === 0) {
    return <EmptyBook onWrite={onWriteEntry} />;
  }

  const getPageLabel = () => {
    if (currentPage === 0) return bookTitle ? "Cover" : "Page 1";
    if (currentPage > totalPages) return "End";
    return `Page ${currentPage} / ${totalPages}`;
  };

  return (
    <div className="space-y-4">
      <div className="relative w-full h-[560px] rounded-2xl overflow-hidden border border-border/20 shadow-cinematic"
        style={{ background: "linear-gradient(180deg, hsl(30 15% 92%) 0%, hsl(25 12% 85%) 100%)" }}>
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <BookOpen className="h-6 w-6 mr-2 animate-pulse" /> Loading your life book…
            </div>
          }
        >
          <Canvas camera={{ position: [0, 3.5, 6.5], fov: 35 }} shadows dpr={[1, 1.5]}>
            <BookScene
              pages={pages}
              currentPage={currentPage}
              onFlip={handleFlip}
              bookTitle={bookTitle}
              authorName={authorName}
              totalEntries={totalEntries}
            />
          </Canvas>
        </Suspense>

        {/* Navigation */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-background/85 backdrop-blur-md rounded-full px-5 py-2.5 shadow-lg border border-border/30">
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={currentPage === 0} onClick={() => handleFlip("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-muted-foreground min-w-[90px] text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
            {getPageLabel()}
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={currentPage >= totalPages} onClick={() => handleFlip("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Hint */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}
          className="absolute top-4 right-4 text-[10px] text-muted-foreground/40 font-handwritten"
        >
          Use ← → arrow keys to turn pages
        </motion.p>
      </div>

      {/* Preview strip */}
      <AnimatePresence mode="wait">
        {currentPage > 0 && currentPage <= totalPages && (
          <motion.div key={currentPage} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="surface-card p-4 rounded-xl">
            {(() => {
              const idx = currentPage - 1;
              const coverOffset = bookTitle ? 1 : 0;
              const dailyIdx = idx - coverOffset;
              const reflectionIdx = dailyIdx - sortedEntries.length;

              if (bookTitle && idx === 0) {
                return <h3 className="text-lg font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>{bookTitle}</h3>;
              }
              if (dailyIdx >= 0 && dailyIdx < sortedEntries.length) {
                const entry = sortedEntries[dailyIdx];
                return (
                  <>
                    <p className="text-xs text-muted-foreground mb-1">{new Date(entry.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
                    <h3 className="text-lg font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>{entry.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{entry.content}</p>
                  </>
                );
              }
              if (reflectionIdx >= 0 && reflectionIdx < reflections.length) {
                const r = reflections[reflectionIdx];
                return (
                  <>
                    <p className="text-xs text-muted-foreground mb-1">{r.chapterTitle}</p>
                    <h3 className="text-lg font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>"{r.prompt}"</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{r.response}</p>
                  </>
                );
              }
              return null;
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Journal3DBook;
