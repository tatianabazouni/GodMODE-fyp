/**
 * useMemories — localStorage-backed hook for managing memories.
 * No mock data. All memories come from real user input.
 */
import { useState, useCallback, useEffect } from "react";
import type { MemoryItem } from "@/components/life-capsule/MemoryVaultScene";

const STORAGE_KEY = "lifeos-memories";

function loadMemories(): MemoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMemories(memories: MemoryItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
}

export function useMemories() {
  const [memories, setMemories] = useState<MemoryItem[]>(loadMemories);

  useEffect(() => {
    saveMemories(memories);
  }, [memories]);

  const addMemory = useCallback((memory: MemoryItem) => {
    setMemories((prev) => [memory, ...prev]);
  }, []);

  const deleteMemory = useCallback((id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const updateMemory = useCallback((id: string, updates: Partial<MemoryItem>) => {
    setMemories((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  }, []);

  return { memories, addMemory, deleteMemory, updateMemory };
}
