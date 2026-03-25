// ===== TYPES =====
export interface Memory {
  id: string;
  title: string;
  description: string;
  date: string;
  chapter: 'childhood' | 'teenage' | 'university' | 'career' | 'milestone';
  tags: string[];
  imageUrl: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: 'happy' | 'grateful' | 'reflective' | 'motivated' | 'calm' | 'sad';
  tags: string[];
  imageUrl?: string;
}

export interface DreamCard {
  id: string;
  title: string;
  description: string;
  targetYear: number;
  motivation: string;
  imageUrl: string;
  category: 'personal' | 'travel' | 'career' | 'relationships' | 'health';
  convertedToGoal: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  deadline: string;
  progress: number;
  xpReward: number;
  subtasks: { id: string; title: string; done: boolean }[];
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  xp: number;
  type: 'daily' | 'weekly' | 'longterm';
  completed: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
}

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  level: number;
  levelTitle: string;
  sharedChallenges: number;
}

export interface UserProfile {
  name: string;
  bio: string;
  avatar: string;
  xp: number;
  level: number;
  levelTitle: string;
  memoriesCount: number;
  dreamsAchieved: number;
  countriesVisited: number;
  challengesCompleted: number;
  milestonesReached: number;
  joinDate: string;
}

// ===== LEVEL SYSTEM =====
export const LEVELS = [
  { level: 1, title: 'Wanderer', xpRequired: 0 },
  { level: 5, title: 'Explorer', xpRequired: 200 },
  { level: 10, title: 'Dream Builder', xpRequired: 500 },
  { level: 20, title: 'Pathfinder', xpRequired: 1200 },
  { level: 40, title: 'Life Architect', xpRequired: 3000 },
];

export function getLevelInfo(xp: number) {
  let current = LEVELS[0];
  let next = LEVELS[1];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xpRequired) {
      current = LEVELS[i];
      next = LEVELS[i + 1] || LEVELS[i];
      break;
    }
  }
  const progress = next === current ? 100 : ((xp - current.xpRequired) / (next.xpRequired - current.xpRequired)) * 100;
  return { current, next, progress: Math.min(progress, 100) };
}

// ===== MOCK USER =====
export const mockUser: UserProfile = {
  name: 'Tatiana',
  bio: 'Dreamer, explorer, story collector ✨',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
  xp: 785,
  level: 10,
  levelTitle: 'Dream Builder',
  memoriesCount: 47,
  dreamsAchieved: 8,
  countriesVisited: 12,
  challengesCompleted: 23,
  milestonesReached: 15,
  joinDate: '2023-06-15',
};

