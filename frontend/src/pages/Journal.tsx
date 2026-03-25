/**
 * Journal — Life Story System
 * A structured psychological experience for building your life story.
 */
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Feather,
  LayoutGrid,
  List,
  Plus,
  Sparkles,
} from "lucide-react";
import Journal3DBook from "@/components/journal/Journal3DBook";
import ScrapbookView from "@/components/journal/ScrapbookView";
import JournalListView from "@/components/journal/JournalListView";
import JournalEntryEditor from "@/components/journal/JournalEntryEditor";
import JournalCalendarHeatmap from "@/components/journal/JournalCalendarHeatmap";
import VoiceNotePlayer from "@/components/journal/VoiceNotePlayer";
import LifeStoryHome from "@/components/journal/LifeStoryHome";
import LifeStorySectionView from "@/components/journal/LifeStorySectionView";
import LifeStoryWriter from "@/components/journal/LifeStoryWriter";
import LifeStoryEntryList from "@/components/journal/LifeStoryEntryList";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { journalApi } from "@/api/journalApi";
import {
  loadLifeStoryEntries,
  saveLifeStoryEntries,
  SECTIONS,
  SECTION_PROMPTS,
  type LifeStoryEntry,
  type LifeStorySection,
  type LifeStoryPrompt,
  type EntryType,
} from "@/components/journal/lifeStoryTypes";

/* ── Legacy journal entry (kept for scrapbook/list views) ── */
interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  photos: string[];
  hasVoiceNote: boolean;
  stickers: string[];
}

type View =
  | "lifestory"
  | "section"
  | "writer"
  | "entries"
  | "scrapbook"
  | "book"
  | "list";

