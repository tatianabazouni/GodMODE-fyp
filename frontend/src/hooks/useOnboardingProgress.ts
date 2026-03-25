import { useState, useCallback, useEffect } from "react";
import { lifeApi } from "@/api/lifeApi";
import { journalApi } from "@/api/journalApi";
import { goalsApi } from "@/api/goalsApi";
import { visionApi } from "@/api/visionApi";

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

  const saveMemory = useCallback(async (memory: OnboardingMemory) => {
    setData((prev) => ({ ...prev, memory, completedSteps: [...new Set([...prev.completedSteps, "memory"])] }));
    await lifeApi.createMemory({
      title: memory.title,
      description: memory.description,
      date: memory.date,
      tags: memory.tags,
      type: "text",
      emotion: "nostalgia",
    });
  }, []);

  const saveJournalEntry = useCallback(async (entry: OnboardingJournalEntry) => {
    setData((prev) => ({ ...prev, journalEntry: entry, completedSteps: [...new Set([...prev.completedSteps, "journal"])] }));
    await journalApi.create({
      title: entry.title,
      content: entry.content,
      mood: entry.mood,
    });
  }, []);

  const saveDream = useCallback(async (dream: OnboardingDream) => {
    setData((prev) => ({ ...prev, dream, completedSteps: [...new Set([...prev.completedSteps, "dream"])] }));
    const boards = await visionApi.getBoards() as any[];
    let boardId = boards[0]?.id;
    if (!boardId) {
      const board = await visionApi.createBoard("My First Board") as any;
      boardId = board.id;
    }

    await visionApi.createVisionItem({
      boardId,
      title: dream.title,
      description: dream.description,
      motivation: "Created during onboarding",
      category: dream.category === "creativity" ? "personal" : dream.category,
      targetYear: new Date().getFullYear() + 1,
      tags: ["onboarding"],
      status: "dream",
    });
  }, []);

  const saveGoal = useCallback(async (goal: OnboardingGoal) => {
    setData((prev) => ({ ...prev, goal, completedSteps: [...new Set([...prev.completedSteps, "goal"])] }));
    await goalsApi.create({
      title: goal.title,
      description: goal.description,
      deadline: goal.deadline || undefined,
      category: "Personal",
    });
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