// ===== MOCK MEMORIES =====
export const mockMemories: Memory[] = [
  { id: '1', title: 'First day of school', description: 'I remember the butterflies in my stomach...', date: '2000-09-01', chapter: 'childhood', tags: ['school', 'milestone'], imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop' },
  { id: '2', title: 'Summer at grandma\'s', description: 'The smell of fresh cookies and garden roses', date: '2003-07-15', chapter: 'childhood', tags: ['family', 'summer'], imageUrl: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400&h=300&fit=crop' },
  { id: '3', title: 'First concert', description: 'The music vibrated through my whole body', date: '2010-06-20', chapter: 'teenage', tags: ['music', 'friends'], imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=300&fit=crop' },
  { id: '4', title: 'Graduation day', description: 'Years of hard work finally paid off', date: '2015-06-15', chapter: 'university', tags: ['milestone', 'achievement'], imageUrl: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=400&h=300&fit=crop' },
  { id: '5', title: 'First job offer', description: 'The call that changed everything', date: '2016-03-10', chapter: 'career', tags: ['career', 'milestone'], imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop' },
  { id: '6', title: 'Road trip across the coast', description: 'Windows down, music loud, no destination', date: '2018-08-05', chapter: 'milestone', tags: ['travel', 'adventure'], imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop' },
  { id: '7', title: 'Learning to paint', description: 'My first watercolor wasn\'t great, but it was mine', date: '2008-03-12', chapter: 'teenage', tags: ['art', 'growth'], imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop' },
  { id: '8', title: 'Moving to a new city', description: 'Everything was unfamiliar and thrilling', date: '2019-01-20', chapter: 'career', tags: ['adventure', 'milestone'], imageUrl: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&h=300&fit=crop' },
];

// ===== MOCK JOURNAL =====
export const mockJournalEntries: JournalEntry[] = [
  { id: '1', date: '2026-03-08', title: 'A beautiful Saturday', content: 'Today I took a long walk through the park. The cherry blossoms are starting to bloom and it reminded me of spring in Tokyo...', mood: 'grateful', tags: ['nature', 'reflection'], imageUrl: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=400&h=300&fit=crop' },
  { id: '2', date: '2026-03-07', title: 'New beginnings', content: 'Started reading a new book about mindfulness. It made me think about how often I rush through moments...', mood: 'reflective', tags: ['books', 'mindfulness'] },
  { id: '3', date: '2026-03-06', title: 'Cooking adventure', content: 'Made homemade pasta for the first time! It was messy but absolutely worth it.', mood: 'happy', tags: ['cooking', 'joy'], imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop' },
  { id: '4', date: '2026-03-05', title: 'Morning meditation', content: 'Found peace in 10 minutes of silence this morning. Need to do this more often.', mood: 'calm', tags: ['meditation', 'wellness'] },
];

// ===== MOCK DREAMS =====
export const mockDreams: DreamCard[] = [
  { id: '1', title: 'Visit Paris', description: 'Walk along the Seine at sunset', targetYear: 2027, motivation: 'Experience the city of light and art', imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=500&fit=crop', category: 'travel', convertedToGoal: false },
  { id: '2', title: 'Write a novel', description: 'Tell the story that\'s been in my heart', targetYear: 2028, motivation: 'Leave something meaningful behind', imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=400&fit=crop', category: 'personal', convertedToGoal: true },
  { id: '3', title: 'Run a marathon', description: 'Push my limits and cross that finish line', targetYear: 2027, motivation: 'Prove I can do anything I set my mind to', imageUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=350&fit=crop', category: 'health', convertedToGoal: true },
  { id: '4', title: 'Learn piano', description: 'Play my favorite songs', targetYear: 2026, motivation: 'Music is the language of the soul', imageUrl: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&h=450&fit=crop', category: 'personal', convertedToGoal: false },
  { id: '5', title: 'Northern Lights', description: 'Witness the aurora borealis', targetYear: 2027, motivation: 'Some things must be seen to be believed', imageUrl: 'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=400&h=500&fit=crop', category: 'travel', convertedToGoal: false },
  { id: '6', title: 'Start a garden', description: 'Grow my own flowers and vegetables', targetYear: 2026, motivation: 'Create beauty and nourishment from the earth', imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=380&fit=crop', category: 'personal', convertedToGoal: false },
];

// ===== MOCK GOALS =====
export const mockGoals: Goal[] = [
  { id: '1', title: 'Write 10 book chapters', description: 'Complete the first draft of my novel', deadline: '2026-12-31', progress: 40, xpReward: 25, subtasks: [{ id: 's1', title: 'Outline plot', done: true }, { id: 's2', title: 'Write chapter 1-5', done: true }, { id: 's3', title: 'Write chapter 6-10', done: false }] },
  { id: '2', title: 'Train for marathon', description: 'Follow a 16-week training plan', deadline: '2027-04-15', progress: 25, xpReward: 25, subtasks: [{ id: 's4', title: 'Start running 3x/week', done: true }, { id: 's5', title: 'Complete 10K', done: false }, { id: 's6', title: 'Complete half marathon', done: false }] },
  { id: '3', title: 'Learn 50 piano songs', description: 'Master a repertoire of beautiful pieces', deadline: '2026-09-30', progress: 60, xpReward: 25, subtasks: [{ id: 's7', title: 'Learn 10 beginner songs', done: true }, { id: 's8', title: 'Learn 20 intermediate', done: true }, { id: 's9', title: 'Learn 20 advanced', done: false }] },
];

// ===== MOCK QUESTS =====
export const mockQuests: Quest[] = [
  { id: '1', title: 'Write a reflection', description: 'Take 5 minutes to journal about your day', xp: 10, type: 'daily', completed: false },
  { id: '2', title: 'Express gratitude', description: 'Name 3 things you\'re grateful for', xp: 10, type: 'daily', completed: true },
  { id: '3', title: 'Go for a walk', description: 'Step outside and breathe fresh air', xp: 10, type: 'daily', completed: false },
  { id: '4', title: 'Upload a memory', description: 'Add a meaningful moment to your timeline', xp: 15, type: 'weekly', completed: false },
  { id: '5', title: 'Learn a new language', description: 'Complete a full language course', xp: 40, type: 'longterm', completed: false },
];

// ===== MOCK BADGES =====
export const mockBadges: Badge[] = [
  { id: '1', name: 'Reflector', description: 'Write 10 journal entries', icon: '📝', earned: true, earnedDate: '2025-12-10' },
  { id: '2', name: 'Explorer', description: 'Visit 5 new places', icon: '🧭', earned: true, earnedDate: '2026-01-05' },
  { id: '3', name: 'Gratitude', description: 'Complete 30 gratitude prompts', icon: '🙏', earned: true, earnedDate: '2026-02-20' },
  { id: '4', name: 'Courage', description: 'Face 5 fears', icon: '🦁', earned: false },
  { id: '5', name: 'Storyteller', description: 'Upload 50 memories', icon: '📖', earned: false },
  { id: '6', name: 'Dream Chaser', description: 'Achieve 10 dreams', icon: '⭐', earned: false },
];

// ===== MOCK FRIENDS =====
export const mockFriends: Friend[] = [
  { id: '1', name: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', level: 15, levelTitle: 'Dream Builder', sharedChallenges: 5 },
  { id: '2', name: 'Maya Chen', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face', level: 8, levelTitle: 'Explorer', sharedChallenges: 3 },
  { id: '3', name: 'Jordan Kim', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face', level: 22, levelTitle: 'Pathfinder', sharedChallenges: 8 },
  { id: '4', name: 'Sophia Lane', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face', level: 12, levelTitle: 'Dream Builder', sharedChallenges: 4 },
];

// ===== ANALYTICS DATA =====
export const lifeBalanceData = [
  { subject: 'Health', value: 75 },
  { subject: 'Career', value: 85 },
  { subject: 'Relationships', value: 70 },
  { subject: 'Growth', value: 90 },
  { subject: 'Adventure', value: 65 },
  { subject: 'Creativity', value: 80 },
];

export const moodTrendData = [
  { month: 'Oct', happy: 12, grateful: 8, reflective: 5, calm: 7 },
  { month: 'Nov', happy: 15, grateful: 10, reflective: 8, calm: 6 },
  { month: 'Dec', happy: 10, grateful: 12, reflective: 9, calm: 8 },
  { month: 'Jan', happy: 18, grateful: 14, reflective: 6, calm: 10 },
  { month: 'Feb', happy: 20, grateful: 16, reflective: 7, calm: 12 },
  { month: 'Mar', happy: 16, grateful: 11, reflective: 10, calm: 9 },
];

export const xpProgressData = [
  { month: 'Oct', xp: 120 },
  { month: 'Nov', xp: 280 },
  { month: 'Dec', xp: 410 },
  { month: 'Jan', xp: 540 },
  { month: 'Feb', xp: 670 },
  { month: 'Mar', xp: 785 },
];
