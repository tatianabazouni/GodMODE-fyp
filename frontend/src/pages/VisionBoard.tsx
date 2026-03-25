import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Target,
  Sparkles,
  Star,
  Search,
  ChevronDown,
  Calendar,
  Heart,
  CheckCircle2,
  Trophy,
  X,
  Eye,
  Upload,
  Camera,
  Layout,
  MoreHorizontal,
  Pencil,
  Trash2,
  FolderPlus,
  GripVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ===== TYPES =====
interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

interface Dream {
  id: string;
  boardId: string;
  title: string;
  description: string;
  targetYear: number;
  motivation: string;
  imageUrl: string;
  category: DreamCategory;
  tags: string[];
  convertedToGoal: boolean;
  achieved: boolean;
  achievedPhotoUrl?: string;
  achievedNote?: string;
  subtasks: Subtask[];
  createdAt: string;
  order: number;
}

type DreamCategory = "personal" | "travel" | "career" | "relationships" | "health";

interface Board {
  id: string;
  name: string;
  emoji: string;
  order: number;
  createdAt: string;
}

const categories = ["all", "personal", "travel", "career", "relationships", "health"] as const;

const categoryEmojis: Record<string, string> = {
  personal: "✨",
  travel: "🌍",
  career: "🚀",
  relationships: "💕",
  health: "🌿",
};

const boardEmojiOptions = ["🌟", "🎯", "💫", "🌈", "🔥", "🌊", "🏔️", "🦋", "🌸", "⚡", "🎨", "💎"];

// ===== PERSISTENCE =====
const BOARDS_KEY = "lifeos-vision-boards";
const DREAMS_KEY = "lifeos-dreams";

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

// ===== FLOATING DECORATIONS =====
const FloatingParticles = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 rounded-full bg-golden/40"
        style={{ left: `${15 + i * 15}%`, top: `${10 + (i % 3) * 30}%` }}
        animate={{ y: [0, -20, 0], opacity: [0.2, 0.6, 0.2], scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
      />
    ))}
    {[...Array(4)].map((_, i) => (
      <motion.div
        key={`star-${i}`}
        className="absolute text-golden/20"
        style={{ right: `${10 + i * 20}%`, top: `${5 + i * 25}%` }}
        animate={{ rotate: [0, 180, 360], opacity: [0.1, 0.3, 0.1], scale: [0.6, 1, 0.6] }}
        transition={{ duration: 6 + i, repeat: Infinity, delay: i * 0.8, ease: "easeInOut" }}
      >
        <Star className="h-3 w-3" />
      </motion.div>
    ))}
  </div>
);

// ===== IMAGE UPLOAD =====
const ImageUploadZone = ({
  imageUrl,
  onImageChange,
  label,
  height = "h-40",
  className = "",
}: {
  imageUrl: string;
  onImageChange: (url: string) => void;
  label?: string;
  height?: string;
  className?: string;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      onImageChange(URL.createObjectURL(file));
    },
    [onImageChange]
  );
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {imageUrl ? (
        <div className={`relative rounded-xl overflow-hidden ${height} group/img`}>
          <img src={imageUrl} alt="Upload" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-foreground/0 group-hover/img:bg-foreground/40 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover/img:opacity-100 transition-opacity flex gap-2">
              <Button size="sm" variant="secondary" className="rounded-full shadow-lg" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
                <Camera className="h-3 w-3 mr-1" /> Change
              </Button>
              <Button size="sm" variant="secondary" className="rounded-full shadow-lg" onClick={(e) => { e.stopPropagation(); onImageChange(""); }}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <motion.div
          className={`relative rounded-xl border-2 border-dashed border-border hover:border-primary/40 ${height} flex flex-col items-center justify-center cursor-pointer transition-colors bg-muted/30`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Upload className="h-6 w-6 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground font-medium">{label || "Drop an image or click to upload"}</p>
          <p className="text-xs text-muted-foreground/60 mt-1">JPG, PNG, WebP</p>
        </motion.div>
      )}
    </div>
  );
};

