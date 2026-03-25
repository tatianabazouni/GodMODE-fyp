/**
 * MemoryDetailPanel — Rich slide-in overlay for memory details.
 * Includes emotion visualization, delete action, and smooth animations.
 */
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  X, Heart, Calendar, Tag, Trash2, Sun, Moon, Leaf, Sparkles,
  FileText, Image, Mic, Video,
} from "lucide-react";
import type { MemoryItem } from "./MemoryVaultScene";

const emotionConfig: Record<string, { icon: typeof Sun; color: string; label: string }> = {
  joy: { icon: Sun, label: "Joy", color: "bg-highlight/20 text-highlight" },
  calm: { icon: Moon, label: "Calm", color: "bg-calm/20 text-calm" },
  love: { icon: Heart, label: "Love", color: "bg-accent/20 text-accent" },
  nostalgia: { icon: Sparkles, label: "Nostalgia", color: "bg-primary/20 text-primary" },
  growth: { icon: Leaf, label: "Growth", color: "bg-growth/20 text-growth" },
};

const typeIcons: Record<string, typeof FileText> = {
  text: FileText, image: Image, voice: Mic, video: Video,
};

interface Props {
  memory: MemoryItem | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export function MemoryDetailPanel({ memory, onClose, onDelete }: Props) {
  return (
    <AnimatePresence>
      {memory && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 bg-background border-l border-border/30 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/20">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {(() => {
                  const TypeIcon = typeIcons[memory.type] || FileText;
                  return <TypeIcon className="h-4 w-4" />;
                })()}
                <span className="capitalize">{memory.type}</span>
              </div>
              <div className="flex items-center gap-1">
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => { onDelete(memory.id); onClose(); }}
                    className="text-muted-foreground hover:text-destructive h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Image */}
              {memory.imageUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 }}
                  className="aspect-video overflow-hidden"
                >
                  <img
                    src={memory.imageUrl}
                    alt={memory.title}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              )}

              <div className="p-6 space-y-5">
                {/* Emotion badge */}
                {(() => {
                  const cfg = emotionConfig[memory.emotion];
                  if (!cfg) return null;
                  const EmIcon = cfg.icon;
                  return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                      <Badge className={`rounded-full text-xs ${cfg.color} border-0`}>
                        <EmIcon className="h-3 w-3 mr-1" />
                        {cfg.label}
                      </Badge>
                    </motion.div>
                  );
                })()}

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="font-display text-2xl font-bold text-foreground leading-tight"
                >
                  {memory.title}
                </motion.h2>

                {/* Date */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(memory.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </motion.div>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-foreground/80 leading-relaxed whitespace-pre-wrap text-sm"
                >
                  {memory.description}
                </motion.p>

                {/* Tags */}
                {memory.tags.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-wrap gap-1.5"
                  >
                    {memory.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-[10px] rounded-full border-border/40"
                      >
                        <Tag className="h-2.5 w-2.5 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </motion.div>
                )}

                {/* Chapter label */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="text-xs text-muted-foreground/50 italic text-center pt-4 border-t border-border/20"
                >
                  Chapter: {memory.chapter}
                </motion.p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
