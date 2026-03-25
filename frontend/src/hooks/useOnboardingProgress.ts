import { useState, useCallback, useEffect } from "react";

export interface OnboardingMemory {
  id: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  createdAt: string;
}

export interface OnboardingJournalEntry {
  id: string;
  title: string;
  content: string;
  mood: string;
  createdAt: string;
}

export interface OnboardingDream {
  id: string;
  title: string;
  description: string;
  category: string;
  createdAt: string;
}

export interface OnboardingGoal {
  id: string;
  title: string;
  description: string;
  deadline: string;
  createdAt: string;
}

export interface OnboardingData {
  completedSteps: string[];
  currentStep: number;
  memory: OnboardingMemory | null;
  journalEntry: OnboardingJournalEntry | null;
  dream: OnboardingDream | null;
  goal: OnboardingGoal | null;
  completedAt: string | null;
}

const STORAGE_KEY = "lifeos-onboarding";

const defaultData: OnboardingData = {
  completedSteps: [],
  currentStep: 1,
  memory: null,
  journalEntry: null,
  dream: null,
  goal: null,
  completedAt: null,
};

export function useOnboardingProgress() {
  const [data, setData] = useState<OnboardingData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...defaultData, ...JSON.parse(stored) } : defaultData;
    } catch {
      return defaultData;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  const completeStep = useCallback((stepId: string) => {
    setData((prev) => ({
      ...prev,
      completedSteps: prev.completedSteps.includes(stepId)
        ? prev.completedSteps
        : [...prev.completedSteps, stepId],
    }));
  }, []);

  const saveMemory = useCallback((memory: OnboardingMemory) => {
    setData((prev) => ({ ...prev, memory, completedSteps: [...new Set([...prev.completedSteps, "memory"])] }));
    // Also persist to main memories store
    const existing = JSON.parse(localStorage.getItem("lifeos-memories") || "[]");
    existing.push(memory);
    localStorage.setItem("lifeos-memories", JSON.stringify(existing));
  }, []);

  const saveJournalEntry = useCallback((entry: OnboardingJournalEntry) => {
    setData((prev) => ({ ...prev, journalEntry: entry, completedSteps: [...new Set([...prev.completedSteps, "journal"])] }));
    const existing = JSON.parse(localStorage.getItem("lifeos-journal") || "[]");
    existing.push(entry);
    localStorage.setItem("lifeos-journal", JSON.stringify(existing));
  }, []);

  const saveDream = useCallback((dream: OnboardingDream) => {
    setData((prev) => ({ ...prev, dream, completedSteps: [...new Set([...prev.completedSteps, "dream"])] }));
    const existing = JSON.parse(localStorage.getItem("lifeos-dreams") || "[]");
    existing.push(dream);
    localStorage.setItem("lifeos-dreams", JSON.stringify(existing));
  }, []);

  const saveGoal = useCallback((goal: OnboardingGoal) => {
    setData((prev) => ({ ...prev, goal, completedSteps: [...new Set([...prev.completedSteps, "goal"])] }));
    const existing = JSON.parse(localStorage.getItem("lifeos-goals") || "[]");
    existing.push(goal);
    localStorage.setItem("lifeos-goals", JSON.stringify(existing));
  }, []);

  const finishOnboarding = useCallback(() => {
    setData((prev) => ({ ...prev, completedAt: new Date().toISOString() }));
  }, []);

  const isCompleted = data.completedAt !== null;

  return {
    data,
    updateData,
    completeStep,
    saveMemory,
    saveJournalEntry,
    saveDream,
    saveGoal,
    finishOnboarding,
    isCompleted,
  };
}