const Journal = () => {
  /* ── Legacy entries ── */
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [expandedEntry, setExpandedEntry] = useState<JournalEntry | null>(null);

  /* ── Life Story state ── */
  const [lifeEntries, setLifeEntries] = useState<LifeStoryEntry[]>(loadLifeStoryEntries);
  const [view, setView] = useState<View>("lifestory");
  const [activeSection, setActiveSection] = useState<LifeStorySection | null>(null);
  const [activePrompt, setActivePrompt] = useState<LifeStoryPrompt | null>(null);
  const [activeEntryType, setActiveEntryType] = useState<EntryType>("lifebook");
  const [editingEntry, setEditingEntry] = useState<LifeStoryEntry | null>(null);

  useEffect(() => {
    const loadEntries = async () => {
      const data = await journalApi.getAll() as any[];
      setEntries((data || []).map((entry) => ({
        id: String(entry._id || entry.id),
        date: String(entry.date || entry.createdAt || new Date().toISOString()).slice(0, 10),
        title: entry.title || "Untitled",
        content: entry.content || "",
        mood: entry.mood || "neutral",
        tags: entry.tags || [],
        photos: [],
        hasVoiceNote: false,
        stickers: [],
      })));
    };
    void loadEntries();
  }, []);
  useEffect(() => {
    saveLifeStoryEntries(lifeEntries);
  }, [lifeEntries]);

  const handleSaveEntry = useCallback(async (entry: JournalEntry) => {
    const existing = entries.find((e) => e.id === entry.id);
    if (existing) {
      const updated = await journalApi.update(entry.id, {
        title: entry.title,
        content: entry.content,
        mood: entry.mood,
        tags: entry.tags,
        date: entry.date,
      }) as any;
      setEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...entry, id: String(updated._id || updated.id) } : e)));
      return;
    }

    const created = await journalApi.create({
      title: entry.title,
      content: entry.content,
      mood: entry.mood,
      tags: entry.tags,
      date: entry.date,
    }) as any;

    const createdEntry: JournalEntry = {
      ...entry,
      id: String(created._id || created.id),
      date: String(created.date || created.createdAt || entry.date).slice(0, 10),
    };

    setEntries((prev) => [createdEntry, ...prev.filter((e) => e.id !== entry.id)]);
  }, [entries]);

  const handleSaveLifeEntry = useCallback((entry: LifeStoryEntry) => {
    setLifeEntries((prev) => {
      const exists = prev.find((e) => e.id === entry.id);
      if (exists) return prev.map((e) => (e.id === entry.id ? entry : e));
      return [entry, ...prev];
    });
  }, []);

  const handleDeleteLifeEntry = useCallback((id: string) => {
    setLifeEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  /* ── Navigation helpers ── */
  const openSection = (section: LifeStorySection) => {
    setActiveSection(section);
    setView("section");
  };

  const startEntry = (type: EntryType, section?: LifeStorySection) => {
    setActiveEntryType(type);
    setActiveSection(section || null);
    setActivePrompt(null);
    setEditingEntry(null);
    setView("writer");
  };

  const startPrompt = (prompt: LifeStoryPrompt) => {
    setActivePrompt(prompt);
    setActiveEntryType("lifebook");
    const existing = lifeEntries.find((e) => e.promptId === prompt.id);
    setEditingEntry(existing || null);
    setView("writer");
  };

  const editEntry = (entry: LifeStoryEntry) => {
    setEditingEntry(entry);
    setActiveEntryType(entry.type);
    setActiveSection(entry.section || null);
    if (entry.promptId && entry.section) {
      const prompt = SECTION_PROMPTS[entry.section]?.find((p) => p.id === entry.promptId);
      setActivePrompt(prompt || null);
    } else {
      setActivePrompt(null);
    }
    setView("writer");
  };

  const viewModes = [
    { key: "lifestory" as const, icon: Feather, label: "Life Story" },
    { key: "scrapbook" as const, icon: LayoutGrid, label: "Scrapbook" },
    { key: "book" as const, icon: BookOpen, label: "3D Book" },
    { key: "list" as const, icon: List, label: "List" },
  ];

  const isLegacyView = view === "scrapbook" || view === "list" || view === "book";
  const isLifeStoryDeep = view === "section" || view === "writer" || view === "entries";

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header — hide when in writer */}
      {view !== "writer" && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between flex-wrap gap-3"
        >
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              {view === "lifestory" || isLifeStoryDeep ? "Life Story" : "Journal"}
            </h1>
            <p className="text-muted-foreground mt-1 font-handwritten text-xl">
              {view === "lifestory" || isLifeStoryDeep
                ? "Write your life consciously"
                : "Your digital scrapbook of life"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View switcher — only on top-level views */}
            {!isLifeStoryDeep && (
              <div className="flex items-center bg-muted/40 rounded-xl p-1 border border-border/30">
                {viewModes.map((vm) => {
                  const Icon = vm.icon;
                  return (
                    <button
                      key={vm.key}
                      onClick={() => setView(vm.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                        view === vm.key
                          ? "bg-background shadow-sm font-medium"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{vm.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
            {isLegacyView && (
              <Button
                onClick={() => setShowEditor(true)}
                className="gradient-primary text-primary-foreground shadow-depth rounded-xl"
              >
                <Plus className="mr-2 h-4 w-4" /> New Entry
              </Button>
            )}
            {view === "lifestory" && (
              <Button
                onClick={() => setView("entries")}
                variant="outline"
                className="rounded-xl"
              >
                All Entries
              </Button>
            )}
          </div>
        </motion.div>
      )}

      {/* Main content */}
      <AnimatePresence mode="wait">
        {view === "lifestory" && (
          <motion.div key="lifestory" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LifeStoryHome
              entries={lifeEntries}
              onOpenSection={openSection}
              onStartEntry={startEntry}
            />
          </motion.div>
        )}

        {view === "section" && activeSection && (
          <motion.div key="section" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LifeStorySectionView
              section={activeSection}
              entries={lifeEntries}
              onBack={() => setView("lifestory")}
              onStartPrompt={startPrompt}
            />
          </motion.div>
        )}

        {view === "writer" && (
          <motion.div key="writer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LifeStoryWriter
              entryType={activeEntryType}
              prompt={activePrompt || undefined}
              section={activeSection || undefined}
              existingEntry={editingEntry || undefined}
              onSave={handleSaveLifeEntry}
              onBack={() => {
                if (activeSection && !editingEntry) setView("section");
                else setView("lifestory");
              }}
            />
          </motion.div>
        )}

        {view === "entries" && (
          <motion.div key="entries" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LifeStoryEntryList
              entries={lifeEntries}
              onBack={() => setView("lifestory")}
              onEdit={editEntry}
              onDelete={handleDeleteLifeEntry}
            />
          </motion.div>
        )}

        {view === "book" && (
          <motion.div key="book" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Journal3DBook
              entries={entries}
              reflections={[]}
              onWriteEntry={() => setShowEditor(true)}
            />
          </motion.div>
        )}

        {(view === "scrapbook" || view === "list") && (
          <motion.div
            key={view}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6"
          >
            <div>
              {view === "scrapbook" ? (
                <ScrapbookView
                  entries={entries}
                  onOpenEntry={setExpandedEntry}
                  onNewEntry={() => setShowEditor(true)}
                />
              ) : (
                <JournalListView
                  entries={entries}
                  onOpenEntry={setExpandedEntry}
                  onNewEntry={() => setShowEditor(true)}
                />
              )}
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-5"
            >
              <JournalCalendarHeatmap entries={entries} />
              <div className="surface-card p-4 gradient-warm">
                <h3 className="font-display font-semibold mb-3 text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber" /> Reflection Prompts
                </h3>
                <div className="space-y-2">
                  {["What made you grateful today?", "What did you learn today?", "What moment made you smile?"].map((p, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ x: 4, rotate: 0 }}
                      onClick={() => setShowEditor(true)}
                      className="w-full text-left p-3 rounded-xl text-sm cursor-pointer transition-all font-handwritten text-base shadow-sm"
                      style={{
                        background: "hsl(48 80% 90%)",
                        color: "hsl(35 30% 25%)",
                        transform: `rotate(${(i % 3) - 1}deg)`,
                      }}
                    >
                      {p}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legacy Editor */}
      <JournalEntryEditor
        open={showEditor}
        onClose={() => setShowEditor(false)}
        onSave={handleSaveEntry}
      />

      {/* Expanded entry dialog */}
      <Dialog open={!!expandedEntry} onOpenChange={() => setExpandedEntry(null)}>
        <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl border-border/40">
          {expandedEntry && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {new Date(expandedEntry.date).toLocaleDateString("en-US", {
                      weekday: "long", month: "long", day: "numeric", year: "numeric",
                    })}
                  </p>
                  <span className="text-sm capitalize text-muted-foreground">{expandedEntry.mood}</span>
                </div>
                <h2 className="font-display text-2xl font-bold">{expandedEntry.title}</h2>
                <p className="font-handwritten text-lg text-foreground/80 leading-relaxed whitespace-pre-wrap">
                  {expandedEntry.content}
                </p>
                {expandedEntry.hasVoiceNote && <VoiceNotePlayer />}
                {expandedEntry.tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {expandedEntry.tags.map((t) => (
                      <Badge key={t} variant="secondary" className="rounded-full">{t}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Journal;