// ===== EMPTY STATES =====
const EmptyBoardState = ({ onAdd }: { onAdd: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    className="relative flex flex-col items-center justify-center py-20 text-center"
  >
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <motion.div className="w-64 h-64 rounded-full border border-golden/10" animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 4, repeat: Infinity }} />
      <motion.div className="absolute w-48 h-48 rounded-full border border-coral/10" animate={{ scale: [1.05, 1, 1.05], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 5, repeat: Infinity, delay: 0.5 }} />
      <motion.div className="absolute w-32 h-32 rounded-full border border-teal/15" animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3.5, repeat: Infinity, delay: 1 }} />
    </div>
    <motion.div className="relative z-10" initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring", stiffness: 100 }}>
      <div className="w-20 h-20 rounded-full gradient-warm flex items-center justify-center mb-6 mx-auto shadow-glow-golden">
        <Sparkles className="h-8 w-8 text-amber" />
      </div>
      <h2 className="font-display text-3xl font-bold text-foreground mb-3">Start imagining your future today</h2>
      <p className="text-muted-foreground max-w-md mx-auto mb-2 text-base">
        Your vision board is where dreams take shape. Create a board, pin your dreams, and watch them evolve into goals.
      </p>
      <p className="font-handwritten text-lg text-amber mb-8">Every journey begins with a vision ✦</p>
      <Button onClick={onAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 py-3 text-base shadow-glow-teal">
        <FolderPlus className="mr-2 h-5 w-5" /> Create your first board
      </Button>
    </motion.div>
  </motion.div>
);

const EmptyDreamState = ({ onAdd }: { onAdd: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="relative flex flex-col items-center justify-center py-16 text-center"
  >
    <FloatingParticles />
    <motion.div className="relative z-10" initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}>
      <div className="w-16 h-16 rounded-full gradient-warm flex items-center justify-center mb-5 mx-auto shadow-glow-golden">
        <Sparkles className="h-7 w-7 text-amber" />
      </div>
      <h3 className="font-display text-2xl font-bold text-foreground mb-2">Start imagining your future today</h3>
      <p className="text-muted-foreground max-w-sm mx-auto mb-2 text-sm">
        This board is waiting for your aspirations. Pin your dreams and watch them transform into reality.
      </p>
      <p className="font-handwritten text-base text-amber mb-6">Every great story begins with a dream ✦</p>
      <Button onClick={onAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-5 shadow-glow-teal">
        <Plus className="mr-2 h-4 w-4" /> Pin your first dream
      </Button>
    </motion.div>
  </motion.div>
);

// ===== DREAM CARD =====
const DreamCard = ({
  dream,
  index,
  onExpand,
  onEdit,
  onDelete,
}: {
  dream: Dream;
  index: number;
  onExpand: (dream: Dream) => void;
  onEdit: (dream: Dream) => void;
  onDelete: (id: string) => void;
}) => {
  const progress = dream.subtasks.length > 0
    ? Math.round((dream.subtasks.filter((s) => s.done).length / dream.subtasks.length) * 100)
    : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ delay: index * 0.07, duration: 0.5, ease: "easeOut" }}
      className="break-inside-avoid group cursor-pointer mb-4"
      onClick={() => onExpand(dream)}
    >
      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={`surface-scrapbook rounded-2xl overflow-hidden relative ${dream.achieved ? "ring-2 ring-golden/40 shadow-glow-golden" : ""}`}
      >
        {index % 3 === 0 && <div className="tape-effect" />}

        {/* Card actions */}
        <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(dream); }}
            className="p-1.5 rounded-lg bg-card/80 backdrop-blur-sm hover:bg-card transition-colors shadow-sm"
          >
            <Pencil className="h-3 w-3 text-muted-foreground" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(dream.id); }}
            className="p-1.5 rounded-lg bg-card/80 backdrop-blur-sm hover:bg-destructive/10 transition-colors shadow-sm"
          >
            <Trash2 className="h-3 w-3 text-destructive" />
          </button>
        </div>

        {dream.achieved && (
          <motion.div className="absolute inset-0 z-10 pointer-events-none" animate={{ opacity: [0.05, 0.12, 0.05] }} transition={{ duration: 3, repeat: Infinity }}>
            <div className="absolute inset-0 bg-gradient-to-br from-golden/10 via-transparent to-amber/10 rounded-2xl" />
          </motion.div>
        )}

        {dream.imageUrl && (
          <div className="overflow-hidden relative">
            <motion.img src={dream.imageUrl} alt={dream.title} className="w-full object-cover group-hover:scale-105 transition-transform duration-700" style={{ maxHeight: 220 }} />
            <div className="absolute inset-0 bg-gradient-to-t from-card/60 to-transparent" />
            {dream.achieved && (
              <motion.div className="absolute top-3 left-3 z-20" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.3 }}>
                <div className="flex items-center gap-1 bg-golden/90 text-golden-foreground rounded-full px-3 py-1 text-xs font-semibold shadow-glow-golden">
                  <Trophy className="h-3 w-3" /> Achieved
                </div>
              </motion.div>
            )}
          </div>
        )}

        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs capitalize gap-1 rounded-full">
              {categoryEmojis[dream.category]} {dream.category}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {dream.targetYear}
            </span>
          </div>
          <h3 className="font-display font-semibold text-base text-foreground leading-snug">{dream.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{dream.description}</p>
          {dream.motivation && <p className="font-handwritten text-sm text-amber italic">"{dream.motivation}"</p>}

          {dream.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {dream.tags.map((tag) => (
                <span key={tag} className="text-[10px] bg-muted text-muted-foreground rounded-full px-2 py-0.5">#{tag}</span>
              ))}
            </div>
          )}

          {dream.convertedToGoal && !dream.achieved && (
            <div className="pt-1 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1"><Target className="h-3 w-3 text-teal" /> Goal Progress</span>
                <span className="font-semibold text-teal">{progress}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          )}

          <div className="pt-1">
            <motion.div className="text-xs text-muted-foreground/60 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Eye className="h-3 w-3" /> Click to explore
            </motion.div>
          </div>
        </div>

        <motion.div
          className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="h-4 w-4 text-golden/50" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

