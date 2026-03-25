import { useState, useCallback, useEffect } from "react";
import type { MemoryItem } from "@/components/life-capsule/MemoryVaultScene";
import { api } from "@/lib/api";

const mapMemory = (memory: any): MemoryItem => ({
  id: memory.id || memory._id,
  title: memory.title || "Untitled",
  description: memory.description || "",
  date: memory.date ? String(memory.date).slice(0, 10) : new Date().toISOString().slice(0, 10),
  chapter: memory.chapterId || memory.chapter || "reflections",
  tags: Array.isArray(memory.tags) ? memory.tags : [],
  imageUrl: memory.imageUrl || memory.mediaUrl,
  type: memory.type || "text",
  emotion: memory.emotion || "nostalgia",
});

export function useMemories() {
  const [memories, setMemories] = useState<MemoryItem[]>([]);

  const refresh = useCallback(async () => {
    const data = await api.get<any[]>("/life/memories");
    setMemories(data.map(mapMemory));
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addMemory = useCallback(async (memory: MemoryItem) => {
    const created = await api.post<any>("/life/memories", {
      title: memory.title,
      description: memory.description,
      date: memory.date,
      chapterId: memory.chapter,
      tags: memory.tags,
      type: memory.type,
      emotion: memory.emotion,
      imageUrl: memory.imageUrl,
      mediaUrl: memory.imageUrl,
    });
    setMemories((prev) => [mapMemory(created), ...prev]);
  }, []);

  const deleteMemory = useCallback(async (id: string) => {
    await api.delete(`/life/memories/${id}`);
    setMemories((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const updateMemory = useCallback(async (id: string, updates: Partial<MemoryItem>) => {
    const updated = await api.put<any>(`/life/memories/${id}`, updates);
    setMemories((prev) => prev.map((m) => (m.id === id ? mapMemory(updated) : m)));
  }, []);

  return { memories, addMemory, deleteMemory, updateMemory, refresh };
}