// ===== DREAM DETAIL DIALOG =====
const DreamDetailDialog = ({
  dream, open, onClose, onConvertToGoal, onMarkAchieved, onToggleSubtask, onUpdateImage, onEdit, onDelete,
}: {
  dream: Dream | null; open: boolean; onClose: () => void;
  onConvertToGoal: (id: string) => void;
  onMarkAchieved: (id: string, photoUrl?: string, note?: string) => void;
  onToggleSubtask: (dreamId: string, subtaskId: string) => void;
  onUpdateImage: (id: string, imageUrl: string) => void;
  onEdit: (dream: Dream) => void;
  onDelete: (id: string) => void;
}) => {
  const [achievePhotoUrl, setAchievePhotoUrl] = useState("");
  const [achieveNote, setAchieveNote] = useState("");
  if (!dream) return null;

  const progress = dream.subtasks.length > 0
    ? Math.round((dream.subtasks.filter((s) => s.done).length / dream.subtasks.length) * 100)
    : 0;
  const allDone = dream.subtasks.length > 0 && dream.subtasks.every((s) => s.done);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl surface-scrapbook border-border/60 p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        {dream.imageUrl ? (
          <div className="relative h-48 overflow-hidden">
            <img src={dream.imageUrl} alt={dream.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
            {dream.achieved && (
              <motion.div className="absolute top-4 right-4" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                <div className="flex items-center gap-1.5 bg-golden text-golden-foreground rounded-full px-4 py-1.5 text-sm font-bold shadow-glow-golden">
                  <Trophy className="h-4 w-4" /> Dream Achieved
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="px-6 pt-6">
            <ImageUploadZone imageUrl="" onImageChange={(url) => onUpdateImage(dream.id, url)} label="Add an image for this dream" height="h-36" />
          </div>
        )}

        <div className="p-6 space-y-4">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="capitalize rounded-full text-xs">{categoryEmojis[dream.category]} {dream.category}</Badge>
              <span className="text-xs text-muted-foreground">Target: {dream.targetYear}</span>
            </div>
            <DialogTitle className="font-display text-2xl">{dream.title}</DialogTitle>
            <DialogDescription className="text-base">{dream.description}</DialogDescription>
          </DialogHeader>

          {dream.motivation && (
            <div className="gradient-warm rounded-xl p-4">
              <p className="font-handwritten text-lg text-amber italic">"{dream.motivation}"</p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Heart className="h-3 w-3 text-coral" /> Your motivation</p>
            </div>
          )}

          {dream.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {dream.tags.map((tag) => <Badge key={tag} variant="outline" className="rounded-full text-xs">#{tag}</Badge>)}
            </div>
          )}

          {dream.convertedToGoal && (
            <div className="space-y-3 bg-muted/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold flex items-center gap-1.5"><Target className="h-4 w-4 text-teal" /> Goal Progress</h4>
                <span className="text-sm font-bold text-teal">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              {dream.subtasks.length > 0 && (
                <div className="space-y-2 mt-2">
                  {dream.subtasks.map((task) => (
                    <motion.button
                      key={task.id}
                      className="flex items-center gap-2 w-full text-left text-sm hover:bg-muted rounded-lg px-2 py-1.5 transition-colors"
                      onClick={(e) => { e.stopPropagation(); onToggleSubtask(dream.id, task.id); }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <CheckCircle2 className={`h-4 w-4 shrink-0 ${task.done ? "text-teal fill-teal/20" : "text-muted-foreground"}`} />
                      <span className={task.done ? "line-through text-muted-foreground" : "text-foreground"}>{task.title}</span>
                    </motion.button>
                  ))}
                </div>
              )}
              {allDone && !dream.achieved && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="gradient-coral rounded-xl p-4 mt-2 space-y-3">
                  <div className="text-center">
                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                      <Sparkles className="h-6 w-6 text-golden mx-auto mb-2" />
                    </motion.div>
                    <p className="font-display text-sm font-semibold text-foreground">All tasks complete!</p>
                    <p className="text-xs text-muted-foreground mb-2">Celebrate your dream — add a photo of your reality</p>
                  </div>
                  <ImageUploadZone imageUrl={achievePhotoUrl} onImageChange={setAchievePhotoUrl} label="Upload a photo of your achieved dream" height="h-28" />
                  <Input placeholder="Write a reflection note..." value={achieveNote} onChange={(e) => setAchieveNote(e.target.value)} className="rounded-xl text-sm" />
                  <Button
                    size="sm"
                    className="w-full bg-golden text-golden-foreground hover:bg-golden/90 shadow-glow-golden"
                    onClick={() => { onMarkAchieved(dream.id, achievePhotoUrl, achieveNote); setAchievePhotoUrl(""); setAchieveNote(""); }}
                  >
                    <Trophy className="mr-1 h-3 w-3" /> Mark as Achieved
                  </Button>
                </motion.div>
              )}
            </div>
          )}

          {dream.achieved && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl overflow-hidden border border-golden/20">
              {dream.achievedPhotoUrl && <img src={dream.achievedPhotoUrl} alt="Achieved" className="w-full h-40 object-cover" />}
              {dream.achievedNote && (
                <div className="p-3 bg-golden/5"><p className="font-handwritten text-sm text-amber">{dream.achievedNote}</p></div>
              )}
            </motion.div>
          )}

          <DialogFooter className="gap-2 flex-wrap">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { onClose(); onEdit(dream); }} className="rounded-xl">
                <Pencil className="mr-1 h-3 w-3" /> Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => { onDelete(dream.id); onClose(); }} className="rounded-xl text-destructive hover:text-destructive">
                <Trash2 className="mr-1 h-3 w-3" /> Delete
              </Button>
            </div>
            <div className="flex gap-2 ml-auto">
              {!dream.convertedToGoal && !dream.achieved && (
                <Button onClick={() => onConvertToGoal(dream.id)} className="bg-teal text-teal-foreground hover:bg-teal/90 rounded-xl">
                  <Target className="mr-2 h-4 w-4" /> Convert to Goal
                </Button>
              )}
              <Button variant="outline" onClick={onClose} className="rounded-xl">Close</Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ===== ADD / EDIT DREAM DIALOG =====
const DreamFormDialog = ({
  open, onClose, onSubmit, boardId, editDream,
}: {
  open: boolean; onClose: () => void; boardId: string;
  onSubmit: (dream: Omit<Dream, "id" | "convertedToGoal" | "achieved" | "subtasks" | "createdAt" | "order">) => void;
  editDream?: Dream | null;
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [motivation, setMotivation] = useState("");
  const [targetYear, setTargetYear] = useState(new Date().getFullYear() + 1);
  const [category, setCategory] = useState<DreamCategory>("personal");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");

  const isEditing = !!editDream;

  // Populate form when editing
  useEffect(() => {
    if (editDream) {
      setTitle(editDream.title);
      setDescription(editDream.description);
      setMotivation(editDream.motivation);
      setTargetYear(editDream.targetYear);
      setCategory(editDream.category);
      setTags(editDream.tags);
      setImageUrl(editDream.imageUrl);
    } else {
      setTitle(""); setDescription(""); setMotivation(""); setTags([]); setTagInput(""); setImageUrl("");
      setTargetYear(new Date().getFullYear() + 1); setCategory("personal");
    }
  }, [editDream, open]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({ boardId: editDream?.boardId || boardId, title, description, motivation, targetYear, category, tags, imageUrl });
    onClose();
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg surface-scrapbook max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-golden" /> {isEditing ? "Edit Dream" : "Add a New Dream"}
          </DialogTitle>
          <DialogDescription>{isEditing ? "Update your dream details." : "What do you dare to dream? Pin it to your board."}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Dream Image</label>
            <ImageUploadZone imageUrl={imageUrl} onImageChange={setImageUrl} label="Add an image that represents your dream" height="h-36" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Dream Title</label>
            <Input placeholder="e.g., Travel to Japan" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 rounded-xl" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Description</label>
            <Textarea placeholder="Describe your dream in detail..." value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 rounded-xl min-h-[70px]" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">What motivates you?</label>
            <Input placeholder="Your personal motivation..." value={motivation} onChange={(e) => setMotivation(e.target.value)} className="mt-1 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground">Target Year</label>
              <Input type="number" min={new Date().getFullYear()} max={2100} value={targetYear} onChange={(e) => setTargetYear(Number(e.target.value))} className="mt-1 rounded-xl" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as DreamCategory)} className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
                {categories.filter((c) => c !== "all").map((c) => (
                  <option key={c} value={c}>{categoryEmojis[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Tags</label>
            <div className="flex gap-2 mt-1">
              <Input placeholder="Add a tag..." value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} className="rounded-xl" />
              <Button variant="outline" size="sm" onClick={addTag} className="rounded-xl">Add</Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="rounded-full text-xs cursor-pointer" onClick={() => setTags(tags.filter((t) => t !== tag))}>
                    #{tag} <X className="h-2 w-2 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-xl">Cancel</Button>
          <Button onClick={handleSubmit} disabled={!title.trim()} className="bg-primary hover:bg-primary/90 rounded-xl">
            <Sparkles className="mr-2 h-4 w-4" /> {isEditing ? "Save Changes" : "Pin Dream"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ===== BOARD MANAGEMENT DIALOGS =====
const CreateBoardDialog = ({ open, onClose, onAdd }: {
  open: boolean; onClose: () => void;
  onAdd: (name: string, emoji: string) => void;
}) => {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🌟");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm surface-scrapbook">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <FolderPlus className="h-5 w-5 text-teal" /> New Vision Board
          </DialogTitle>
          <DialogDescription>Create a new board to organize your dreams.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Board Name</label>
            <Input placeholder="e.g., 2026 Dreams, Travel Goals..." value={name} onChange={(e) => setName(e.target.value)} className="mt-1 rounded-xl" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Choose Icon</label>
            <div className="flex flex-wrap gap-2">
              {boardEmojiOptions.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all ${e === emoji ? "bg-primary/15 ring-2 ring-primary scale-110" : "bg-muted hover:bg-muted/80"}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-xl">Cancel</Button>
          <Button onClick={() => { if (name.trim()) { onAdd(name, emoji); setName(""); setEmoji("🌟"); onClose(); } }} disabled={!name.trim()} className="bg-primary hover:bg-primary/90 rounded-xl">
            <Plus className="mr-2 h-4 w-4" /> Create Board
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const RenameBoardDialog = ({ open, onClose, board, onRename }: {
  open: boolean; onClose: () => void; board: Board | null;
  onRename: (id: string, name: string, emoji: string) => void;
}) => {
  const [name, setName] = useState(board?.name || "");
  const [emoji, setEmoji] = useState(board?.emoji || "🌟");

  const prevId = useRef(board?.id);
  if (board && board.id !== prevId.current) {
    prevId.current = board.id;
    setName(board.name);
    setEmoji(board.emoji);
  }

  if (!board) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm surface-scrapbook">
        <DialogHeader>
          <DialogTitle className="font-display text-lg flex items-center gap-2"><Pencil className="h-4 w-4 text-teal" /> Edit Board</DialogTitle>
          <DialogDescription>Update your board's name and icon.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" />
          <div className="flex flex-wrap gap-2">
            {boardEmojiOptions.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all ${e === emoji ? "bg-primary/15 ring-2 ring-primary scale-110" : "bg-muted hover:bg-muted/80"}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-xl">Cancel</Button>
          <Button onClick={() => { if (name.trim()) { onRename(board.id, name, emoji); onClose(); } }} className="bg-primary hover:bg-primary/90 rounded-xl">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ===== SECTION HEADER =====
const SectionHeader = ({ icon: Icon, title, subtitle, count, expanded, onToggle }: {
  icon: React.ElementType; title: string; subtitle: string; count: number; expanded: boolean; onToggle: () => void;
}) => (
  <motion.button onClick={onToggle} className="w-full flex items-center justify-between py-3 group" whileTap={{ scale: 0.99 }}>
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl gradient-teal flex items-center justify-center">
        <Icon className="h-4 w-4 text-teal" />
      </div>
      <div className="text-left">
        <h2 className="font-display text-lg font-semibold text-foreground">
          {title} <span className="ml-2 text-sm font-sans font-normal text-muted-foreground">({count})</span>
        </h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
    <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
      <ChevronDown className="h-5 w-5 text-muted-foreground" />
    </motion.div>
  </motion.button>
);

// ===== BOARD TAB =====
const BoardTab = ({ board, isActive, onClick, onEdit, onDelete, dreamCount }: {
  board: Board; isActive: boolean; onClick: () => void;
  onEdit: () => void; onDelete: () => void; dreamCount: number;
}) => (
  <motion.div
    layout
    className={`
      relative flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-all group shrink-0
      ${isActive
        ? "surface-scrapbook shadow-depth ring-1 ring-primary/20"
        : "hover:bg-muted/60"
      }
    `}
    onClick={onClick}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <span className="text-lg">{board.emoji}</span>
    <span className={`text-sm font-medium whitespace-nowrap ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
      {board.name}
    </span>
    <Badge variant="secondary" className="rounded-full text-[10px] px-1.5 py-0 min-w-[18px] text-center">
      {dreamCount}
    </Badge>

    {isActive && (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="ml-1 p-1 rounded-md hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[140px]">
          <DropdownMenuItem onClick={onEdit}><Pencil className="h-3.5 w-3.5 mr-2" /> Rename</DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive"><Trash2 className="h-3.5 w-3.5 mr-2" /> Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )}

    {isActive && (
      <motion.div layoutId="board-indicator" className="absolute -bottom-0.5 left-4 right-4 h-0.5 bg-primary rounded-full" />
    )}
  </motion.div>
);

// ===== MAIN PAGE =====
const VisionBoard = () => {
  const [boards, setBoards] = useState<Board[]>(() => loadFromStorage(BOARDS_KEY, []));
  const [dreams, setDreams] = useState<Dream[]>(() => loadFromStorage(DREAMS_KEY, []));
  const [activeBoardId, setActiveBoardId] = useState<string | null>(() => {
    const stored = loadFromStorage<Board[]>(BOARDS_KEY, []);
    return stored.length > 0 ? stored[0].id : null;
  });
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [dreamFormOpen, setDreamFormOpen] = useState(false);
  const [editingDream, setEditingDream] = useState<Dream | null>(null);
  const [createBoardOpen, setCreateBoardOpen] = useState(false);
  const [renameBoardOpen, setRenameBoardOpen] = useState(false);
  const [editBoard, setEditBoard] = useState<Board | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dreamsExpanded, setDreamsExpanded] = useState(true);
  const [achievedExpanded, setAchievedExpanded] = useState(true);
  const [boardSearchQuery, setBoardSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Persist to localStorage
  useEffect(() => { localStorage.setItem(BOARDS_KEY, JSON.stringify(boards)); }, [boards]);
  useEffect(() => { localStorage.setItem(DREAMS_KEY, JSON.stringify(dreams)); }, [dreams]);

  const activeBoard = boards.find((b) => b.id === activeBoardId) || null;

  const filteredBoards = useMemo(() => {
    if (!boardSearchQuery) return boards;
    return boards.filter((b) => b.name.toLowerCase().includes(boardSearchQuery.toLowerCase()));
  }, [boards, boardSearchQuery]);

  const boardDreams = useMemo(() => {
    if (!activeBoardId) return [];
    return dreams.filter((d) => d.boardId === activeBoardId);
  }, [dreams, activeBoardId]);

  const filteredDreams = useMemo(() => {
    return boardDreams.filter((d) => {
      const matchCategory = activeCategory === "all" || d.category === activeCategory;
      const matchSearch = !searchQuery ||
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [boardDreams, activeCategory, searchQuery]);

  const activeDreams = filteredDreams.filter((d) => !d.achieved);
  const achievedDreams = filteredDreams.filter((d) => d.achieved);

  const getDreamCountForBoard = useCallback((boardId: string) => dreams.filter((d) => d.boardId === boardId).length, [dreams]);

  // === Board handlers ===
  const handleCreateBoard = (name: string, emoji: string) => {
    const newBoard: Board = {
      id: crypto.randomUUID(),
      name,
      emoji,
      order: boards.length,
      createdAt: new Date().toISOString(),
    };
    setBoards((prev) => [...prev, newBoard]);
    setActiveBoardId(newBoard.id);
  };

  const handleRenameBoard = (id: string, name: string, emoji: string) => {
    setBoards((prev) => prev.map((b) => (b.id === id ? { ...b, name, emoji } : b)));
  };

  const handleDeleteBoard = (id: string) => {
    setBoards((prev) => prev.filter((b) => b.id !== id));
    setDreams((prev) => prev.filter((d) => d.boardId !== id));
    if (activeBoardId === id) {
      const remaining = boards.filter((b) => b.id !== id);
      setActiveBoardId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // === Dream handlers ===
  const handleAddOrUpdateDream = (data: Omit<Dream, "id" | "convertedToGoal" | "achieved" | "subtasks" | "createdAt" | "order">) => {
    if (editingDream) {
      // Update existing dream
      setDreams((prev) =>
        prev.map((d) =>
          d.id === editingDream.id
            ? { ...d, ...data }
            : d
        )
      );
      setEditingDream(null);
    } else {
      // Add new dream
      const newDream: Dream = {
        ...data,
        id: crypto.randomUUID(),
        convertedToGoal: false,
        achieved: false,
        subtasks: [],
        createdAt: new Date().toISOString(),
        order: boardDreams.length,
      };
      setDreams((prev) => [newDream, ...prev]);
    }
  };

  const handleDeleteDream = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDeleteDream = () => {
    if (deleteConfirm) {
      setDreams((prev) => prev.filter((d) => d.id !== deleteConfirm));
      setDeleteConfirm(null);
      setDetailOpen(false);
    }
  };

  const handleEditDream = (dream: Dream) => {
    setEditingDream(dream);
    setDreamFormOpen(true);
  };

  const handleConvertToGoal = (id: string) => {
    setDreams((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              convertedToGoal: true,
              subtasks: [
                { id: crypto.randomUUID(), title: "Research & plan", done: false },
                { id: crypto.randomUUID(), title: "Take first step", done: false },
                { id: crypto.randomUUID(), title: "Stay consistent", done: false },
              ],
            }
          : d
      )
    );
    // Also persist to goals store
    const dream = dreams.find((d) => d.id === id);
    if (dream) {
      const goals = loadFromStorage<any[]>("lifeos-goals", []);
      goals.push({
        id: crypto.randomUUID(),
        title: dream.title,
        description: dream.description,
        deadline: `${dream.targetYear}-12-31`,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem("lifeos-goals", JSON.stringify(goals));
    }
    setDetailOpen(false);
  };

  const handleMarkAchieved = (id: string, photoUrl?: string, note?: string) => {
    setDreams((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, achieved: true, achievedPhotoUrl: photoUrl || d.achievedPhotoUrl, achievedNote: note || "Dreams do come true ✦" } : d
      )
    );
  };

  const handleUpdateDreamImage = (id: string, imageUrl: string) => {
    setDreams((prev) => prev.map((d) => (d.id === id ? { ...d, imageUrl } : d)));
    setSelectedDream((prev) => (prev && prev.id === id ? { ...prev, imageUrl } : prev));
  };

  const handleToggleSubtask = (dreamId: string, subtaskId: string) => {
    const updater = (list: Dream[]) =>
      list.map((d) =>
        d.id === dreamId ? { ...d, subtasks: d.subtasks.map((s) => (s.id === subtaskId ? { ...s, done: !s.done } : s)) } : d
      );
    setDreams(updater);
    setSelectedDream((prev) => {
      if (!prev || prev.id !== dreamId) return prev;
      return { ...prev, subtasks: prev.subtasks.map((s) => (s.id === subtaskId ? { ...s, done: !s.done } : s)) };
    });
  };

  const openDreamDetail = (dream: Dream) => {
    setSelectedDream(dream);
    setDetailOpen(true);
  };

  const openAddDream = () => {
    setEditingDream(null);
    setDreamFormOpen(true);
  };

  const hasBoards = boards.length > 0;
  const hasDreamsInBoard = boardDreams.length > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 relative">
      <FloatingParticles />

      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Vision Board</h1>
          <p className="text-muted-foreground mt-1 font-handwritten text-lg">Dare to dream, then make it real ✦</p>
        </div>
        <div className="flex items-center gap-2">
          {hasBoards && (
            <Button onClick={openAddDream} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-5 shadow-glow-teal" disabled={!activeBoardId}>
              <Plus className="mr-2 h-4 w-4" /> New Dream
            </Button>
          )}
          <Button onClick={() => setCreateBoardOpen(true)} variant={hasBoards ? "outline" : "default"} className="rounded-xl">
            <FolderPlus className="mr-2 h-4 w-4" /> New Board
          </Button>
        </div>
      </motion.div>

      {/* No boards → empty state */}
      {!hasBoards && <EmptyBoardState onAdd={() => setCreateBoardOpen(true)} />}

      {/* Board tabs */}
      {hasBoards && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3">
          {boards.length >= 4 && (
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search boards..."
                value={boardSearchQuery}
                onChange={(e) => setBoardSearchQuery(e.target.value)}
                className="pl-9 rounded-xl h-9 text-sm"
              />
            </div>
          )}

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <AnimatePresence mode="popLayout">
              {filteredBoards.map((board) => (
                <BoardTab
                  key={board.id}
                  board={board}
                  isActive={board.id === activeBoardId}
                  onClick={() => { setActiveBoardId(board.id); setActiveCategory("all"); setSearchQuery(""); }}
                  onEdit={() => { setEditBoard(board); setRenameBoardOpen(true); }}
                  onDelete={() => handleDeleteBoard(board.id)}
                  dreamCount={getDreamCountForBoard(board.id)}
                />
              ))}
            </AnimatePresence>
            <button
              onClick={() => setCreateBoardOpen(true)}
              className="shrink-0 w-9 h-9 rounded-xl border-2 border-dashed border-border hover:border-primary/40 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Active board content */}
      {hasBoards && activeBoardId && (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeBoardId}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="space-y-5"
          >
            {/* Board header with stats */}
            {activeBoard && (
              <div className="surface-scrapbook rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{activeBoard.emoji}</span>
                    <div>
                      <h2 className="font-display text-xl font-bold text-foreground">{activeBoard.name}</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {boardDreams.length} dream{boardDreams.length !== 1 ? "s" : ""} · {boardDreams.filter((d) => d.achieved).length} achieved
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {boardDreams.length > 0 && (
                      <div className="text-right hidden sm:block">
                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <p className="text-lg font-bold text-teal">{boardDreams.filter((d) => d.convertedToGoal).length}</p>
                            <p className="text-[10px] text-muted-foreground">Goals</p>
                          </div>
                          <div className="w-px h-8 bg-border" />
                          <div className="text-center">
                            <p className="text-lg font-bold text-golden">{boardDreams.filter((d) => d.achieved).length}</p>
                            <p className="text-[10px] text-muted-foreground">Achieved</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Dream search + category filter */}
            {hasDreamsInBoard && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search dreams or tags..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 rounded-xl" />
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {categories.map((c) => (
                    <Badge
                      key={c}
                      variant={c === activeCategory ? "default" : "secondary"}
                      className="cursor-pointer capitalize px-3 py-1 rounded-full transition-all hover:scale-105"
                      onClick={() => setActiveCategory(c)}
                    >
                      {c !== "all" && categoryEmojis[c]} {c}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Empty dream state for this board */}
            {!hasDreamsInBoard && <EmptyDreamState onAdd={openAddDream} />}

            {/* Current dreams */}
            {hasDreamsInBoard && (
              <div>
                <SectionHeader
                  icon={Sparkles}
                  title="Current Dreams"
                  subtitle="Dreams waiting to become reality"
                  count={activeDreams.length}
                  expanded={dreamsExpanded}
                  onToggle={() => setDreamsExpanded(!dreamsExpanded)}
                />
                <AnimatePresence>
                  {dreamsExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                      {activeDreams.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-8 text-center font-handwritten text-base">
                          {searchQuery || activeCategory !== "all" ? "No dreams match your filters ✦" : "No active dreams — add one above ✦"}
                        </p>
                      ) : (
                        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 pt-2">
                          <AnimatePresence>
                            {activeDreams.map((dream, i) => (
                              <DreamCard key={dream.id} dream={dream} index={i} onExpand={openDreamDetail} onEdit={handleEditDream} onDelete={handleDeleteDream} />
                            ))}
                          </AnimatePresence>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Achieved dreams */}
            {achievedDreams.length > 0 && (
              <div>
                <SectionHeader
                  icon={Trophy}
                  title="Achieved Dreams"
                  subtitle="Dreams that became your reality"
                  count={achievedDreams.length}
                  expanded={achievedExpanded}
                  onToggle={() => setAchievedExpanded(!achievedExpanded)}
                />
                <AnimatePresence>
                  {achievedExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 pt-2">
                        <AnimatePresence>
                          {achievedDreams.map((dream, i) => (
                            <DreamCard key={dream.id} dream={dream} index={i} onExpand={openDreamDetail} onEdit={handleEditDream} onDelete={handleDeleteDream} />
                          ))}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Dialogs */}
      <CreateBoardDialog open={createBoardOpen} onClose={() => setCreateBoardOpen(false)} onAdd={handleCreateBoard} />
      <RenameBoardDialog open={renameBoardOpen} onClose={() => setRenameBoardOpen(false)} board={editBoard} onRename={handleRenameBoard} />
      {activeBoardId && (
        <DreamFormDialog
          open={dreamFormOpen}
          onClose={() => { setDreamFormOpen(false); setEditingDream(null); }}
          onSubmit={handleAddOrUpdateDream}
          boardId={activeBoardId}
          editDream={editingDream}
        />
      )}
      <DreamDetailDialog
        dream={selectedDream}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onConvertToGoal={handleConvertToGoal}
        onMarkAchieved={handleMarkAchieved}
        onToggleSubtask={handleToggleSubtask}
        onUpdateImage={handleUpdateDreamImage}
        onEdit={handleEditDream}
        onDelete={handleDeleteDream}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="surface-scrapbook">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Delete this dream?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. Your dream will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteDream} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VisionBoard;
